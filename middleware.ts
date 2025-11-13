import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export function middleware(request: NextRequest) {
  // Only apply middleware to admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      // Get token from localStorage (client-side) or Authorization header (API)
      const authHeader = request.headers.get('authorization');
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        // Redirect to login if no token
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT secret not configured');
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const decoded = jwt.verify(token, jwtSecret) as AuthUser;
      
      // Check if user is admin
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Allow the request to continue
      return NextResponse.next();
    } catch (error) {
      console.error('Admin middleware error:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
