/**
 * Security Middleware
 * Advanced security middleware for Express
 * 
 * Features:
 * - Suspicious request detection
 * - Bot/Scanner blocking
 * - SQL Injection pattern detection
 * - XSS pattern detection
 * - Path traversal detection
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { containsSQLInjection, containsXSS, containsPathTraversal } from '../lib/security';
import { logSecurityEvent } from './audit.middleware';

// Suspicious User-Agent patterns (security scanners, bots)
const BLOCKED_USER_AGENTS = [
    /sqlmap/i,
    /nikto/i,
    /burp\s?suite/i,
    /nmap/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i,
    /w3af/i,
    /arachni/i,
    /skipfish/i,
    /wpscan/i,
    /joomscan/i,
    /masscan/i,
    /zgrab/i,
    /python-requests/i,
    /python-urllib/i,
    /curl\/[0-9]/i, // Block raw curl with version
    /wget/i,
    /libwww-perl/i,
    /gobuster/i,
    /dirbuster/i,
    /dirb/i,
    /ffuf/i,
    /nuclei/i,
    /httpx/i,
];

// Suspicious request headers
const SUSPICIOUS_HEADERS = [
    'x-forwarded-host',
    'x-original-url',
    'x-rewrite-url',
];

// Paths that should never be accessed
const BLOCKED_PATHS = [
    /\.\.\//, // Path traversal
    /\.env/i,
    /\.git/i,
    /\.svn/i,
    /\.hg/i,
    /wp-admin/i,
    /wp-login/i,
    /wp-content/i,
    /phpmyadmin/i,
    /admin\.php/i,
    /shell\.php/i,
    /c99\.php/i,
    /r57\.php/i,
    /xmlrpc\.php/i,
    /\.htaccess/i,
    /\.htpasswd/i,
    /web\.config/i,
    /\/etc\/passwd/i,
    /\/etc\/shadow/i,
    /\/proc\//i,
    /\.bak$/i,
    /\.backup$/i,
    /\.sql$/i,
    /\.sql\.gz$/i,
    /dump\.sql/i,
    /backup\.sql/i,
    /\.log$/i,
];

/**
 * Block requests from known security scanners and bots
 */
export const blockSuspiciousUserAgents = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const userAgent = req.get('User-Agent') || '';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // Block empty User-Agent in production
    if (!userAgent && process.env.NODE_ENV === 'production') {
        logSecurityEvent({
            type: 'blocked_request',
            ip,
            reason: 'Empty User-Agent',
            path: req.path,
            method: req.method,
        });

        res.status(403).json({
            success: false,
            message: 'Forbidden',
        });
        return;
    }

    // Check against blocked patterns
    for (const pattern of BLOCKED_USER_AGENTS) {
        if (pattern.test(userAgent)) {
            logSecurityEvent({
                type: 'blocked_request',
                ip,
                reason: `Blocked User-Agent: ${userAgent}`,
                path: req.path,
                method: req.method,
            });

            res.status(403).json({
                success: false,
                message: 'Forbidden',
            });
            return;
        }
    }

    next();
};

/**
 * Block requests to suspicious paths
 */
export const blockSuspiciousPaths = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const path = req.path.toLowerCase();
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    for (const pattern of BLOCKED_PATHS) {
        if (pattern.test(path)) {
            logSecurityEvent({
                type: 'blocked_request',
                ip,
                reason: `Blocked path pattern: ${path}`,
                path: req.path,
                method: req.method,
            });

            // Return 404 instead of 403 to not reveal protection
            res.status(404).json({
                success: false,
                message: 'Not Found',
            });
            return;
        }
    }

    next();
};

/**
 * Detect and block SQL injection attempts
 */
