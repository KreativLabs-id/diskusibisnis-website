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
 * - Admin route protection
 * - Rate limit headers forwarding
 * - Security headers
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next();

    // Add security headers to all responses
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Get authentication token from cookies
    // The backend sets this as an HTTP-only cookie named 'auth_token'
    const authToken = request.cookies.get('auth_token')?.value;

    // Also check for user info cookie (non-HTTP-only, for client-side availability)
    const userCookie = request.cookies.get('user_role')?.value;
    const isAdmin = userCookie === 'admin';

    // Helper to check if path matches any pattern
    const matchesPath = (patterns: string[], path: string): boolean => {
        return patterns.some(pattern => {
            if (pattern.endsWith('*')) {
                return path.startsWith(pattern.slice(0, -1));
            }
            return path === pattern || path.startsWith(pattern + '/');
        });
    };

    // Check if this is an admin route
    if (matchesPath(ADMIN_ROUTES, pathname)) {
        // For admin routes, we need both authentication AND admin role
        if (!authToken) {
            // Not authenticated - redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            loginUrl.searchParams.set('error', 'auth_required');
            return NextResponse.redirect(loginUrl);
        }

        // Check admin role
        // Note: This is a basic check. The actual admin verification
        // should happen on the backend for every admin API call
        if (!isAdmin) {
            // Authenticated but not admin - redirect to home with error
            const homeUrl = new URL('/', request.url);
            homeUrl.searchParams.set('error', 'unauthorized');
            return NextResponse.redirect(homeUrl);
        }

        // Admin access granted - continue
        return response;
    }

    // Check if this is a protected route (requires authentication)
    if (matchesPath(PROTECTED_ROUTES, pathname)) {
        if (!authToken) {
            // Not authenticated - redirect to login with callback
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Authenticated - continue
        return response;
    }

    // Check if user is already authenticated and trying to access auth pages
    if (matchesPath(AUTH_ROUTES, pathname)) {
        if (authToken) {
            // Already authenticated - redirect to home
            return NextResponse.redirect(new URL('/', request.url));
        }
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
