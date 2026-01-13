/**
 * File Upload Security
 * Validates and sanitizes file uploads to prevent malicious file attacks
 */

import crypto from 'crypto';
import path from 'path';

// Allowed MIME types and their corresponding extensions
const ALLOWED_FILE_TYPES: Record<string, { extensions: string[]; maxSize: number }> = {
    // Images
    'image/jpeg': { extensions: ['.jpg', '.jpeg'], maxSize: 10 * 1024 * 1024 }, // 10MB
    'image/png': { extensions: ['.png'], maxSize: 10 * 1024 * 1024 },
    'image/gif': { extensions: ['.gif'], maxSize: 5 * 1024 * 1024 },
    'image/webp': { extensions: ['.webp'], maxSize: 10 * 1024 * 1024 },
    'image/svg+xml': { extensions: ['.svg'], maxSize: 1 * 1024 * 1024 },

    // Documents
    'application/pdf': { extensions: ['.pdf'], maxSize: 25 * 1024 * 1024 },
    'application/msword': { extensions: ['.doc'], maxSize: 25 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        extensions: ['.docx'],
        maxSize: 25 * 1024 * 1024
    },
    'application/vnd.ms-excel': { extensions: ['.xls'], maxSize: 25 * 1024 * 1024 },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        extensions: ['.xlsx'],
        maxSize: 25 * 1024 * 1024
    },

    // Videos (restricted)
    'video/mp4': { extensions: ['.mp4'], maxSize: 100 * 1024 * 1024 }, // 100MB
    'video/webm': { extensions: ['.webm'], maxSize: 100 * 1024 * 1024 },
};

// Dangerous file extensions that should ALWAYS be blocked
const DANGEROUS_EXTENSIONS = [
    '.exe', '.com', '.bat', '.cmd', '.sh', '.bash', '.zsh',
    '.ps1', '.psm1', '.psd1', '.ps1xml', '.psc1', '.psc2',
    '.msi', '.msp', '.msu',
    '.dll', '.so', '.dylib',
    '.php', '.php3', '.php4', '.php5', '.phtml', '.phar',
    '.asp', '.aspx', '.asax', '.ashx', '.asmx', '.axd',
    '.jsp', '.jspx', '.jsw', '.jsv', '.jspf',
    '.cgi', '.pl', '.py', '.pyc', '.pyo', '.rb',
    '.js', '.mjs', '.jsx', '.ts', '.tsx',
    '.vbs', '.vbe', '.wsf', '.wsh', '.ws',
    '.hta', '.htc',
    '.jar', '.war', '.ear',
    '.swf', '.fla',
    '.scr', '.pif', '.inf', '.reg',
    '.lnk', '.url',
    '.app', '.action', '.command',
    '.elf', '.bin',
    '.class',
];

// Magic bytes for file type verification
const MAGIC_BYTES: Record<string, Buffer[]> = {
    'image/jpeg': [
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]),
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE1]),
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE2]),
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE3]),
        Buffer.from([0xFF, 0xD8, 0xFF, 0xE8]),
    ],
    'image/png': [Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])],
    'image/gif': [
        Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]),
        Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
    ],
    'image/webp': [Buffer.from([0x52, 0x49, 0x46, 0x46])], // "RIFF" - partial check
    'application/pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46])], // "%PDF"
};

export interface FileValidationResult {
    isValid: boolean;
    error?: string;
    sanitizedFileName?: string;
    detectedMimeType?: string;
}

/**
 * Validate a file upload
 */