export const detectSQLInjection = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // Check query parameters
    for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string' && containsSQLInjection(value)) {
            logSecurityEvent({
                type: 'sql_injection_attempt',
                ip,
                reason: `SQL injection in query param: ${key}`,
                path: req.path,
                method: req.method,
                userId: req.user?.id,
            });

            res.status(400).json({
                success: false,
                message: 'Invalid input detected',
            });
            return;
        }
    }

    // Check body
    if (req.body && typeof req.body === 'object') {
        const checkObject = (obj: any, prefix = ''): boolean => {
            for (const [key, value] of Object.entries(obj)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;

                if (typeof value === 'string' && containsSQLInjection(value)) {
                    logSecurityEvent({
                        type: 'sql_injection_attempt',
                        ip,
                        reason: `SQL injection in body: ${fullKey}`,
                        path: req.path,
                        method: req.method,
                        userId: req.user?.id,
                    });
                    return true;
                }

                if (typeof value === 'object' && value !== null) {
                    if (checkObject(value, fullKey)) {
                        return true;
                    }
                }
            }
            return false;
        };

        if (checkObject(req.body)) {
            res.status(400).json({
                success: false,
                message: 'Invalid input detected',
            });
            return;
        }
    }

    next();
};

/**
 * Detect and sanitize XSS attempts
 */
export const detectXSS = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // Check query parameters
    for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string' && containsXSS(value)) {
            logSecurityEvent({
                type: 'xss_attempt',
                ip,
                reason: `XSS in query param: ${key}`,
                path: req.path,
                method: req.method,
                userId: req.user?.id,
            });

            res.status(400).json({
                success: false,
                message: 'Invalid input detected',
            });
            return;
        }
    }

    // For body, we'll let the content through but log suspicious patterns
    // The actual sanitization happens at the output level
    if (req.body && typeof req.body === 'object') {
        const checkObject = (obj: any, prefix = ''): void => {
            for (const [key, value] of Object.entries(obj)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;

                if (typeof value === 'string' && containsXSS(value)) {
                    logSecurityEvent({
                        type: 'xss_attempt',
                        ip,
                        reason: `XSS pattern in body: ${fullKey}`,
                        path: req.path,
                        method: req.method,
                        userId: req.user?.id,
                        severity: 'warning',
                    });
                }

                if (typeof value === 'object' && value !== null) {
                    checkObject(value, fullKey);
                }
            }
        };

        checkObject(req.body);
    }

    next();
};

/**
 * Detect path traversal attempts
 */
export const detectPathTraversal = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // Check URL path
    if (containsPathTraversal(req.path)) {
        logSecurityEvent({
            type: 'path_traversal_attempt',
            ip,
            reason: `Path traversal in URL: ${req.path}`,
            path: req.path,
            method: req.method,
            userId: req.user?.id,
        });

        res.status(400).json({
            success: false,
            message: 'Invalid request',
        });
        return;
    }

    // Check query parameters
    for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string' && containsPathTraversal(value)) {
            logSecurityEvent({
                type: 'path_traversal_attempt',
                ip,
                reason: `Path traversal in query: ${key}`,
                path: req.path,
                method: req.method,
                userId: req.user?.id,
            });

            res.status(400).json({
                success: false,
                message: 'Invalid request',
            });
            return;
        }
    }

    next();
};

/**
 * Add security headers to responses
 */
export const securityHeaders = (
    _req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Additional security headers not covered by helmet
    res.setHeader('X-DNS-Prefetch-Control', 'on');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Prevent clickjacking in frame (helmet sets this but we can be explicit)
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // XSS Protection (legacy but still useful for older browsers)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
};

/**
 * Check for suspicious request headers
 */
export const checkSuspiciousHeaders = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    for (const header of SUSPICIOUS_HEADERS) {
        if (req.headers[header]) {
            logSecurityEvent({
                type: 'suspicious_header',
                ip,
                reason: `Suspicious header: ${header}`,
                path: req.path,
                method: req.method,
            });

            // Don't block, just log (some legitimate proxies use these)
        }
    }

    next();
};

/**
 * Combined security middleware
 * Apply all security checks in order
 */
export const securityMiddleware = [
    securityHeaders,
    blockSuspiciousUserAgents,
    blockSuspiciousPaths,
    checkSuspiciousHeaders,
    detectPathTraversal,
    detectSQLInjection,
    detectXSS,
];

export default {
    blockSuspiciousUserAgents,
    blockSuspiciousPaths,
    detectSQLInjection,
    detectXSS,
    detectPathTraversal,
    securityHeaders,
    checkSuspiciousHeaders,
    securityMiddleware,
};
