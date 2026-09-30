/**
 * PSCIMS 2.0 - Deep Observability Engine
 * Implements:
 * 1. Structured JSON Logging (Contextual metadata, ISO timestamps, trace correlation)
 * 2. Distributed Tracing (W3C TraceContext traceparent / trace_id / span_id)
 * 3. Actionable RED Metrics (Rate, Errors, Duration percentiles: p50, p90, p99)
 * 4. Prometheus Exposition Exporter (/api/v2/metrics)
 */

import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';

class ObservabilityEngine {
  constructor() {
    this.serviceName = 'psc-national-gateway';
    this.environment = process.env.NODE_ENV || 'production';
    
    // RED Metrics Storage
    this.metrics = {
      httpRequestsTotal: 0,
      httpErrorsTotal: 0,
      httpStatusCounts: { 200: 0, 202: 0, 204: 0, 400: 0, 404: 0, 429: 0, 500: 0, 503: 0 },
      latencies: [], // Sliding window of last 1,000 request durations (ms)
      maxLatenciesStored: 1000,
      endpointCounts: {},
      kafkaIngestRate: 0,
      kafkaQueueDepth: 0,
      circuitBreakerTrips: 0,
      startTime: Date.now()
    };
  }

  /**
   * Generate or extract W3C TraceContext
   * format: 00-${traceId}-${spanId}-01
   */
  extractOrCreateTrace(req) {
    const traceparent = req.headers['traceparent'] || req.headers['x-trace-id'];
    let traceId, parentSpanId;

    if (traceparent && traceparent.startsWith('00-')) {
      const parts = traceparent.split('-');
      if (parts.length >= 4) {
        traceId = parts[1];
        parentSpanId = parts[2];
      }
    }

    if (!traceId) {
      traceId = crypto.randomBytes(16).toString('hex');
    }
    const spanId = crypto.randomBytes(8).toString('hex');

    return {
      traceId,
      spanId,
      parentSpanId: parentSpanId || null,
      w3cHeader: `00-${traceId}-${spanId}-01`
    };
  }

  /**
   * Structured JSON Logger
   */
  log(level, message, context = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      service: this.serviceName,
      env: this.environment,
      message,
      traceId: context.traceId || undefined,
      spanId: context.spanId || undefined,
      userId: context.userId || undefined,
      method: context.method || undefined,
      path: context.path || undefined,
      statusCode: context.statusCode || undefined,
      durationMs: context.durationMs !== undefined ? parseFloat(context.durationMs.toFixed(2)) : undefined,
      metadata: context.metadata || undefined
    };

    // Clean undefined fields
    Object.keys(entry).forEach(k => entry[k] === undefined && delete entry[k]);
    
    // Output single-line JSON log to stdout/stderr
    const line = JSON.stringify(entry);
    if (level === 'error') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
    return entry;
  }

  info(msg, ctx) { return this.log('info', msg, ctx); }
  warn(msg, ctx) { return this.log('warn', msg, ctx); }
  error(msg, ctx) { return this.log('error', msg, ctx); }

  /**
   * Record request completion metrics
   */
  recordHttpMetric(method, path, statusCode, durationMs) {
    this.metrics.httpRequestsTotal++;
    if (statusCode >= 400) {
      this.metrics.httpErrorsTotal++;
    }

    const codeBucket = this.metrics.httpStatusCounts[statusCode] !== undefined 
      ? statusCode 
      : `${Math.floor(statusCode / 100)}xx`;
    this.metrics.httpStatusCounts[codeBucket] = (this.metrics.httpStatusCounts[codeBucket] || 0) + 1;

    // Endpoint counts
    const normalizedPath = path.split('?')[0].replace(/\/[0-9a-fA-F-]{8,}/g, '/:id');
    const endpointKey = `${method} ${normalizedPath}`;
    this.metrics.endpointCounts[endpointKey] = (this.metrics.endpointCounts[endpointKey] || 0) + 1;

    // Latency sliding window
    this.metrics.latencies.push(durationMs);
    if (this.metrics.latencies.length > this.metrics.maxLatenciesStored) {
      this.metrics.latencies.shift();
    }
  }

  /**
   * Calculate percentile latencies (p50, p90, p95, p99)
   */
  getLatencyPercentiles() {
    if (this.metrics.latencies.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0, avg: 0, count: 0 };
    }

    const sorted = [...this.metrics.latencies].sort((a, b) => a - b);
    const count = sorted.length;
    const p = (pct) => {
      const idx = Math.min(Math.floor((pct / 100) * count), count - 1);
      return parseFloat(sorted[idx].toFixed(2));
    };

    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const avg = parseFloat((sum / count).toFixed(2));

    return {
      p50: p(50),
      p90: p(90),
      p95: p(95),
      p99: p(99),
      avg,
      count
    };
  }

  /**
   * Prometheus exposition format generator
   */
  toPrometheusFormat() {
    const percentiles = this.getLatencyPercentiles();
    const uptimeSec = Math.floor((Date.now() - this.metrics.startTime) / 1000);

    let output = `# HELP psc_http_requests_total Total number of HTTP requests processed\n`;
    output += `# TYPE psc_http_requests_total counter\n`;
    output += `psc_http_requests_total{service="${this.serviceName}"} ${this.metrics.httpRequestsTotal}\n\n`;

    output += `# HELP psc_http_errors_total Total number of HTTP 4xx/5xx errors\n`;
    output += `# TYPE psc_http_errors_total counter\n`;
    output += `psc_http_errors_total{service="${this.serviceName}"} ${this.metrics.httpErrorsTotal}\n\n`;

    output += `# HELP psc_http_latency_ms HTTP request duration in milliseconds\n`;
    output += `# TYPE psc_http_latency_ms summary\n`;
    output += `psc_http_latency_ms{quantile="0.50"} ${percentiles.p50}\n`;
    output += `psc_http_latency_ms{quantile="0.90"} ${percentiles.p90}\n`;
    output += `psc_http_latency_ms{quantile="0.95"} ${percentiles.p95}\n`;
    output += `psc_http_latency_ms{quantile="0.99"} ${percentiles.p99}\n`;
    output += `psc_http_latency_ms_sum ${this.metrics.latencies.reduce((a, b) => a + b, 0).toFixed(2)}\n`;
    output += `psc_http_latency_ms_count ${percentiles.count}\n\n`;

    output += `# HELP psc_uptime_seconds Total seconds process has been running\n`;
    output += `# TYPE psc_uptime_seconds gauge\n`;
    output += `psc_uptime_seconds ${uptimeSec}\n`;

    return output;
  }
}

export const obs = new ObservabilityEngine();
