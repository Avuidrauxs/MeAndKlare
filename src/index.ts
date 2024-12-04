import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import klarebotRoutes from './klare-bot/routes';
import userRoutes from './user/routes';
import errorHandler from './middleware/errorHandler';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Apply Pino HTTP middleware for logging requests
// app.use(pinoHttp({ logger }));

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

app.use('/api', userRoutes);
app.use('/api', klarebotRoutes);

// Catch-all error handling middleware
app.use(errorHandler);

// Health check
app.get('/health', (_, res) => res.status(200).json({ status: 'ok' }));

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
