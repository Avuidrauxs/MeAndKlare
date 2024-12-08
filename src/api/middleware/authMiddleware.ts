/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../../core/types';
import { verifyToken } from '../../core/utils/auth';

declare global {
  namespace Express {
    // eslint-disable-next-line no-shadow
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).send('Invalid token.');
  }

  req.user = decoded as JWTPayload;
  next();
};
