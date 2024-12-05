import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import klarebotRoutes from './klare-bot/routes';
import userRoutes from './user/routes';
import errorHandler from './middleware/errorHandler';
import { config } from './config';
import logger from './lib/logger';

dotenv.config();

const app = express();
const { port, env } = config.server;

// Apply Pino HTTP middleware for logging requests
if (env !== 'test') {
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

app.use('/api', userRoutes);
app.use('/api', klarebotRoutes);

// Catch-all error handling middleware
app.use(errorHandler);

// Health check
app.get('/health', (_, res) => res.status(200).json({ status: 'ok' }));

if (env !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
