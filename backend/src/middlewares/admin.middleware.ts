import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { forbiddenResponse } from '../utils/response.utils';

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    forbiddenResponse(res, 'Authentication required');
    return;
  }

  if (req.user.role !== 'admin') {
    forbiddenResponse(res, 'Admin access required');
    return;
  }

  next();
};
