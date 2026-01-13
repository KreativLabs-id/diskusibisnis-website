/**
 * Input Validation Schemas using Zod
 * Centralized validation for all user inputs
 */

import { z } from 'zod';

// ============================================
// Common Validators
// ============================================

/**
 * Email validation with additional security checks
 */
export const emailSchema = z
    .string()
    .email('Invalid email address')
    .max(254, 'Email address is too long')
    .transform(val => val.toLowerCase().trim())
    .refine(val => !val.includes('..'), 'Invalid email format')
    .refine(val => !/[<>'"`;]/.test(val), 'Email contains invalid characters');

/**
 * Password validation schema
 */
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters')
    .refine(val => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
    .refine(val => /[a-z]/.test(val), 'Password must contain at least one lowercase letter')
    .refine(val => /[0-9]/.test(val), 'Password must contain at least one number')
    .refine(
        val => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(val),
        'Password must contain at least one special character'
    );

/**
 * Slug validation (URL-safe string)
 */
export const slugSchema = z
    .string()
    .min(1, 'Slug is required')
    .max(200, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .refine(val => !val.startsWith('-') && !val.endsWith('-'), 'Slug cannot start or end with a hyphen');

/**
 * Display name validation
 */
export const displayNameSchema = z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Display name contains invalid characters')
    .transform(val => val.trim());

/**
 * Username validation
 */
export const usernameSchema = z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .refine(val => !val.startsWith('_') && !val.endsWith('_'), 'Username cannot start or end with underscore');

/**
 * UUID validation
 */
export const uuidSchema = z
    .string()
    .uuid('Invalid ID format');

/**
 * URL validation
 */
export const urlSchema = z
    .string()
    .url('Invalid URL')
    .max(2048, 'URL is too long')
    .refine(val => val.startsWith('http://') || val.startsWith('https://'), 'URL must use HTTP or HTTPS');

/**
 * Safe text input (prevents XSS)
 */
export const safeTextSchema = z
    .string()
    .max(10000, 'Text is too long')
    .refine(val => !/<script/i.test(val), 'Invalid content detected')
    .refine(val => !/javascript:/i.test(val), 'Invalid content detected')
    .refine(val => !/on\w+\s*=/i.test(val), 'Invalid content detected');

/**
 * Phone number validation (Indonesian format)
 */
export const phoneSchema = z
    .string()
    .regex(/^(\+62|62|0)[0-9]{8,12}$/, 'Invalid phone number format')
    .transform(val => {
        // Normalize to +62 format
        if (val.startsWith('0')) {
            return '+62' + val.substring(1);
        }
        if (val.startsWith('62')) {
            return '+' + val;
        }
        return val;
    });

// ============================================
// Auth Schemas
// ============================================

/**
 * Login request validation
 */
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required').max(128, 'Password is too long'),
});

/**
 * Registration request validation
 */
export const registerSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    displayName: displayNameSchema,
});

/**
 * Password reset request validation
 */
export const passwordResetRequestSchema = z.object({
    email: emailSchema,
});

/**
 * Password reset validation
 */
export const passwordResetSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: passwordSchema,
});

/**
 * Password change validation
 */
export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
}).refine(
    data => data.currentPassword !== data.newPassword,
    { message: 'New password must be different from current password', path: ['newPassword'] }
);

// ============================================
// Content Schemas
// ============================================

/**
 * Question creation validation
 */
export const createQuestionSchema = z.object({
    title: z
        .string()
        .min(10, 'Title must be at least 10 characters')
        .max(200, 'Title cannot exceed 200 characters')
        .refine(val => !/<script/i.test(val), 'Invalid content detected'),
    content: safeTextSchema.refine(val => val.length >= 20, 'Content must be at least 20 characters'),
    tags: z
        .array(z.string().max(50, 'Tag is too long'))
        .min(1, 'At least one tag is required')
        .max(5, 'Maximum 5 tags allowed'),
    community_slug: slugSchema.optional(),
    images: z.array(urlSchema).max(10, 'Maximum 10 images allowed').optional(),
});

/**
 * Answer creation validation
 */
export const createAnswerSchema = z.object({
    content: safeTextSchema
        .refine(val => val.length >= 10, 'Answer must be at least 10 characters'),
    questionId: uuidSchema,
});

/**
 * Comment creation validation
 */
