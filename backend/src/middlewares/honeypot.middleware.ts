/**
 * Honeypot Anti-Spam Middleware
 * 
 * Technique: Add hidden fields to forms that legitimate users won't fill out.
 * Bots that auto-fill all fields will trigger the honeypot.
 * 
 * How it works:
 * 1. Frontend includes hidden honeypot fields (CSS hidden, not type="hidden")
 * 2. These fields have attractive names for bots (e.g., "website", "phone", "email2")
 * 3. If any honeypot field has a value, the request is from a bot
 * 4. Timing check: If form submitted too quickly (< 2 seconds), likely a bot
 * 
 * Reference: https://dev.to/felixdorn/the-definitive-guide-to-the-honeypot-technique-3kbb
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { logSecurityEvent } from './audit.middleware';

// Honeypot field names that bots typically target
// These should match the hidden fields in your frontend forms
export const HONEYPOT_FIELDS = [
    'website',
    'url',
    'phone2',
    'email2',
    'fax',
    'address2',
    'homepage',
    'company_url',
];

// Timestamp field name for timing-based detection
export const HONEYPOT_TIMESTAMP_FIELD = '_hp_ts';

// Minimum time (in milliseconds) between page load and form submission
// Forms submitted faster than this are likely bots
const MIN_SUBMISSION_TIME = 2000; // 2 seconds

// Maximum time (in milliseconds) for form to be valid
// Forms submitted after this might be stale (optional check)
const MAX_SUBMISSION_TIME = 24 * 60 * 60 * 1000; // 24 hours

interface HoneypotOptions {
    /**
     * Field names to check for honeypot values
     * Default: HONEYPOT_FIELDS
     */
    fields?: string[];

    /**
     * Enable timing-based detection
     * Default: true
     */
    checkTiming?: boolean;

    /**
     * Minimum submission time in milliseconds
     * Default: 2000 (2 seconds)
     */
    minTime?: number;

    /**
     * Response status code for detected bots
     * Default: 400 (to avoid revealing detection)
     */
    statusCode?: number;

    /**
     * Error message for detected bots
     * Default: generic validation message
     */
    errorMessage?: string;

    /**
     * Auto-remove honeypot fields from request body
     * Default: true
     */
    removeFields?: boolean;
}

/**
 * Create a honeypot middleware with custom options
 */
export function createHoneypotMiddleware(options: HoneypotOptions = {}) {
    const {
        fields = HONEYPOT_FIELDS,
        checkTiming = true,
        minTime = MIN_SUBMISSION_TIME,
        statusCode = 400,
        errorMessage = 'Validation failed. Please try again.',
        removeFields = true,
    } = options;

    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';

        // Only check POST/PUT/PATCH requests with body
        if (!['POST', 'PUT', 'PATCH'].includes(req.method) || !req.body) {
            next();
            return;
        }

        // Check honeypot fields
        for (const field of fields) {
            if (req.body[field] && typeof req.body[field] === 'string' && req.body[field].trim() !== '') {
                // Honeypot triggered!
                logSecurityEvent({
                    type: 'blocked_request',
                    ip,
                    reason: `Honeypot triggered: field "${field}" was filled`,
                    path: req.path,
                    method: req.method,
                    userId: req.user?.id,
                    severity: 'warning',
                });

                // Return generic error to not reveal detection
                res.status(statusCode).json({
                    success: false,
                    message: errorMessage,
                });
                return;
            }
        }

        // Check timing-based detection
        if (checkTiming && req.body[HONEYPOT_TIMESTAMP_FIELD]) {
            try {
                const timestamp = parseInt(req.body[HONEYPOT_TIMESTAMP_FIELD], 10);
                const now = Date.now();
                const timeDiff = now - timestamp;

                // Too fast - likely a bot
                if (timeDiff < minTime) {
                    logSecurityEvent({
                        type: 'blocked_request',
                        ip,
                        reason: `Honeypot timing check failed: submitted in ${timeDiff}ms (min: ${minTime}ms)`,
                        path: req.path,
                        method: req.method,
                        userId: req.user?.id,
                        severity: 'warning',
                    });

                    res.status(statusCode).json({
                        success: false,
                        message: errorMessage,
                    });
                    return;
                }

                // Too old - might be stale (optional, just log)
                if (timeDiff > MAX_SUBMISSION_TIME) {
                    console.warn(`Honeypot: Form submitted after ${timeDiff}ms (stale form)`);
                }
            } catch (error) {
                // Invalid timestamp - ignore
            }
        }

        // Remove honeypot fields from body to clean data
        if (removeFields) {
            for (const field of fields) {
                delete req.body[field];
            }
            delete req.body[HONEYPOT_TIMESTAMP_FIELD];
        }

        next();
    };
}

/**
 * Default honeypot middleware with standard configuration
 */
export const honeypotMiddleware = createHoneypotMiddleware();

/**
 * Strict honeypot middleware for high-value forms (registration, contact)
 * Uses longer minimum time and more fields
 */
export const strictHoneypotMiddleware = createHoneypotMiddleware({
    minTime: 3000, // 3 seconds
    checkTiming: true,
});

export default {
    createHoneypotMiddleware,
    honeypotMiddleware,
    strictHoneypotMiddleware,
    HONEYPOT_FIELDS,
    HONEYPOT_TIMESTAMP_FIELD,
};
