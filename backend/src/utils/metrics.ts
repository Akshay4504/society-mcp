import client from 'prom-client';

// Collect default metrics (CPU, Memory, Event loop lag, etc.)
client.collectDefaultMetrics({
  register: client.register,
});

// HTTP Requests Counter
export const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests processed',
  labelNames: ['method', 'route', 'status'],
});

// HTTP Request Duration Histogram
export const httpRequestDurationHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5, 10], // Buckets in seconds
});

// MongoDB Connection Gauge
export const mongodbConnectionStatusGauge = new client.Gauge({
  name: 'mongodb_connection_status',
  help: 'MongoDB Connection Status (1 for up, 0 for down)',
});

export const register = client.register;
