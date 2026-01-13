/**
 * Environment Variables Validation
 * Ensures all required environment variables are set and properly configured
 * 
 * Security Features:
 * - Validates all required env vars exist
 * - Checks for sensitive patterns in public vars
 * - Throws error if configuration is insecure
 */

interface EnvConfig {
    // Server
    PORT: number;
    NODE_ENV: 'development' | 'production' | 'test';

    // Database
    DATABASE_URL: string;

    // JWT
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;

    // CORS
    CORS_ORIGIN: string | string[];

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;

    // Redis (optional but recommended for production)
    REDIS_URL?: string;

    // Supabase (optional)
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
}

// List of required environment variables
const REQUIRED_ENV_VARS = [
    'DATABASE_URL',
    'JWT_SECRET',
] as const;

// Patterns that should NEVER be in public/exposed variables
const SENSITIVE_PATTERNS = [
    /password/i,
    /secret/i,
    /private/i,
    /service_role/i,
    /jwt_secret/i,
];

// Minimum JWT secret length for security
const MIN_JWT_SECRET_LENGTH = 32;

/**
 * Validates that all required environment variables are set
 */
function validateRequiredVars(): void {
    const missingVars: string[] = [];

    for (const varName of REQUIRED_ENV_VARS) {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    }

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}\n` +
            `Please check your .env file and ensure all required variables are set.`
        );
    }
}

/**
 * Validates that sensitive data is not exposed in public variables
 */
function validateNoSensitiveExposure(): void {
    const exposedVars: string[] = [];

    // Check for any variable that starts with NEXT_PUBLIC_ or similar public prefixes
    const publicPrefixes = ['NEXT_PUBLIC_', 'REACT_APP_', 'VITE_'];

    for (const [key, value] of Object.entries(process.env)) {
        // Check if this is a public variable
        const isPublic = publicPrefixes.some(prefix => key.startsWith(prefix));

        if (isPublic && value) {
            // Check if the variable name contains sensitive patterns
            for (const pattern of SENSITIVE_PATTERNS) {
                if (pattern.test(key)) {
                    exposedVars.push(`${key} (matches pattern: ${pattern})`);
                    break;
                }
            }

            // Check if the variable value looks like a sensitive secret
            if (value.length > 40 && /^[A-Za-z0-9+/=]+$/.test(value)) {
                // Looks like a base64 encoded secret
                console.warn(`⚠️ Warning: ${key} might contain a sensitive value. Review if this should be public.`);
            }
        }
    }

    if (exposedVars.length > 0) {
        throw new Error(
            `SECURITY ERROR: Sensitive variables exposed with public prefix!\n` +
            `Exposed variables: ${exposedVars.join(', ')}\n` +
            `These variables should NOT have NEXT_PUBLIC_ or similar prefixes.`
        );
    }
}

/**
 * Validates JWT secret strength
 */
function validateJWTSecret(): void {
    const jwtSecret = process.env.JWT_SECRET || '';

    if (jwtSecret.length < MIN_JWT_SECRET_LENGTH) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error(
                `SECURITY ERROR: JWT_SECRET is too short!\n` +
                `Minimum length: ${MIN_JWT_SECRET_LENGTH} characters\n` +
                `Current length: ${jwtSecret.length} characters\n` +
                `Generate a secure secret using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
            );
        } else {
            console.warn(
                `⚠️ Warning: JWT_SECRET is shorter than recommended (${MIN_JWT_SECRET_LENGTH} chars).\n` +
                `This is acceptable for development but MUST be changed for production.`
            );
        }
    }

    // Check for common weak secrets
    const weakSecrets = [
        'secret',
        'jwt_secret',
        'your-secret-key',
        'change-this',
        'password',
        '123456',
    ];

    const normalizedSecret = jwtSecret.toLowerCase();
    for (const weak of weakSecrets) {
        if (normalizedSecret.includes(weak)) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error(
                    `SECURITY ERROR: JWT_SECRET contains weak pattern: "${weak}"\n` +
                    `Please use a strong, randomly generated secret.`
                );
            } else {
                console.warn(`⚠️ Warning: JWT_SECRET contains weak pattern: "${weak}". Change this for production.`);
            }
        }
    }
}

/**
 * Validates database URL is not exposed
 */
function validateDatabaseURL(): void {
    // Check if DATABASE_URL is accidentally exposed as public
    if (process.env.NEXT_PUBLIC_DATABASE_URL) {
        throw new Error(
            `CRITICAL SECURITY ERROR: DATABASE_URL is exposed as NEXT_PUBLIC_DATABASE_URL!\n` +
            `This exposes your database credentials to the client.\n` +
            `Remove the NEXT_PUBLIC_ prefix immediately!`
        );
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        throw new Error('DATABASE_URL is not set');
    }

    // Validate URL format
    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
        throw new Error('DATABASE_URL must be a valid PostgreSQL connection string');
    }
}

/**
 * Validates Redis configuration for production
 */
function validateRedisConfig(): void {
    if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
        console.warn(
            `⚠️ Warning: REDIS_URL is not configured.\n` +
            `For production, Redis is recommended for rate limiting and session storage.\n` +
            `Currently using in-memory storage which doesn't persist across restarts.`
        );
    }
}

/**
 * Main validation function - run at application startup
 */
export function validateEnvironment(): void {
    console.log('🔐 Validating environment variables...');

    try {
        validateRequiredVars();
        validateNoSensitiveExposure();
        validateJWTSecret();
        validateDatabaseURL();
        validateRedisConfig();

        console.log('✅ Environment validation passed');
    } catch (error) {
        console.error('❌ Environment validation failed!');
        throw error;
    }
}

/**
 * Get validated environment configuration
 */
export function getEnvConfig(): EnvConfig {
    validateEnvironment();

    const corsOrigin = process.env.CORS_ORIGIN;
    let parsedCorsOrigin: string | string[];

    if (corsOrigin === '*') {
        parsedCorsOrigin = '*';
    } else if (corsOrigin) {
        parsedCorsOrigin = corsOrigin.split(',').map(origin => origin.trim());
    } else {
        parsedCorsOrigin = process.env.NODE_ENV === 'production'
            ? []
            : ['http://localhost:3000', 'http://localhost:3001'];
    }

    return {
        PORT: parseInt(process.env.PORT || '5000', 10),
        NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
        DATABASE_URL: process.env.DATABASE_URL!,
        JWT_SECRET: process.env.JWT_SECRET!,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
        CORS_ORIGIN: parsedCorsOrigin,
        RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        REDIS_URL: process.env.REDIS_URL,
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
}

/**
 * Runtime check to prevent database access from client-side code
 * This should never happen in a backend, but adding for completeness
 */
export function assertServerSide(): void {
    // In a Node.js backend, we are always on the server side
    // This check is for when this module is accidentally imported in a browser context
    // Check if we're in a browser by looking for globalThis.window
    if (typeof globalThis !== 'undefined' && 'window' in globalThis && typeof (globalThis as any).window !== 'undefined') {
        throw new Error(
            'SECURITY ERROR: Attempted to access server-side code from client!\n' +
            'This file should only be imported in server-side code.'
        );
    }
}

export default { validateEnvironment, getEnvConfig, assertServerSide };
