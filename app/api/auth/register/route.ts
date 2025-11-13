import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/database';

export async function POST(request: NextRequest) {
    try {
        const { email, password, displayName } = await request.json();

        // Validation
        if (!email || !password || !displayName) {
            return NextResponse.json({
                success: false,
                message: 'Email, password, and display name are required'
            }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await pool.query(
            'SELECT id FROM public.users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'User already exists with this email'
            }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user in database
        const result = await pool.query(
            `INSERT INTO public.users (email, password_hash, display_name, role) 
             VALUES ($1, $2, $3, 'member') 
             RETURNING id, email, display_name, role, reputation_points, created_at`,
            [email, passwordHash, displayName]
        );

        const user = result.rows[0];

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
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    displayName: user.display_name,
                    role: user.role,
                    reputationPoints: user.reputation_points
                },
                token
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Register error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error details:', errorMessage);
        
        return NextResponse.json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 });
    }
}
