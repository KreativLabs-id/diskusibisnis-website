import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Validation
        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: 'Email and password are required'
            }, { status: 400 });
        }

        // Find user
        const result = await pool.query(
            `SELECT id, email, password_hash, display_name, avatar_url, 
                    role, reputation_points, is_banned 
             FROM public.users WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Invalid email or password'
            }, { status: 401 });
        }

        const user = result.rows[0];

        // Check if user is banned
        if (user.is_banned) {
            return NextResponse.json({
                success: false,
                message: 'Your account has been banned'
            }, { status: 403 });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return NextResponse.json({
                success: false,
                message: 'Invalid email or password'
            }, { status: 401 });
        }

        // Generate JWT token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return NextResponse.json({
                success: false,
                message: 'JWT secret not configured'
            }, { status: 500 });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.display_name,
                    avatarUrl: user.avatar_url,
                    role: user.role,
                    reputationPoints: user.reputation_points
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error during login'
        }, { status: 500 });
    }
}