export const createCommentSchema = z.object({
    content: safeTextSchema
        .refine(val => val.length >= 1, 'Comment cannot be empty')
        .refine(val => val.length <= 1000, 'Comment cannot exceed 1000 characters'),
    commentableType: z.enum(['question', 'answer']),
    commentableId: uuidSchema,
});

/**
 * Tag creation validation
 */
export const createTagSchema = z.object({
    name: z
        .string()
        .min(2, 'Tag name must be at least 2 characters')
        .max(50, 'Tag name cannot exceed 50 characters'),
    slug: slugSchema,
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
});

// ============================================
// User Schemas
// ============================================

/**
 * Profile update validation
 */
export const updateProfileSchema = z.object({
    displayName: displayNameSchema.optional(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
    avatarUrl: urlSchema.optional(),
    location: z.string().max(100, 'Location cannot exceed 100 characters').optional(),
    website: urlSchema.optional(),
});

// ============================================
// Community Schemas
// ============================================

/**
 * Community creation validation
 */
export const createCommunitySchema = z.object({
    name: z
        .string()
        .min(3, 'Community name must be at least 3 characters')
        .max(100, 'Community name cannot exceed 100 characters'),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description cannot exceed 1000 characters'),
    category: z.string().min(1, 'Category is required'),
    location: z.string().max(100, 'Location cannot exceed 100 characters').optional(),
});

// ============================================
// Support Ticket Schemas
// ============================================

/**
 * Support ticket creation validation
 */
export const createSupportTicketSchema = z.object({
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name cannot exceed 100 characters'),
    email: emailSchema,
    subject: z
        .string()
        .min(5, 'Subject must be at least 5 characters')
        .max(200, 'Subject cannot exceed 200 characters'),
    message: safeTextSchema
        .refine(val => val.length >= 10, 'Message must be at least 10 characters'),
    category: z.enum(['general', 'technical', 'billing', 'feedback', 'other']).optional(),
});

// ============================================
// Admin Schemas
// ============================================

/**
 * Broadcast notification validation
 */
export const broadcastNotificationSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title cannot exceed 200 characters'),
    message: z
        .string()
        .min(1, 'Message is required')
        .max(1000, 'Message cannot exceed 1000 characters'),
    type: z.enum(['info', 'warning', 'success', 'error']).optional(),
    link: urlSchema.optional(),
});

// ============================================
// Pagination Schema
// ============================================

/**
 * Pagination parameters validation
 */
export const paginationSchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1, 'Page must be at least 1')
        .max(10000, 'Page number is too large')
        .default(1),
    limit: z.coerce
        .number()
        .int()
        .min(1, 'Limit must be at least 1')
        .max(100, 'Limit cannot exceed 100')
        .default(20),
    sort: z.string().max(50).optional(),
    search: z
        .string()
        .max(200, 'Search query is too long')
        .optional()
        .transform(val => val?.trim()),
});

// ============================================
// Utility Functions
// ============================================

/**
 * Validate and parse input with a schema
 * Returns validation result with parsed data or errors
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: { field: string; message: string }[];
} {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors = result.error.issues.map((issue: z.ZodIssue) => ({
        field: issue.path.join('.'),
        message: issue.message,
    }));

    return { success: false, errors };
}

/**
 * Create a validation middleware for Express
 */
export function createValidationMiddleware<T>(
    schema: z.ZodSchema<T>,
    source: 'body' | 'query' | 'params' = 'body'
) {
    return (req: any, res: any, next: any) => {
        const result = validateInput(schema, req[source]);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: result.errors,
            });
        }

        req.validated = result.data;
        next();
    };
}

export default {
    // Common validators
    emailSchema,
    passwordSchema,
    slugSchema,
    displayNameSchema,
    usernameSchema,
    uuidSchema,
    urlSchema,
    safeTextSchema,
    phoneSchema,

    // Auth schemas
    loginSchema,
    registerSchema,
    passwordResetRequestSchema,
    passwordResetSchema,
    passwordChangeSchema,

    // Content schemas
    createQuestionSchema,
    createAnswerSchema,
    createCommentSchema,
    createTagSchema,

    // User schemas
    updateProfileSchema,

    // Community schemas
    createCommunitySchema,

    // Support schemas
    createSupportTicketSchema,

    // Admin schemas
    broadcastNotificationSchema,

    // Pagination
    paginationSchema,

    // Utilities
    validateInput,
    createValidationMiddleware,
};
