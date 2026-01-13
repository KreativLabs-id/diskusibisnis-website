import { Response, CookieOptions } from 'express';
import config from '../config/environment';

// Cookie configuration
const isProduction = config.nodeEnv === 'production';

// Default cookie options for JWT token
// Note: When frontend and backend are on different domains,
// we need sameSite: 'none' with secure: true for cross-origin cookies
export const cookieOptions: CookieOptions = {
    httpOnly: true, // Cannot be accessed by JavaScript
    secure: isProduction, // Only HTTPS in production
    // Use 'none' for cross-origin requests in production (different domains)
    // Use 'lax' for development (same origin)
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
};

// Cookie options for user_role (non-HttpOnly so middleware can read it)
export const userRoleCookieOptions: CookieOptions = {
    httpOnly: false, // Middleware needs to read this
    secure: isProduction, // Only HTTPS in production
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
};

// Cookie options for clearing
export const clearCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
};

// Cookie options for clearing user_role
export const clearUserRoleCookieOptions: CookieOptions = {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
};

/**
 * Set JWT token as HttpOnly cookie and user_role cookie for middleware
 */
export const setTokenCookie = (res: Response, token: string, role?: string): void => {
    res.cookie('auth_token', token, cookieOptions);
    // Also set user_role cookie for Next.js middleware to check admin access
    if (role) {
        res.cookie('user_role', role, userRoleCookieOptions);
    }
};

/**
 * Clear JWT token cookie and user_role cookie
 */
export const clearTokenCookie = (res: Response): void => {
    res.clearCookie('auth_token', clearCookieOptions);
    res.clearCookie('user_role', clearUserRoleCookieOptions);
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
