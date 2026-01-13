/**
 * Security Utilities
 * Provides input sanitization, XSS protection, and other security utilities
 */

/**
 * Sanitize user input to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
        return '';
    }

    let sanitized = input;

    // Remove null bytes (can be used for injection)
    sanitized = sanitized.replace(/\0/g, '');

    // Encode HTML entities
    sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    return sanitized;
}

/**
 * Sanitize HTML content while preserving safe tags
 * Use this for rich text content
 */
export function sanitizeHtml(input: string): string {
    if (typeof input !== 'string') {
        return '';
    }

    let sanitized = input;

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove data: URLs (can be used for XSS)
    sanitized = sanitized.replace(/data:/gi, '');

    // Remove vbscript: protocol
    sanitized = sanitized.replace(/vbscript:/gi, '');

    // Remove event handlers
    const eventHandlers = [
        'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
        'onmousemove', 'onmouseout', 'onmouseenter', 'onmouseleave',
        'onkeydown', 'onkeypress', 'onkeyup',
        'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
        'onload', 'onunload', 'onerror', 'onresize', 'onscroll',
        'oncontextmenu', 'oninput', 'oninvalid', 'onsearch', 'onselect',
        'ondrag', 'ondragend', 'ondragenter', 'ondragleave', 'ondragover',
        'ondragstart', 'ondrop',
        'oncopy', 'oncut', 'onpaste',
        'onabort', 'oncanplay', 'oncanplaythrough', 'oncuechange',
        'ondurationchange', 'onemptied', 'onended', 'onloadeddata',
        'onloadedmetadata', 'onloadstart', 'onpause', 'onplay', 'onplaying',
        'onprogress', 'onratechange', 'onseeked', 'onseeking', 'onstalled',
        'onsuspend', 'ontimeupdate', 'onvolumechange', 'onwaiting',
        'ontouchstart', 'ontouchmove', 'ontouchend', 'ontouchcancel',
        'onanimationstart', 'onanimationend', 'onanimationiteration',
        'ontransitionend', 'onmessage', 'onopen', 'onwheel',
        'onpointerdown', 'onpointerup', 'onpointermove', 'onpointerover',
        'onpointerout', 'onpointerenter', 'onpointerleave', 'onpointercancel',
    ];

    for (const handler of eventHandlers) {
        // Match the event handler with any whitespace and value
        const regex = new RegExp(`\\s*${handler}\\s*=\\s*["']?[^"']*["']?`, 'gi');
        sanitized = sanitized.replace(regex, '');
    }

    // Remove script tags
    sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    // Remove style tags (can contain expressions in IE)
    sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Remove iframe tags
    sanitized = sanitized.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');

    // Remove object tags
    sanitized = sanitized.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '');

    // Remove embed tags
    sanitized = sanitized.replace(/<embed[^>]*>/gi, '');

    // Remove form tags
    sanitized = sanitized.replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '');

    // Remove link tags (can load external stylesheets)
    sanitized = sanitized.replace(/<link[^>]*>/gi, '');

    // Remove base tags
    sanitized = sanitized.replace(/<base[^>]*>/gi, '');

    // Remove meta tags
    sanitized = sanitized.replace(/<meta[^>]*>/gi, '');

    return sanitized;
}

/**
 * Sanitize a slug to only allow alphanumeric characters and hyphens
 * @param slug - The slug to sanitize
 * @returns Sanitized slug
 */
export function sanitizeSlug(slug: string): string {
    if (typeof slug !== 'string') {
        return '';
    }

    return slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * Validate and sanitize an email address
 * @param email - The email to validate
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
    if (typeof email !== 'string') {
        return null;
    }

    const sanitized = email.toLowerCase().trim();

    // Basic email validation regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(sanitized)) {
        return null;
    }

    // Additional checks
    if (sanitized.length > 254) {
        return null;
    }

    return sanitized;
}

