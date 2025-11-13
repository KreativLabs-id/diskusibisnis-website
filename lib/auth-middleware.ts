import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
    id: string;
    email: string;
    role: string;
}

export function authenticateToken(request: NextRequest): AuthUser | null {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return null;
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT secret not configured');
        }

        const decoded = jwt.verify(token, jwtSecret) as AuthUser;
        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

export function requireAuth(request: NextRequest): AuthUser {
    const user = authenticateToken(request);
    if (!user) {
        throw new Error('Authentication required');
    }
    return user;
}
