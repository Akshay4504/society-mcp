import { Request, Response, NextFunction } from 'express';
import { httpRequestCounter, httpRequestDurationHistogram } from '../utils/metrics';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    const method = req.method;
    const status = res.statusCode.toString();
    
    // Determine route path pattern to prevent label cardinality explosion
    let route = 'unknown';
    if (req.route) {
      route = `${req.baseUrl}${req.route.path}`;
    } else if (res.statusCode === 404) {
      route = 'not_found';
    } else {
      // Split query params to keep path clean
      route = req.originalUrl.split('?')[0] || 'unknown';
    }

    httpRequestCounter.labels(method, route, status).inc();
    httpRequestDurationHistogram.labels(method, route, status).observe(durationInSeconds);
  });

  next();
};
