import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/environment';
import { AuthRequest, AuthUser } from '../types';
import { unauthorizedResponse } from '../utils/response.utils';

/**
 * Get token from cookie or Authorization header
 * Supports both methods for backward compatibility
 */
const extractToken = (req: AuthRequest): string | null => {
  // First try to get from cookie (more secure)
  if (req.cookies?.auth_token) {
    return req.cookies.auth_token;
  }

  // Fallback to Authorization header (for mobile apps, API clients)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  return null;
};

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractToken(req);

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
    const token = extractToken(req);

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

