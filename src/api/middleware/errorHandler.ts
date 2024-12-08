import { Request, Response, NextFunction } from 'express';
import logger from '../../core/lib/logger';
import {
  ContextServiceError,
  UserServiceError,
  ValidationError,
} from '../../core/errors';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err.stack);
  if (err instanceof ValidationError || err instanceof ContextServiceError) {
    return res.status(400).json({ message: err.message });
  }
  if (err instanceof UserServiceError) {
    return res.status(401).json({ message: err.message });
  }
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: err.message,
  });
};

export default errorHandler;
