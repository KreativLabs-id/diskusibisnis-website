/**
 * Audit Logging Middleware
 * Logs security events and user actions for audit trail
 */
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import pool from '../config/database';

// In-memory log buffer (for when DB is unavailable)
const logBuffer: SecurityEvent[] = [];
const MAX_BUFFER_SIZE = 1000;

export interface SecurityEvent {
    type: SecurityEventType;
    ip: string;
    userId?: string;
    reason?: string;
    path?: string;
    method?: string;
    userAgent?: string;
    severity?: 'info' | 'warning' | 'error' | 'critical';
    metadata?: Record<string, any>;
    timestamp?: Date;
}

export type SecurityEventType =
    | 'login_success'
    | 'login_failure'
    | 'logout'
    | 'registration'
    | 'password_change'
    | 'password_reset_request'
    | 'password_reset_success'
    | 'blocked_request'
    | 'sql_injection_attempt'
    | 'xss_attempt'
    | 'path_traversal_attempt'
    | 'rate_limit_exceeded'
    | 'suspicious_header'
    | 'unauthorized_access'
    | 'admin_action'
    | 'data_export'
    | 'account_deletion'
    | 'permission_change';

/**
 * Log a security event
 * Attempts to store in database, falls back to memory buffer
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
    const fullEvent: SecurityEvent = {
        ...event,
        timestamp: new Date(),
        severity: event.severity || 'info',
    };

    // Console log for immediate visibility
    const logLevel = event.severity === 'critical' || event.severity === 'error' ? 'error' :
        event.severity === 'warning' ? 'warn' : 'log';

    console[logLevel](
        `[AUDIT] ${fullEvent.type}:`,
        {
            ip: fullEvent.ip,
            userId: fullEvent.userId,
            reason: fullEvent.reason,
            path: fullEvent.path,
            timestamp: fullEvent.timestamp?.toISOString(),
        }
    );

    // Try to store in database
    try {
        await pool.query(
            `INSERT INTO audit_logs (
        event_type, 
        ip_address, 
        user_id, 
        reason, 
        request_path, 
        request_method, 
        user_agent, 
        severity, 
        metadata, 
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                fullEvent.type,
                fullEvent.ip,
                fullEvent.userId || null,
                fullEvent.reason || null,
                fullEvent.path || null,
                fullEvent.method || null,
                fullEvent.userAgent || null,
                fullEvent.severity,
                fullEvent.metadata ? JSON.stringify(fullEvent.metadata) : null,
                fullEvent.timestamp,
            ]
        );

        // Flush buffer if we have pending logs
        if (logBuffer.length > 0) {
            await flushLogBuffer();
        }
    } catch (error) {
        // Store in buffer if DB write fails
        if (logBuffer.length < MAX_BUFFER_SIZE) {
            logBuffer.push(fullEvent);
        }
        console.error('Failed to write audit log to database:', error);
    }
}

/**
 * Flush the in-memory log buffer to database
 */
