import express from 'express';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import textGeneratorRoutes from './text-generator/routes';
import userRoutes from './user/routes';
import errorHandler from './middleware/errorHandler';
import logger from './lib/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Apply Pino HTTP middleware for logging requests
app.use(pinoHttp({ logger }));

app.use(express.json({ limit: '10mb', type: 'application/json' }));

// Entry endpoint that says "Hello World"
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.use(express.urlencoded({ extended: true }));
app.use('/api', textGeneratorRoutes);
app.use('/api', userRoutes);

// Catch-all error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