export function validateFile(
    file: {
        originalname: string;
        mimetype: string;
        size: number;
        buffer?: Buffer;
    },
    options?: {
        allowedTypes?: string[];
        maxSize?: number;
    }
): FileValidationResult {
    const { originalname, mimetype, size, buffer } = file;
    const allowedTypes = options?.allowedTypes || Object.keys(ALLOWED_FILE_TYPES);
    const maxSize = options?.maxSize;

    // Get file extension
    const ext = path.extname(originalname).toLowerCase();

    // Check for dangerous extensions
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
        return {
            isValid: false,
            error: `File type "${ext}" is not allowed for security reasons`,
        };
    }

    // Check if MIME type is allowed
    if (!allowedTypes.includes(mimetype) || !ALLOWED_FILE_TYPES[mimetype]) {
        return {
            isValid: false,
            error: `File type "${mimetype}" is not allowed`,
        };
    }

    const typeConfig = ALLOWED_FILE_TYPES[mimetype];

    // Check if extension matches MIME type
    if (!typeConfig.extensions.includes(ext)) {
        return {
            isValid: false,
            error: `File extension "${ext}" does not match content type "${mimetype}"`,
        };
    }

    // Check file size
    const effectiveMaxSize = maxSize || typeConfig.maxSize;
    if (size > effectiveMaxSize) {
        const maxMB = Math.round(effectiveMaxSize / (1024 * 1024));
        return {
            isValid: false,
            error: `File size exceeds maximum allowed (${maxMB}MB)`,
        };
    }

    // Verify magic bytes if buffer is available
    if (buffer && MAGIC_BYTES[mimetype]) {
        const isValidMagic = MAGIC_BYTES[mimetype].some(magic =>
            buffer.slice(0, magic.length).equals(magic)
        );

        if (!isValidMagic) {
            return {
                isValid: false,
                error: 'File content does not match its declared type',
            };
        }
    }

    // Check for null bytes in filename (can be used for path traversal)
    if (originalname.includes('\0')) {
        return {
            isValid: false,
            error: 'Invalid filename',
        };
    }

    // Check for path traversal attempts in filename
    if (originalname.includes('..') || originalname.includes('/') || originalname.includes('\\')) {
        return {
            isValid: false,
            error: 'Invalid filename',
        };
    }

    // Generate sanitized filename
    const sanitizedFileName = generateSafeFileName(originalname, ext);

    return {
        isValid: true,
        sanitizedFileName,
        detectedMimeType: mimetype,
    };
}

/**
 * Generate a safe, random filename
 */
export function generateSafeFileName(originalName: string, extension?: string): string {
    const ext = extension || path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const randomBytes = crypto.randomBytes(8).toString('hex');

    return `${timestamp}-${randomBytes}${ext}`;
}

/**
 * Sanitize a filename (remove dangerous characters, preserve extension)
 */
export function sanitizeFileName(filename: string): string {
    // Get extension
    const ext = path.extname(filename).toLowerCase();

    // Get base name without extension
    let baseName = path.basename(filename, ext);

    // Remove dangerous characters
    baseName = baseName
        .replace(/[^a-zA-Z0-9\-_]/g, '_') // Replace non-alphanumeric with underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        .substring(0, 100); // Limit length

    // If baseName is empty after sanitization, generate random
    if (!baseName) {
        baseName = crypto.randomBytes(8).toString('hex');
    }

    return `${baseName}${ext}`;
}

/**
 * Check if a file contains suspicious patterns (for SVG, etc.)
 */
export function containsSuspiciousContent(content: string, mimeType: string): boolean {
    // SVG files can contain scripts
    if (mimeType === 'image/svg+xml') {
        const suspiciousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i, // Event handlers
            /data:/i,
            /<iframe/i,
            /<embed/i,
            /<object/i,
            /<foreignObject/i,
            /<use.*xlink:href/i,
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(content)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Get human-readable file size limit
 */
export function getFileSizeLimit(mimeType: string): string {
    const config = ALLOWED_FILE_TYPES[mimeType];
    if (!config) {
        return 'Unknown';
    }

    const bytes = config.maxSize;
    if (bytes >= 1024 * 1024 * 1024) {
        return `${Math.round(bytes / (1024 * 1024 * 1024))}GB`;
    }
    if (bytes >= 1024 * 1024) {
        return `${Math.round(bytes / (1024 * 1024))}MB`;
    }
    if (bytes >= 1024) {
        return `${Math.round(bytes / 1024)}KB`;
    }
    return `${bytes}B`;
}

/**
 * Get allowed extensions for UI display
 */
export function getAllowedExtensions(types?: string[]): string[] {
    const allowedTypes = types || Object.keys(ALLOWED_FILE_TYPES);
    const extensions: string[] = [];

    for (const type of allowedTypes) {
        const config = ALLOWED_FILE_TYPES[type];
        if (config) {
            extensions.push(...config.extensions);
        }
    }

    return [...new Set(extensions)];
}

/**
 * Validate image dimensions (requires jimp or sharp)
 */
export async function validateImageDimensions(
    _buffer: Buffer,
    _options: {
        maxWidth?: number;
        maxHeight?: number;
        minWidth?: number;
        minHeight?: number;
    }
): Promise<{ isValid: boolean; error?: string; width?: number; height?: number }> {
    // This would require an image processing library like sharp
    // Placeholder implementation
    return {
        isValid: true,
        width: 0,
        height: 0,
    };
}

export default {
    validateFile,
    generateSafeFileName,
    sanitizeFileName,
    containsSuspiciousContent,
    getFileSizeLimit,
    getAllowedExtensions,
    validateImageDimensions,
    ALLOWED_FILE_TYPES,
    DANGEROUS_EXTENSIONS,
};
