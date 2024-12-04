// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';
import express from 'express';
import { generateToken } from './auth';
import { authMiddleware } from './middleware/authMiddleware';

const app = express();
app.use(express.json());

app.post('/login', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).send('User ID is required');
  }
  const token = generateToken(userId);
  res.send({ token });
});

app.get('/protected', authMiddleware, (req, res) => {
  res.send('This is a protected route');
});

describe('POST /login', () => {
  it('should return a token', async () => {
    const response = await request(app).post('/login').send({ userId: '123' });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});

describe('GET /protected', () => {
  it('should return 401 if no token is provided', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
  });

  it('should return 200 if a valid token is provided', async () => {
    const token = generateToken('123');
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.text).toBe('This is a protected route');
  });
});
