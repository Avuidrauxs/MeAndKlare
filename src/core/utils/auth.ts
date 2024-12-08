import jwt from 'jsonwebtoken';
import { config } from '../config';

const SECRET_KEY = config.auth.jwtSecret;

export const generateToken = (userId: string) => {
  return jwt.sign({ userId }, SECRET_KEY, { expiresIn: '8h' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
};
