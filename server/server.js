/**
 * Public Service Commission (PSC) Kenya - Enterprise Production Backend Server
 * Zero external npm dependencies (pure native Node.js 22 APIs).
 * Implements:
 * - Asynchronous Ingestion Buffer (Kafka-style partitioned stream)
 * - CQRS Architecture (PostgreSQL Primary Cluster + Distributed Read Replicas)
 * - PgBouncer-Style Connection Pool Emulator
 * - Token Bucket Rate Limiting with HTTP 429 & Retry-After
 * - Idempotency Keys on Mutations (Redis-style TTL cache)
 * - Resilience Circuit Breakers (IPRS, KNEC, GHRIS, eCitizen SSO)
 * - Application-Level Field Encryption (ALFE AES-256-GCM under KMS HSM Key #82910)
 * - Structured JSON Logging, OpenTelemetry Distributed Tracing (W3C), and RED Metrics
 * - Kubernetes Probes (/healthz/live, /healthz/ready) & Prometheus Exporter (/api/v2/metrics)
 * - RFC 7807 Problem Details Error Contracts & OpenAPI 3.1 Contract (/api/v2/openapi.json)
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleRequest } from './routes.js';
import { obs } from './observability.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = process.env.PORT || 5000;

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Route API and Kubernetes Health Probes
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/healthz')) {
    return handleRequest(req, res, url);
  }

  // Static File Serving with security traversal check
  let filePath = path.join(ROOT_DIR, url.pathname === '/' ? 'index.html' : url.pathname);

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        filePath = path.join(ROOT_DIR, 'index.html');
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('\n============================================================');
  console.log('🇰🇪 PUBLIC SERVICE COMMISSION (PSC) KENYA');
  console.log('   National Recruitment & Selection Enterprise Production Backend');
  console.log('   Zero Trust (NIST SP 800-207) • Decoupled Kafka Stream Buffer');
  console.log('   CQRS Architecture • PgBouncer Pool • ALFE AES-256-GCM Encryption');
  console.log('============================================================');
  console.log(`🚀 Gateway Server:      http://localhost:${PORT}`);
  console.log(`📡 Telemetry & Health:  http://localhost:${PORT}/api/v2/health`);
  console.log(`☸️ Kubernetes Live:     http://localhost:${PORT}/healthz/live`);
  console.log(`☸️ Kubernetes Ready:    http://localhost:${PORT}/healthz/ready`);
  console.log(`📈 Prometheus Metrics:  http://localhost:${PORT}/api/v2/metrics`);
  console.log(`📋 OpenAPI 3.1 Schema:  http://localhost:${PORT}/api/v2/openapi.json`);
  console.log(`📥 Kafka Ingest Buffer: http://localhost:${PORT}/api/v2/applications/ingest (POST)`);
  console.log(`🔍 WORM Hash-Chain Log: http://localhost:${PORT}/api/v2/audit-log`);
  console.log('============================================================\n');

  obs.info('PSC Enterprise Backend Server initialized successfully', {
    metadata: { port: PORT, pid: process.pid, nodeVersion: process.version }
  });
});

// Graceful shutdown with in-flight drain
const shutdown = () => {
  console.log('\nGracefully terminating PSC Enterprise Server...');
  server.close(() => {
    console.log('All connections drained. Server stopped safely.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forceful shutdown timeout reached.');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
