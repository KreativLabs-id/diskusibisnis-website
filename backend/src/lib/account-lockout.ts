/**
 * Progressive Account Lockout System
 * 
 * Implements progressive lockout with increasing penalties:
 * - First few failures: No penalty (typos happen)
 * - More failures: Short lockout (1 minute)
 * - Many failures: Longer lockout (5, 15, 30 minutes)
 * - Excessive failures: Long lockout (1 hour, 24 hours)
 * 
 * Based on OWASP Authentication Cheat Sheet:
 * https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
 * 
 * Features:
 * - Progressive lockout durations
 * - Separate tracking for IP and email
 * - Automatic reset after successful login
 * - Admin notification for suspicious activity
 */

import { rateLimitStore } from '../config/redis';
import { logSecurityEvent } from '../middlewares/audit.middleware';

// Lockout configuration
const LOCKOUT_CONFIG = {
    // Number of attempts before lockout starts
    FREE_ATTEMPTS: 3,

    // Progressive lockout durations (in milliseconds)
    // After FREE_ATTEMPTS, each additional failure triggers longer lockout
    LOCKOUT_DURATIONS: [
        0,           // 1-3 attempts: no lockout
        60000,       // 4th attempt: 1 minute
        60000,       // 5th attempt: 1 minute
        300000,      // 6th attempt: 5 minutes
        900000,      // 7th attempt: 15 minutes
        1800000,     // 8th attempt: 30 minutes
        3600000,     // 9th attempt: 1 hour
        86400000,    // 10+ attempts: 24 hours
    ],

    // Window for counting attempts (reset after this time of no attempts)
    ATTEMPT_WINDOW_MS: 24 * 60 * 60 * 1000, // 24 hours

    // Threshold for admin notification
    ALERT_THRESHOLD: 10,
};

interface LockoutData {
    attempts: number;
    firstAttempt: number;
    lastAttempt: number;
    lockedUntil?: number;
    notifiedAdmin?: boolean;
}

interface LockoutResult {
    isLocked: boolean;
    attemptsRemaining: number;
    lockoutDuration?: number;
    lockedUntil?: Date;
    shouldAlert?: boolean;
}

/**
 * Get the lockout duration for a given number of attempts
 */
function getLockoutDuration(attempts: number): number {
    const { FREE_ATTEMPTS, LOCKOUT_DURATIONS } = LOCKOUT_CONFIG;

    if (attempts <= FREE_ATTEMPTS) {
        return 0;
    }

    const lockoutIndex = Math.min(
        attempts - FREE_ATTEMPTS,
        LOCKOUT_DURATIONS.length - 1
    );

    return LOCKOUT_DURATIONS[lockoutIndex];
}

/**
 * Check and update lockout status for a login attempt
 * 
 * @param identifier - Email or IP address
 * @param type - 'email' or 'ip'
 * @returns LockoutResult with lockout status and remaining attempts
 */
export async function checkAccountLockout(
    identifier: string,
    type: 'email' | 'ip'
): Promise<LockoutResult> {
    const key = `lockout:${type}:${identifier.toLowerCase()}`;
    const now = Date.now();

    // Get existing lockout data
    let data = await rateLimitStore.get(key) as LockoutData | null;

    // Check if currently locked
    if (data?.lockedUntil && data.lockedUntil > now) {
        return {
            isLocked: true,
            attemptsRemaining: 0,
            lockoutDuration: data.lockedUntil - now,
            lockedUntil: new Date(data.lockedUntil),
        };
    }

    // Check if window has expired (reset attempts)
    if (data && (now - data.lastAttempt) > LOCKOUT_CONFIG.ATTEMPT_WINDOW_MS) {
        data = null;
    }

    // Initialize or update data
    if (!data) {
        data = {
            attempts: 0,
            firstAttempt: now,
            lastAttempt: now,
        };
    }

    // Increment attempt counter
    data.attempts++;
    data.lastAttempt = now;

    // Calculate lockout
    const lockoutDuration = getLockoutDuration(data.attempts);

    if (lockoutDuration > 0) {
        data.lockedUntil = now + lockoutDuration;
    }

    // Check if we should alert admin
    const shouldAlert = data.attempts >= LOCKOUT_CONFIG.ALERT_THRESHOLD && !data.notifiedAdmin;
    if (shouldAlert) {
        data.notifiedAdmin = true;
    }

    // Calculate TTL for storage
    const ttlMs = data.lockedUntil
        ? Math.max(data.lockedUntil - now, LOCKOUT_CONFIG.ATTEMPT_WINDOW_MS)
        : LOCKOUT_CONFIG.ATTEMPT_WINDOW_MS;

    // Save updated data
    await rateLimitStore.set(key, data as any, Math.ceil(ttlMs / 1000));

    // Calculate remaining free attempts
    const attemptsRemaining = Math.max(0, LOCKOUT_CONFIG.FREE_ATTEMPTS - data.attempts);

    return {
        isLocked: lockoutDuration > 0,
        attemptsRemaining,
        lockoutDuration: lockoutDuration > 0 ? lockoutDuration : undefined,
        lockedUntil: data.lockedUntil ? new Date(data.lockedUntil) : undefined,
        shouldAlert,
    };
}

