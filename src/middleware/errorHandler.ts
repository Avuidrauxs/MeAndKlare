import { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: err.message,
  });
};

export default errorHandler;
