import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database';
import apiRouter from './routes';
import { loggerMiddleware } from './middlewares/logger.middleware';
import { errorMiddleware } from './middlewares/error.middleware';
import { metricsMiddleware } from './middlewares/metrics.middleware';
import { register, mongodbConnectionStatusGauge } from './utils/metrics';
import { logger } from './utils/logger';

// Load environmental parameters
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware registration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging & metrics collection middlewares
app.use(loggerMiddleware);
app.use(metricsMiddleware);

// Prometheus Metrics Endpoint (Internal Scraper target)
app.get('/metrics', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 1 : 0;
    mongodbConnectionStatusGauge.set(dbStatus);
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

// Routing tree
app.use('/api/v1', apiRouter);

// Enhanced Health check endpoint checking DB connectivity
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'up' : 'down';
  const statusCode = dbStatus === 'up' ? 200 : 503;
  res.status(statusCode).json({
    status: dbStatus === 'up' ? 'healthy' : 'unhealthy',
    timestamp: new Date(),
    services: {
      database: dbStatus,
    }
  });
});

// Centralized error handler middleware
app.use(errorMiddleware as any);

// Boot procedure
const startServer = async () => {
  await connectDatabase();
  app.listen(PORT, () => {
    logger.info(`[Server] SMM Backend server is running on http://localhost:${PORT}`);
  });
};

startServer();

export default app;
