import { Response, CookieOptions } from 'express';
import config from '../config/environment';

// Cookie configuration
const isProduction = config.nodeEnv === 'production';

// Default cookie options for JWT token
export const cookieOptions: CookieOptions = {
    httpOnly: true, // Cannot be accessed by JavaScript
    secure: isProduction, // Only HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
};

// Cookie options for clearing
export const clearCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
};

/**
 * Set JWT token as HttpOnly cookie
 */
export const setTokenCookie = (res: Response, token: string): void => {
    res.cookie('auth_token', token, cookieOptions);
};

/**
 * Clear JWT token cookie
 */
export const clearTokenCookie = (res: Response): void => {
    res.clearCookie('auth_token', clearCookieOptions);
};

/**
 * Get token from cookie or Authorization header
 * Supports both methods for backward compatibility
 */
export const getTokenFromRequest = (req: any): string | null => {
    // First try to get from cookie
    if (req.cookies?.auth_token) {
        return req.cookies.auth_token;
    }

    // Fallback to Authorization header (for backward compatibility and mobile apps)
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }

    return null;
};
