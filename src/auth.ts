import jwt from 'jsonwebtoken';
import { JWTPayload } from './core/types';

const SECRET_KEY = 'your_secret_key';

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
