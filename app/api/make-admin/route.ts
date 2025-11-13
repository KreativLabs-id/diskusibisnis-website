import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// POST /api/make-admin - Simple endpoint to make user admin
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const { email, secret } = await request.json();
        
        // Simple secret check
        if (secret !== 'makeadmin2024') {
            return NextResponse.json({
                success: false,
                message: 'Invalid secret'
            }, { status: 403 });
        }
        
        // Update user role to admin
        const result = await pool.query(
            'UPDATE public.users SET role = $1 WHERE email = $2 RETURNING id, email, display_name, role',
            ['admin', email]
        );
        
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            message: 'User role updated to admin',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Make admin error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
