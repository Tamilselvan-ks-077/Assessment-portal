import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendError = (
  res: Response,
  code = 'INTERNAL_ERROR',
  message = 'Internal server error',
  statusCode = 500,
  details?: any
): Response => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
    },
  });
};
