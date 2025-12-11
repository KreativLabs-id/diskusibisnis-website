import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { rateLimitStore } from '../config/redis';
import { errorResponse } from '../utils/response.utils';

/**
 * Login rate limiter to prevent brute force attacks
 * Limits login attempts per IP and per email
 */
export const loginRateLimiter = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const email = req.body?.email?.toLowerCase() || '';

        // Create keys for IP and email
        const ipKey = `login:ip:${ip}`;
        const emailKey = email ? `login:email:${email}` : null;

        // Check IP rate limit (10 attempts per 15 minutes)
        const ipResult = await rateLimitStore.incrementAndCheck(ipKey, 10, 900000);

        if (ipResult.isLocked) {
            const waitMinutes = ipResult.lockedUntil
                ? Math.ceil((ipResult.lockedUntil.getTime() - Date.now()) / 60000)
                : 15;

            errorResponse(
                res,
                `Terlalu banyak percobaan login dari IP Anda. Silakan coba lagi dalam ${waitMinutes} menit.`,
                429
            );
            return;
        }

        // Check email rate limit if email provided (5 attempts per 15 minutes)
        if (emailKey) {
            const emailResult = await rateLimitStore.incrementAndCheck(emailKey, 5, 900000);

            if (emailResult.isLocked) {
                const waitMinutes = emailResult.lockedUntil
                    ? Math.ceil((emailResult.lockedUntil.getTime() - Date.now()) / 60000)
                    : 15;

                errorResponse(
                    res,
                    `Terlalu banyak percobaan login untuk email ini. Silakan coba lagi dalam ${waitMinutes} menit.`,
                    429
                );
                return;
            }

            // Store email key in request for later reset on success
            req.rateLimitKeys = { ipKey, emailKey };
        } else {
            req.rateLimitKeys = { ipKey };
        }

        next();
    } catch (error) {
        console.error('Login rate limiter error:', error);
        // Don't block login on rate limiter error, just log it
        next();
    }
};

/**
 * Reset rate limit on successful login
 * Call this after successful login
 */
export const resetLoginRateLimit = async (ip: string, email: string): Promise<void> => {
    try {
        const ipKey = `login:ip:${ip}`;
        const emailKey = `login:email:${email.toLowerCase()}`;

        await rateLimitStore.reset(ipKey);
        await rateLimitStore.reset(emailKey);
    } catch (error) {
        console.error('Reset login rate limit error:', error);
    }
};

/**
 * Password reset rate limiter
 * Limits password reset requests per email (3 per hour)
 */
export const passwordResetRateLimiter = async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const email = req.body?.email?.toLowerCase() || '';

        if (!email) {
            next();
            return;
        }

        const key = `password-reset:${email}`;
        const result = await rateLimitStore.incrementAndCheck(key, 3, 3600000); // 3 attempts per hour

        if (result.isLocked) {
            // Don't reveal if email exists, just say request sent
            // But actually don't process it
            console.log(`Password reset rate limit exceeded for: ${email}`);
        }

        next();
    } catch (error) {
        console.error('Password reset rate limiter error:', error);
        next();
    }
};

/**
 * OTP request rate limiter
 * Limits OTP requests per email (5 per 10 minutes)
 */
export const otpRateLimiter = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const email = req.body?.email?.toLowerCase() || '';

        if (!email) {
            next();
            return;
        }

        const key = `otp:${email}`;
        const result = await rateLimitStore.incrementAndCheck(key, 5, 600000); // 5 attempts per 10 minutes

        if (result.isLocked) {
            const waitMinutes = result.lockedUntil
                ? Math.ceil((result.lockedUntil.getTime() - Date.now()) / 60000)
                : 10;

            errorResponse(
                res,
                `Terlalu banyak permintaan OTP. Silakan coba lagi dalam ${waitMinutes} menit.`,
                429
            );
            return;
        }

        next();
    } catch (error) {
        console.error('OTP rate limiter error:', error);
        next();
    }
};