/**
 * Check if a string contains potential SQL injection patterns
 * This is a secondary defense - always use parameterized queries!
 */
export function containsSQLInjection(input: string): boolean {
    if (typeof input !== 'string') {
        return false;
    }

    const lowerInput = input.toLowerCase();

    // Common SQL injection patterns
    const patterns = [
        /(\b(select|insert|update|delete|drop|create|alter|truncate|exec|execute)\b.*\b(from|into|table|database)\b)/i,
        /(\bunion\b.*\bselect\b)/i,
        /(\bor\b.*=.*)/i,
        /('.*--)/,
        /(;\s*(select|insert|update|delete|drop|create|alter))/i,
        /(\bexec\b\s*\()/i,
        /(\bxp_\w+)/i,
        /(\/\*.*\*\/)/,
        /(\bwaitfor\b.*\bdelay\b)/i,
        /(\bsleep\b\s*\(\s*\d+\s*\))/i,
        /(\bbenchmark\b\s*\()/i,
        /(\bconcat\b\s*\(.*,.*\))/i,
        /(\bchar\b\s*\(\s*\d+\s*\))/i,
        /(\bhaving\b.*[<>=!])/i,
        /(\bgroup\s+by\b.*\bhaving\b)/i,
        /(\border\s+by\b.*\bif\b)/i,
    ];

    for (const pattern of patterns) {
        if (pattern.test(lowerInput)) {
            return true;
        }
    }

    return false;
}

/**
 * Check if a string contains potential XSS patterns
 */
export function containsXSS(input: string): boolean {
    if (typeof input !== 'string') {
        return false;
    }

    // XSS patterns
    const patterns = [
        /<script[^>]*>/i,
        /<\/script>/i,
        /javascript:/i,
        /vbscript:/i,
        /on\w+\s*=/i,
        /expression\s*\(/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<link/i,
        /<meta/i,
        /document\.\s*(cookie|location|write)/i,
        /window\.\s*(location|open)/i,
        /eval\s*\(/i,
        /alert\s*\(/i,
        /confirm\s*\(/i,
        /prompt\s*\(/i,
        /\.innerHTML\s*=/i,
        /\.outerHTML\s*=/i,
    ];

    for (const pattern of patterns) {
        if (pattern.test(input)) {
            return true;
        }
    }

    return false;
}

/**
 * Check if a string contains path traversal attempts
 */
export function containsPathTraversal(input: string): boolean {
    if (typeof input !== 'string') {
        return false;
    }

    const patterns = [
        /\.\.\//,
        /\.\.\\/,
        /%2e%2e%2f/i,
        /%2e%2e%5c/i,
        /\.\.%2f/i,
        /\.\.%5c/i,
        /%252e%252e%252f/i,
        /\.\.%252f/i,
        /\.\.\//,
    ];

    for (const pattern of patterns) {
        if (pattern.test(input)) {
            return true;
        }
    }

    return false;
}

/**
 * Generate a secure random string
 * @param length - Length of the string to generate
 * @returns Random string
 */
export function generateSecureToken(length: number = 32): string {
    const crypto = require('crypto');
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a string using SHA-256
 * @param input - String to hash
 * @returns Hashed string
 */
export function hashString(input: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Mask sensitive data for logging
 * @param value - Value to mask
 * @param visibleChars - Number of characters to keep visible at start and end
 */
export function maskSensitive(value: string, visibleChars: number = 4): string {
    if (!value || value.length <= visibleChars * 2) {
        return '****';
    }

    const start = value.substring(0, visibleChars);
    const end = value.substring(value.length - visibleChars);
    const middle = '*'.repeat(Math.min(value.length - visibleChars * 2, 8));

    return `${start}${middle}${end}`;
}

export default {
    sanitizeInput,
    sanitizeHtml,
    sanitizeSlug,
    sanitizeEmail,
    containsSQLInjection,
    containsXSS,
    containsPathTraversal,
    generateSecureToken,
    hashString,
    maskSensitive,
};
