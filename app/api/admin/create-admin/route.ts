import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// POST /api/admin/create-admin - Create admin account (development only)

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Only allow in development or with special key
        const { email, password, displayName, adminKey } = await request.json();
        
        // Simple protection - you can change this key
        if (adminKey !== 'create-admin-diskusibisnis-2024') {
            return NextResponse.json({
                success: false,
                message: 'Invalid admin key'
            }, { status: 403 });
        }
        
        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM public.users WHERE email = $1',
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'User already exists'
            }, { status: 400 });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        const userId = randomUUID();
        
        // Create admin user
        const result = await pool.query(
            `INSERT INTO public.users (
                id, email, password_hash, display_name, role, reputation_points, is_banned, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
            RETURNING id, email, display_name, role`,
            [userId, email, hashedPassword, displayName, 'admin', 0, false]
        );
        
        return NextResponse.json({
            success: true,
            message: 'Admin account created successfully',
            data: {
                user: result.rows[0]
            }
        });
        
    } catch (error) {
        console.error('Create admin error:', error);
        
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
