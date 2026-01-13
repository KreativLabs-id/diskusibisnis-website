/**
 * CSRF Protection using Signed Double Submit Cookie Pattern
 * 
 * UPDATED based on OWASP 2024 recommendations:
 * - The "Naive Double Submit Cookie" is DISCOURAGED
 * - We now use "Signed Double-Submit Cookie" which binds token to session
 * 
 * How it works:
 * 1. Server generates a random token
 * 2. Token is HMAC-signed with server secret + session identifier
 * 3. Signed token is set as cookie AND returned to client
 * 4. Client sends token in header/body
 * 5. Server validates signature AND session binding
 * 
 * References:
 * - OWASP CSRF Prevention: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */

import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthRequest } from '../types';

// CSRF Token configuration
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32; // 256 bits
const CSRF_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

// Get HMAC secret from environment or generate one
// IMPORTANT: In production, this should be set via environment variable
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

// Routes exempt from CSRF protection (read-only endpoints)
const CSRF_EXEMPT_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// API routes that should be exempt (for mobile apps using header auth)
const CSRF_EXEMPT_PATHS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/google',
    '/api/auth/logout',
];

/**
 * Generate a cryptographically secure CSRF token
 */
function generateRandomToken(): string {
    return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Create a signed CSRF token bound to session/user
 * 
 * Token format: randomToken:timestamp:signature
 * 
 * The signature is HMAC of: randomToken + timestamp + sessionId
 * This ensures:
 * - Token cannot be forged without server secret
 * - Token is bound to specific session
 * - Token has timestamp for potential expiration
 */
function createSignedToken(sessionId: string | undefined): string {
    const randomToken = generateRandomToken();
    const timestamp = Date.now().toString();

    // If no session, use a constant (less secure but still provides CSRF protection)
    const sessionBinding = sessionId || 'no-session';

    // Create HMAC signature
    const hmac = crypto.createHmac('sha256', CSRF_SECRET);
    hmac.update(`${randomToken}:${timestamp}:${sessionBinding}`);
    const signature = hmac.digest('hex');

    // Return token in format: randomToken:timestamp:signature
    return `${randomToken}:${timestamp}:${signature}`;
}

/**
 * Verify a signed CSRF token
 * 
 * @returns true if token is valid, false otherwise
 */
function verifySignedToken(token: string, sessionId: string | undefined): boolean {
    try {
        const parts = token.split(':');
        if (parts.length !== 3) {
            return false;
        }

        const [randomToken, timestamp, providedSignature] = parts;

        // Check timestamp is valid and not too old (optional - can add expiration)
        const tokenTime = parseInt(timestamp, 10);
        if (isNaN(tokenTime)) {
            return false;
        }

        // Optional: Check if token is too old (e.g., > 24 hours)
        const maxAge = CSRF_COOKIE_MAX_AGE;
        if (Date.now() - tokenTime > maxAge) {
            console.warn('CSRF: Token expired');
            return false;
        }

        // Recreate the signature with same session binding
        const sessionBinding = sessionId || 'no-session';
        const hmac = crypto.createHmac('sha256', CSRF_SECRET);
        hmac.update(`${randomToken}:${timestamp}:${sessionBinding}`);
        const expectedSignature = hmac.digest('hex');

        // Use timing-safe comparison
        const expectedBuffer = Buffer.from(expectedSignature);
        const providedBuffer = Buffer.from(providedSignature);

        if (expectedBuffer.length !== providedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
    } catch (error) {
        console.error('CSRF: Token verification error', error);
        return false;
    }
}

/**
 * Get session identifier from request
 * This is used to bind CSRF token to specific session
 */
function getSessionId(req: AuthRequest): string | undefined {
    // Try to get session ID from various sources:
    // 1. Authenticated user ID (if logged in)
    if (req.user?.id) {
        return req.user.id;
    }

    // 2. Session cookie (if using session-based auth)
    const sessionCookie = req.cookies['session'] || req.cookies['connect.sid'];
    if (sessionCookie) {
        return sessionCookie;
    }

    // 3. Auth token hash (if JWT is present in cookie)
    const authToken = req.cookies['auth_token'];
    if (authToken) {
        // Use hash of token to avoid storing sensitive data
        return crypto.createHash('sha256').update(authToken).digest('hex').substring(0, 16);
    }

    // 4. No session - use IP + User-Agent as fallback (less secure)
    // This provides some protection but is not as strong
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const ua = req.get('User-Agent') || 'unknown';
    return crypto.createHash('sha256').update(`${ip}:${ua}`).digest('hex').substring(0, 16);
}

/**
 * CSRF Token Generator Middleware
 * Sets a signed CSRF token cookie on every response
 */
export const csrfTokenGenerator = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const sessionId = getSessionId(req);

    // Check if CSRF token cookie already exists and is valid
    const existingToken = req.cookies[CSRF_COOKIE_NAME];
    let csrfToken: string;

    if (existingToken && verifySignedToken(existingToken, sessionId)) {
        // Existing token is valid, reuse it
        csrfToken = existingToken;
    } else {
        // Generate new signed token
        csrfToken = createSignedToken(sessionId);
    }

    // Set the CSRF cookie
    // This cookie is NOT HttpOnly so JavaScript can read it
    res.cookie(CSRF_COOKIE_NAME, csrfToken, {
        httpOnly: false, // Must be readable by JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // Prevent CSRF via cross-site requests
        maxAge: CSRF_COOKIE_MAX_AGE,
        path: '/',
    });

    // Also expose token in response header for initial page loads
    res.setHeader('X-CSRF-Token', csrfToken);

    next();
};

/**
 * CSRF Validation Middleware
 * Validates the signed token from header/body against cookie
 */
export const csrfValidator = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    // Skip validation for exempt methods (GET, HEAD, OPTIONS)
    if (CSRF_EXEMPT_METHODS.includes(req.method)) {
        next();
        return;
    }

    // Skip validation for exempt paths (login, register, etc.)
    const isExempt = CSRF_EXEMPT_PATHS.some(path => req.path.startsWith(path));
    if (isExempt) {
        next();
        return;
    }

    // Skip CSRF validation if request has Authorization header (API/mobile clients)
    // These clients can't be victims of CSRF attacks in the traditional sense
    const hasAuthHeader = req.headers['authorization']?.startsWith('Bearer ');
    if (hasAuthHeader) {
        next();
        return;
    }

    // Get CSRF token from cookie
    const cookieToken = req.cookies[CSRF_COOKIE_NAME];

    // Get CSRF token from header or body
    const headerToken = req.headers[CSRF_HEADER_NAME] as string;
    const bodyToken = req.body?._csrf;
    const providedToken = headerToken || bodyToken;

    // Validate tokens exist
    if (!cookieToken) {
        console.warn(`CSRF: Missing cookie token for ${req.method} ${req.path}`);
        res.status(403).json({
            success: false,
            message: 'Security validation failed. Please refresh the page and try again.',
        });
        return;
    }

    if (!providedToken) {
        console.warn(`CSRF: Missing header/body token for ${req.method} ${req.path}`);
        res.status(403).json({
            success: false,
            message: 'Security validation failed. Please refresh the page and try again.',
        });
        return;
    }

    // Tokens must match exactly (both cookie and header should have same signed token)
    // Use timing-safe comparison
    const cookieBuffer = Buffer.from(cookieToken);
    const providedBuffer = Buffer.from(providedToken);

    if (cookieBuffer.length !== providedBuffer.length) {
        console.warn(`CSRF: Token length mismatch for ${req.method} ${req.path}`);
        res.status(403).json({
            success: false,
            message: 'Security validation failed. Please refresh the page and try again.',
        });
        return;
    }

    if (!crypto.timingSafeEqual(cookieBuffer, providedBuffer)) {
        console.warn(`CSRF: Token value mismatch for ${req.method} ${req.path}`);
        res.status(403).json({
            success: false,
            message: 'Security validation failed. Please refresh the page and try again.',
        });
        return;
    }

    // Verify the signed token is valid (correct signature and session binding)
    const sessionId = getSessionId(req);
    if (!verifySignedToken(providedToken, sessionId)) {
        console.warn(`CSRF: Invalid token signature for ${req.method} ${req.path}`);
        res.status(403).json({
            success: false,
            message: 'Security validation failed. Please refresh the page and try again.',
        });
        return;
    }

    // All validations passed - proceed
    next();
};

/**
 * Combined CSRF middleware
 */
export const csrfProtection = [csrfTokenGenerator, csrfValidator];

/**
 * Get CSRF token endpoint
 * Frontend can call this to get a fresh token
 */
export const getCSRFToken = (
    req: AuthRequest,
    res: Response
): void => {
    const sessionId = getSessionId(req);
    let csrfToken = req.cookies[CSRF_COOKIE_NAME];

    // Verify existing token or create new one
    if (!csrfToken || !verifySignedToken(csrfToken, sessionId)) {
        csrfToken = createSignedToken(sessionId);
        res.cookie(CSRF_COOKIE_NAME, csrfToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: CSRF_COOKIE_MAX_AGE,
            path: '/',
        });
    }

    res.json({
        success: true,
        data: {
            token: csrfToken,
        },
    });
};

export default {
    csrfTokenGenerator,
    csrfValidator,
    csrfProtection,
    getCSRFToken,
    CSRF_COOKIE_NAME,
    CSRF_HEADER_NAME,
};
