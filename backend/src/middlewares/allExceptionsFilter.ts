// src/middlewares/allExceptionsFilter.ts
import { HttpException } from '@/utils/HttpException';
import { Request, Response, NextFunction } from 'express';


export const allExceptionsFilter = (
  exception: any,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const status =
    exception instanceof HttpException
      ? exception.getStatus()
      : exception.statusCode || 500;

  const message =
    exception instanceof HttpException
      ? exception.getResponse()
      : exception.message || 'Internal server error';

  const stack = exception.stack || null;

  // Log the error
  console.log(message);
  console.error('Error:', exception);

  response.status(status).json({
    statusCode: status,
    path: request.url,
    timestamp: new Date().toISOString(),
    message,
    ...(process.env.NODE_ENV === 'development' && { stack }), // Only show stack in development
  });
};
