import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';
import { ContextServiceError, ValidationError } from '../core/errors';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('We are here 4');
  logger.error(err.stack);
  if (err instanceof ValidationError || err instanceof ContextServiceError) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: err.message,
  });
};

export default errorHandler;
