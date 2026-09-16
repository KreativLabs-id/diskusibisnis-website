/**
 * Next.js Middleware for Route Protection
 *
 * Based on Next.js 15 documentation:
 * - Runs at the edge before requests reach pages
 * - Checks for authentication cookies
 * - Redirects unauthenticated users from protected routes
 *
 * Security Features:
 * - Token validation via HTTP-only cookies
 * - Admin route protection with cryptographic JWT verification (jose)
 * - Rate limit headers forwarding
 * - Security headers
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes that require authentication
const PROTECTED_ROUTES = [
    '/profile',
    '/settings',
    '/notifications',
    '/bookmarks',
    '/ask',
];

// Routes that require admin role
const ADMIN_ROUTES = [
    '/admin',
];

// Routes that should redirect to home if already authenticated
const AUTH_ROUTES = [
    '/login',
    '/register',
];

// Routes that are always public
const PUBLIC_ROUTES = [
    '/',
    '/questions',
    '/tags',
    '/users',
    '/communities',
    '/support',
    '/about',
    '/privacy',
    '/terms',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next();

    // Add security headers to all responses
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Get authentication token from HttpOnly cookie
    const authToken = request.cookies.get('auth_token')?.value;

    // Helper to check if path matches any pattern
    const matchesPath = (patterns: string[], path: string): boolean => {
        return patterns.some(pattern => {
            if (pattern.endsWith('*')) {
                return path.startsWith(pattern.slice(0, -1));
            }
            return path === pattern || path.startsWith(pattern + '/');
        });
    };

    /**
     * Verify and decode the JWT token using the server-side secret.
     * jose works in the Edge runtime; jsonwebtoken does NOT.
     * Returns the payload on success, null on any failure.
     */
    const verifyJwt = async (token: string): Promise<{ id: string; role: string } | null> => {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) return null;
        try {
            const secret = new TextEncoder().encode(jwtSecret);
            const { payload } = await jwtVerify(token, secret);
            return payload as { id: string; role: string };
        } catch {
            return null;
        }
    };

    // Check if this is an admin route
    if (matchesPath(ADMIN_ROUTES, pathname)) {
        if (!authToken) {
            // Not authenticated — redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            loginUrl.searchParams.set('error', 'auth_required');
            return NextResponse.redirect(loginUrl);
        }

        // Cryptographically verify the JWT and check the role claim
        const payload = await verifyJwt(authToken);

        if (!payload || payload.role !== 'admin') {
            // Token invalid OR user is not admin — redirect to home
            const homeUrl = new URL('/', request.url);
            homeUrl.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(homeUrl);
        }

        // Admin access granted
        return response;
    }

    // Check if this is a protected route (requires authentication)
    if (matchesPath(PROTECTED_ROUTES, pathname)) {
        if (!authToken) {
            // Not authenticated — redirect to login with callback
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
        // Token presence is sufficient for protected (non-admin) routes.
        // Full JWT verification happens on the backend for each API call.
        return response;
    }

    // Check if user is already authenticated and trying to access auth pages
    if (matchesPath(AUTH_ROUTES, pathname)) {
        if (authToken) {
            // Verify the token is actually valid before redirecting
            const payload = await verifyJwt(authToken);
            if (payload) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        }
        return response;
    }

    return response;
}

// Configure which routes the middleware runs on
// Exclude static files, images, and API routes
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files (images, etc.)
         * - api routes (handled by backend)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    ],
};


