import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response.utils';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    errorResponse(res, 'Validation error', 400, err.message);
    return;
  }

  if (err.name === 'UnauthorizedError') {
    errorResponse(res, 'Unauthorized', 401, err.message);
    return;
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    errorResponse(res, 'Duplicate entry', 409, 'Resource already exists');
    return;
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    errorResponse(res, 'Invalid reference', 400, 'Referenced resource does not exist');
    return;
  }

  errorResponse(res, 'Internal server error', 500, err.message);
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  errorResponse(res, 'Route not found', 404, `Cannot ${req.method} ${req.path}`);
};