/**
 * Record a failed login attempt
 * 
 * @param email - User email
 * @param ip - Client IP address
 * @returns Combined lockout result (locked if either email or IP is locked)
 */
export async function recordFailedLogin(
    email: string,
    ip: string
): Promise<{
    emailLockout: LockoutResult;
    ipLockout: LockoutResult;
    isLocked: boolean;
    message: string;
}> {
    // Check both email and IP lockouts
    const [emailLockout, ipLockout] = await Promise.all([
        checkAccountLockout(email, 'email'),
        checkAccountLockout(ip, 'ip'),
    ]);

    const isLocked = emailLockout.isLocked || ipLockout.isLocked;

    // Log if we should alert
    if (emailLockout.shouldAlert || ipLockout.shouldAlert) {
        logSecurityEvent({
            type: 'blocked_request',
            ip,
            reason: `Excessive failed login attempts: ${email}`,
            severity: 'error',
            metadata: {
                email,
                emailAttempts: emailLockout.attemptsRemaining === 0 ? 'max' : undefined,
                ipAttempts: ipLockout.attemptsRemaining === 0 ? 'max' : undefined,
            },
        });

        // TODO: Send notification to admin via email or Slack
        console.error(`🚨 SECURITY ALERT: Excessive failed login attempts for ${email} from ${ip}`);
    }

    // Generate user-friendly message
    let message = 'Invalid credentials';

    if (isLocked) {
        const lockoutMs = Math.max(
            emailLockout.lockoutDuration || 0,
            ipLockout.lockoutDuration || 0
        );
        const lockoutMinutes = Math.ceil(lockoutMs / 60000);

        if (lockoutMinutes >= 60) {
            const hours = Math.ceil(lockoutMinutes / 60);
            message = `Account temporarily locked. Please try again in ${hours} hour${hours > 1 ? 's' : ''}.`;
        } else {
            message = `Too many failed attempts. Please try again in ${lockoutMinutes} minute${lockoutMinutes > 1 ? 's' : ''}.`;
        }
    } else if (emailLockout.attemptsRemaining > 0) {
        message = `Invalid credentials. ${emailLockout.attemptsRemaining} attempt${emailLockout.attemptsRemaining > 1 ? 's' : ''} remaining.`;
    }

    return {
        emailLockout,
        ipLockout,
        isLocked,
        message,
    };
}

/**
 * Clear lockout after successful login
 * 
 * @param email - User email
 * @param ip - Client IP address
 */
export async function clearLoginLockout(email: string, ip: string): Promise<void> {
    const emailKey = `lockout:email:${email.toLowerCase()}`;
    const ipKey = `lockout:ip:${ip}`;

    await Promise.all([
        rateLimitStore.delete(emailKey),
        rateLimitStore.delete(ipKey),
    ]);
}

/**
 * Check if account is locked without incrementing counter
 * Use this before showing the login form
 */
export async function isAccountLocked(
    identifier: string,
    type: 'email' | 'ip'
): Promise<{
    isLocked: boolean;
    lockedUntil?: Date;
    remainingMs?: number;
}> {
    const key = `lockout:${type}:${identifier.toLowerCase()}`;
    const now = Date.now();

    const data = await rateLimitStore.get(key) as LockoutData | null;

    if (data?.lockedUntil && data.lockedUntil > now) {
        return {
            isLocked: true,
            lockedUntil: new Date(data.lockedUntil),
            remainingMs: data.lockedUntil - now,
        };
    }

    return { isLocked: false };
}

/**
 * Get lockout status summary for admin dashboard
 */
export async function getLockoutStatus(email: string): Promise<{
    attempts: number;
    isLocked: boolean;
    lockedUntil?: Date;
    firstAttempt?: Date;
    lastAttempt?: Date;
}> {
    const key = `lockout:email:${email.toLowerCase()}`;
    const now = Date.now();

    const data = await rateLimitStore.get(key) as LockoutData | null;

    if (!data) {
        return { attempts: 0, isLocked: false };
    }

    return {
        attempts: data.attempts,
        isLocked: data.lockedUntil ? data.lockedUntil > now : false,
        lockedUntil: data.lockedUntil ? new Date(data.lockedUntil) : undefined,
        firstAttempt: new Date(data.firstAttempt),
        lastAttempt: new Date(data.lastAttempt),
    };
}

export default {
    checkAccountLockout,
    recordFailedLogin,
    clearLoginLockout,
    isAccountLocked,
    getLockoutStatus,
    LOCKOUT_CONFIG,
};