async function flushLogBuffer(): Promise<void> {
    if (logBuffer.length === 0) return;

    const events = [...logBuffer];
    logBuffer.length = 0;

    for (const event of events) {
        try {
            await pool.query(
                `INSERT INTO audit_logs (
          event_type, ip_address, user_id, reason, request_path, 
          request_method, user_agent, severity, metadata, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    event.type,
                    event.ip,
                    event.userId || null,
                    event.reason || null,
                    event.path || null,
                    event.method || null,
                    event.userAgent || null,
                    event.severity,
                    event.metadata ? JSON.stringify(event.metadata) : null,
                    event.timestamp,
                ]
            );
        } catch (error) {
            // Re-add to buffer on failure
            if (logBuffer.length < MAX_BUFFER_SIZE) {
                logBuffer.push(event);
            }
        }
    }
}

/**
 * Middleware to log auth-related events
 */
export const auditAuthMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const originalSend = res.send;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent');

    // Override res.send to intercept response
    res.send = function (body: any): Response {
        const isLoginPath = req.path.includes('/auth/login') || req.path.includes('/auth/google');
        const isRegisterPath = req.path.includes('/auth/register');
        const isLogoutPath = req.path.includes('/auth/logout');
        const isPasswordPath = req.path.includes('/auth/password') ||
            req.path.includes('/auth/reset-password') ||
            req.path.includes('/auth/change-password');

        // Handle login events
        if (isLoginPath && req.method === 'POST') {
            const success = res.statusCode >= 200 && res.statusCode < 300;
            logSecurityEvent({
                type: success ? 'login_success' : 'login_failure',
                ip,
                userId: success ? req.user?.id : undefined,
                reason: success ? undefined : 'Invalid credentials',
                path: req.path,
                method: req.method,
                userAgent,
                severity: success ? 'info' : 'warning',
                metadata: {
                    email: req.body?.email,
                },
            });
        }

        // Handle registration events
        if (isRegisterPath && req.method === 'POST') {
            const success = res.statusCode >= 200 && res.statusCode < 300;
            logSecurityEvent({
                type: 'registration',
                ip,
                reason: success ? 'New user registered' : 'Registration failed',
                path: req.path,
                method: req.method,
                userAgent,
                severity: 'info',
                metadata: {
                    email: req.body?.email,
                },
            });
        }

        // Handle logout events
        if (isLogoutPath) {
            logSecurityEvent({
                type: 'logout',
                ip,
                userId: req.user?.id,
                path: req.path,
                method: req.method,
                userAgent,
                severity: 'info',
            });
        }

        // Handle password events
        if (isPasswordPath && req.method === 'POST') {
            const eventType = req.path.includes('reset-password')
                ? (req.path.includes('forgot') || req.body?.email ? 'password_reset_request' : 'password_reset_success')
                : 'password_change';

            logSecurityEvent({
                type: eventType,
                ip,
                userId: req.user?.id,
                path: req.path,
                method: req.method,
                userAgent,
                severity: 'info',
            });
        }

        return originalSend.call(this, body);
    };

    next();
};

/**
 * Middleware to log admin actions
 */
export const auditAdminMiddleware = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    // Only log for admin routes
    if (!req.path.includes('/admin')) {
        next();
        return;
    }

    const originalSend = res.send;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent');

    res.send = function (body: any): Response {
        const success = res.statusCode >= 200 && res.statusCode < 300;

        // Only log successful modifying operations
        if (success && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
            logSecurityEvent({
                type: 'admin_action',
                ip,
                userId: req.user?.id,
                reason: `Admin ${req.method} on ${req.path}`,
                path: req.path,
                method: req.method,
                userAgent,
                severity: 'info',
                metadata: {
                    requestBody: req.body,
                    responseStatus: res.statusCode,
                },
            });
        }

        return originalSend.call(this, body);
    };

    next();
};

/**
 * Log rate limit exceeded events
 */
export function logRateLimitExceeded(ip: string, path: string, limit: string): void {
    logSecurityEvent({
        type: 'rate_limit_exceeded',
        ip,
        reason: `Rate limit exceeded: ${limit}`,
        path,
        severity: 'warning',
    });
}

/**
 * Log unauthorized access attempts
 */
export function logUnauthorizedAccess(ip: string, path: string, userId?: string): void {
    logSecurityEvent({
        type: 'unauthorized_access',
        ip,
        userId,
        reason: 'Attempted to access protected resource without authorization',
        path,
        severity: 'warning',
    });
}

/**
 * Query audit logs (for admin dashboard)
 */
export async function getAuditLogs(options: {
    limit?: number;
    offset?: number;
    eventType?: SecurityEventType;
    userId?: string;
    ip?: string;
    startDate?: Date;
    endDate?: Date;
    severity?: string;
}): Promise<{ logs: any[]; total: number }> {
    const {
        limit = 50,
        offset = 0,
        eventType,
        userId,
        ip,
        startDate,
        endDate,
        severity,
    } = options;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (eventType) {
        conditions.push(`event_type = $${paramIndex++}`);
        params.push(eventType);
    }

    if (userId) {
        conditions.push(`user_id = $${paramIndex++}`);
        params.push(userId);
    }

    if (ip) {
        conditions.push(`ip_address = $${paramIndex++}`);
        params.push(ip);
    }

    if (startDate) {
        conditions.push(`created_at >= $${paramIndex++}`);
        params.push(startDate);
    }

    if (endDate) {
        conditions.push(`created_at <= $${paramIndex++}`);
        params.push(endDate);
    }

    if (severity) {
        conditions.push(`severity = $${paramIndex++}`);
        params.push(severity);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await pool.query(
        `SELECT COUNT(*) FROM audit_logs ${whereClause}`,
        params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get logs
    params.push(limit, offset);
    const result = await pool.query(
        `SELECT * FROM audit_logs ${whereClause} 
     ORDER BY created_at DESC 
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
        params
    );

    return {
        logs: result.rows,
        total,
    };
}

export default {
    logSecurityEvent,
    auditAuthMiddleware,
    auditAdminMiddleware,
    logRateLimitExceeded,
    logUnauthorizedAccess,
    getAuditLogs,
};
