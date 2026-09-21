import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[]) || [];
    sendError(
      res,
      'UNIQUE_CONSTRAINT_VIOLATION',
      `A record with this ${target.join(', ')} already exists`,
      409,
      err.meta
    );
    return;
  }

  if (err.code === 'P2025') {
    sendError(res, 'NOT_FOUND', 'Record not found', 404);
    return;
  }

  // Catch-all internal error
  logger.error(`[Unhandled Error] ${req.method} ${req.originalUrl}:`, err);

  const isProduction = env.NODE_ENV === 'production';
  sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    isProduction ? 'An unexpected error occurred' : err.message || 'Internal server error',
    500,
    isProduction ? undefined : err.stack
  );
};
