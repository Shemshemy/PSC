/**
 * PSCIMS 2.0 - Defensive Engineering & Resilience Engine
 * Implements:
 * 1. Circuit Breakers with Graceful Fallbacks (Envoy / Resilience4j pattern)
 * 2. Idempotency Key Manager (Prevents duplicate submissions & race conditions)
 * 3. Token Bucket Rate Limiter with Backpressure (DDoS & traffic spike mitigation)
 * 4. Database Connection Pool Manager (PgBouncer-style connection preservation)
 */

import { obs } from './observability.js';

// ==========================================
// 1. CIRCUIT BREAKER WITH STATE MACHINE
// ==========================================
export class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 3;
    this.recoveryTimeoutMs = options.recoveryTimeoutMs || 10000; // 10s
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.successCount = 0;
    this.mockLatencyMs = options.mockLatencyMs || 35;
  }

  async execute(action, fallback) {
    const now = Date.now();

    // Check if recovery timeout elapsed to try HALF_OPEN
    if (this.state === 'OPEN') {
      if (now - this.lastFailureTime > this.recoveryTimeoutMs) {
        this.state = 'HALF_OPEN';
        obs.warn(`Circuit breaker '${this.name}' transitioned from OPEN to HALF_OPEN.`);
      } else {
        obs.warn(`Circuit breaker '${this.name}' is OPEN. Triggering instant fallback without network hang.`);
        return fallback({ reason: 'CIRCUIT_OPEN', service: this.name });
      }
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure(err);
      return fallback({ reason: 'DOWNSTREAM_ERROR', service: this.name, error: err.message });
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 2) {
        this.state = 'CLOSED';
        obs.info(`Circuit breaker '${this.name}' recovered. State reset to CLOSED.`);
      }
    }
  }

  onFailure(err) {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    obs.metrics.circuitBreakerTrips++;

    if (this.failureCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      obs.error(`Circuit breaker '${this.name}' TRIPPED to OPEN state!`, {
        metadata: { failureCount: this.failureCount, error: err.message }
      });
    }
  }

  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      latency: `${this.mockLatencyMs}ms`,
      failureRate: `${((this.failureCount / Math.max(1, this.failureCount + 10)) * 100).toFixed(1)}%`
    };
  }
}

// Instantiate Circuit Breakers for Downstream Civic Services
export const circuitBreakers = {
  iprs: new CircuitBreaker('IPRS_KYC_GATEWAY', { mockLatencyMs: 42 }),
  knec: new CircuitBreaker('KNEC_EXAM_VALIDATOR', { mockLatencyMs: 88 }),
  ghris: new CircuitBreaker('GHRIS_PUBLIC_SERVICE_DATABASE', { mockLatencyMs: 35 }),
  ecitizenSso: new CircuitBreaker('ECITIZEN_OIDC_SSO', { mockLatencyMs: 28 })
};

// ==========================================
// 2. IDEMPOTENCY KEY MANAGER
// ==========================================
class IdempotencyManager {
  constructor() {
    this.cache = new Map(); // key -> { response, statusCode, timestamp }
    this.ttlMs = 24 * 60 * 60 * 1000; // 24 hours
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return entry;
  }

  set(key, statusCode, response) {
    this.cache.set(key, {
      statusCode,
      response,
      timestamp: Date.now()
    });
  }
}

export const idempotency = new IdempotencyManager();

// ==========================================
// 3. TOKEN BUCKET RATE LIMITER & BACKPRESSURE
// ==========================================
class TokenBucketRateLimiter {
  constructor(options = {}) {
    this.capacity = options.capacity || 60; // Max burst (60 requests)
    this.refillRate = options.refillRate || 1; // 1 token per second = 60/min
    this.buckets = new Map(); // clientId -> { tokens, lastRefill }
  }

  consume(clientId) {
    const now = Date.now();
    let bucket = this.buckets.get(clientId);

    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.buckets.set(clientId, bucket);
    }

    // Refill tokens based on elapsed time
    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = elapsedSeconds * this.refillRate;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        limit: this.capacity,
        resetSec: Math.ceil((this.capacity - bucket.tokens) / this.refillRate)
      };
    }

    return {
      allowed: false,
      remaining: 0,
      limit: this.capacity,
      retryAfterSec: Math.ceil(1 / this.refillRate),
      resetSec: Math.ceil((this.capacity - bucket.tokens) / this.refillRate)
    };
  }
}

export const rateLimiter = new TokenBucketRateLimiter();

// ==========================================
// 4. DATABASE CONNECTION POOL (PgBouncer Style)
// ==========================================
class DatabaseConnectionPool {
  constructor(options = {}) {
    this.maxConnections = options.maxConnections || 20;
    this.activeConnections = 2; // Baseline connections
    this.idleConnections = 18;
    this.waitQueueDepth = 0;
    this.poolAcquisitionAvgMs = 1.2;
    this.totalAcquired = 0;
  }

  async acquire() {
    this.totalAcquired++;
    if (this.idleConnections > 0) {
      this.idleConnections--;
      this.activeConnections++;
      return {
        release: () => {
          this.activeConnections--;
          this.idleConnections++;
        }
      };
    }

    // Simulate queuing when pool is saturated
    this.waitQueueDepth++;
    await new Promise(resolve => setTimeout(resolve, 5));
    this.waitQueueDepth--;
    return { release: () => {} };
  }

  getMetrics() {
    return {
      poolEngine: 'PgBouncer Native Pool Emulator',
      maxConnections: this.maxConnections,
      activeConnections: this.activeConnections,
      idleConnections: this.idleConnections,
      waitQueueDepth: this.waitQueueDepth,
      poolAcquisitionAvgMs: `${this.poolAcquisitionAvgMs}ms`,
      totalQueriesServiced: this.totalAcquired
    };
  }
}

export const dbPool = new DatabaseConnectionPool();
