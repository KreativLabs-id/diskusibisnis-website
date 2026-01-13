/**
 * Content Security Policy (CSP) Configuration
 * 
 * CSP helps prevent XSS attacks by specifying which sources of content are allowed.
 * 
 * Based on:
 * - MDN CSP: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 * - Helmet.js CSP: https://helmetjs.github.io/docs/csp/
 * - OWASP CSP Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html
 * 
 * IMPORTANT: CSP must be carefully configured to not break legitimate functionality.
 * Test thoroughly before deploying to production!
 */

import { HelmetOptions } from 'helmet';

// Get current environment
const isProduction = process.env.NODE_ENV === 'production';

// Dynamic values for CSP
// These should match your actual domain and CDN URLs
const API_URL = process.env.API_URL || "'self'";

/**
 * CSP Directives for the application
 * 
 * Each directive specifies allowed sources for different content types.
 * Use the most restrictive policy that still allows your app to function.
 */
export const contentSecurityPolicy = {
    directives: {
        // Default fallback for all resource types not explicitly specified
        defaultSrc: ["'self'"],

        // JavaScript sources
        scriptSrc: [
            "'self'",
            // Google Sign-In
            'https://accounts.google.com',
            'https://apis.google.com',
            // Google Analytics (if used)
            'https://www.googletagmanager.com',
            'https://www.google-analytics.com',
            // Allow inline scripts for Next.js hydration
            // Note: Using 'unsafe-inline' weakens CSP but is needed for many frameworks
            // In production, consider using nonces instead
            ...(isProduction ? [] : ["'unsafe-inline'"]),
            // For development hot reload
            ...(isProduction ? [] : ["'unsafe-eval'"]),
        ],

        // CSS sources
        styleSrc: [
            "'self'",
            // Allow inline styles (common for component libraries)
            "'unsafe-inline'",
            // Google Fonts
            'https://fonts.googleapis.com',
        ],

        // Image sources
        imgSrc: [
            "'self'",
            // Data URLs for inline images
            'data:',
            // Blob URLs for uploaded images
            'blob:',
            // Supabase Storage
            'https://*.supabase.co',
            // Cloudinary (if used)
            'https://res.cloudinary.com',
            // Google (avatars)
            'https://*.googleusercontent.com',
            'https://lh3.googleusercontent.com',
            // Gravatar
            'https://www.gravatar.com',
            'https://gravatar.com',
        ],

        // Font sources
        fontSrc: [
            "'self'",
            // Google Fonts
            'https://fonts.gstatic.com',
            // Data URLs for embedded fonts
            'data:',
        ],

        // API/XHR/fetch sources
        connectSrc: [
            "'self'",
            // Backend API
            API_URL,
            // Supabase
            'https://*.supabase.co',
            'wss://*.supabase.co', // WebSocket for realtime
            // Google APIs
            'https://accounts.google.com',
            'https://www.googleapis.com',
            // Analytics
            'https://www.google-analytics.com',
            'https://analytics.google.com',
            // Development
            ...(isProduction ? [] : ['ws://localhost:*', 'http://localhost:*']),
        ],

        // Frame sources (for embedded content)
        frameSrc: [
            "'self'",
            // Google Sign-In popup
            'https://accounts.google.com',
            // YouTube embeds (if used)
            'https://www.youtube.com',
            'https://youtube.com',
        ],

        // Object sources (Flash, Java, etc.) - Block all
        objectSrc: ["'none'"],

        // Media sources (audio, video)
        mediaSrc: [
            "'self'",
            'blob:',
            // Supabase Storage
            'https://*.supabase.co',
        ],

        // Form action targets
        formAction: ["'self'"],

        // Base URI for relative URLs
        baseUri: ["'self'"],

        // Frame ancestors (who can embed our site)
        frameAncestors: ["'self'"],

        // Worker sources
        workerSrc: ["'self'", 'blob:'],

        // Manifest sources (PWA)
        manifestSrc: ["'self'"],

        // Upgrade insecure requests in production
        ...(isProduction ? { upgradeInsecureRequests: [] } : {}),

        // Block mixed content in production
        ...(isProduction ? { blockAllMixedContent: [] } : {}),
    },

    // Report violations to this endpoint (optional)
    // reportUri: '/api/csp-report',

    // Use Report-Only mode first to test without breaking the site
    // Set to true when initially deploying CSP
    reportOnly: !isProduction,
};

/**
 * Complete Helmet configuration with CSP
 */
export const helmetConfig: HelmetOptions = {
    // Content Security Policy
    contentSecurityPolicy: contentSecurityPolicy,

    // Cross-Origin-Embedder-Policy
    crossOriginEmbedderPolicy: false, // Can break some third-party scripts

    // Cross-Origin-Opener-Policy
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }, // Allow Google popup

    // Cross-Origin-Resource-Policy
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow cross-origin resources

    // DNS Prefetch Control
    dnsPrefetchControl: { allow: true },

    // Expect-CT - Certificate Transparency
    // expectCt is deprecated in modern browsers

    // Frameguard (X-Frame-Options)
    frameguard: { action: 'sameorigin' },

    // Hide Powered-By header
    hidePoweredBy: true,

    // HSTS (Strict-Transport-Security)
    hsts: isProduction ? {
        maxAge: 63072000, // 2 years
        includeSubDomains: true,
        preload: true,
    } : false,

    // IE No Open
    ieNoOpen: true,

    // No Sniff (X-Content-Type-Options)
    noSniff: true,

    // Origin Agent Cluster
    originAgentCluster: true,

    // Permitted Cross-Domain Policies
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },

    // Referrer Policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // XSS Filter (X-XSS-Protection) - Legacy but still useful
    xssFilter: true,
};

/**
 * Helper to generate CSP header string for debugging
 */
export function getCSPHeaderString(): string {
    const directives = contentSecurityPolicy.directives;
    const parts: string[] = [];

    for (const [key, values] of Object.entries(directives)) {
        if (Array.isArray(values) && values.length > 0) {
            const directiveName = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            parts.push(`${directiveName} ${values.join(' ')}`);
        } else if (key === 'upgradeInsecureRequests' || key === 'blockAllMixedContent') {
            const directiveName = key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            parts.push(directiveName);
        }
    }

    return parts.join('; ');
}
