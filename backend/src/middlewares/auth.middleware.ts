import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/environment';
import { AuthRequest, AuthUser } from '../types';
import { unauthorizedResponse } from '../utils/response.utils';

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      unauthorizedResponse(res, 'Authentication token required');
      return;
    }

    if (!config.jwt.secret) {
      throw new Error('JWT secret not configured');
    }

    const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    unauthorizedResponse(res, 'Invalid or expired token');
  }
};

export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token && config.jwt.secret) {
      const decoded = jwt.verify(token, config.jwt.secret) as AuthUser;
      req.user = decoded;
    }
    next();
  } catch (error) {
    // Token is invalid but we continue without user
    next();
  }
};

export const requireAuth = authenticateToken;
