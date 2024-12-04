import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JWTPayload } from './core/types';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET ?? 'secret';

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '1h' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
};
