/* eslint-disable import/no-extraneous-dependencies */
import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import klarebotRoutes from './api/klare-chat-bot/routes';
import userRoutes from './api/user/routes';
import contextRoutes from './api/context/routes';
import errorHandler from './api/middleware/errorHandler';
import { config } from './core/config';
import logger from './core/lib/logger';

dotenv.config();

const app = express();
const { port, env } = config.server;

// Apply Pino HTTP middleware for logging requests
if (env === 'production') {
  app.use(pinoHttp({ logger }));
}

// Middleware
app.use(helmet());
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

app.use(express.json({ limit: '10mb', type: 'application/json' }));
app.use(express.urlencoded({ extended: true }));

// Entry endpoint that says "Hello World"
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: Date.now(),
  };
  res.status(200).json(metrics);
});

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/message', klarebotRoutes);
app.use('/api/v1/context', contextRoutes);

// Catch-all error handling middleware
app.use(errorHandler);

if (env !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
