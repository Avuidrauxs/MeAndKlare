import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './authMiddleware'; // Adjust the import path as necessary
import { config } from '../../core/config';

const app = express();
app.use(express.json());

const JWT_SECRET = 'your_jwt_secret'; // Use a consistent secret for testing

// Dummy route to test the middleware
app.get('/protected', authMiddleware, (req: Request, res: Response) => {
  res.status(200).send('Protected content');
});

describe('authMiddleware', () => {
  it('should return 401 if no token is provided', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.text).toBe('Access denied. No token provided.');
  });

  it('should return 401 if an invalid token is provided', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidtoken');
    expect(response.status).toBe(401);
    expect(response.text).toBe('Invalid token.');
  });

  it('should return 200 if a valid token is provided', async () => {
    const token = jwt.sign({ userId: 'test-user-id' }, config.auth.jwtSecret);
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.text).toBe('Protected content');
  });
});