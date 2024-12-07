// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest';
import express from 'express';
import { generateToken } from './auth';
import { authMiddleware } from './middleware/authMiddleware';
import app from '.';

describe('GET /metrics', () => {
  it('should return 200 and metrics data', async () => {
    const response = await request(app).get('/metrics');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('memoryUsage');
    expect(response.body).toHaveProperty('timestamp');
  });
});
describe('GET /health', () => {
  it('should return 200 and status UP', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('UP');
  });
});

describe('GET /', () => {
  it('should return 200 and Hello World', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello World');
  });
});
