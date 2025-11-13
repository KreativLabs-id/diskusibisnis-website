import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET /api/debug/user - Debug endpoint to check user info
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        
        if (!email) {
            return NextResponse.json({
                success: false,
                message: 'Email parameter required'
            }, { status: 400 });
        }
        
        // Get user info
        const result = await pool.query(
            'SELECT id, email, display_name, role, created_at FROM public.users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Debug user error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}

// POST /api/debug/user - Update user role
export async function POST(request: NextRequest) {
    try {
        const { email, role } = await request.json();
        
        if (!email || !role) {
            return NextResponse.json({
                success: false,
                message: 'Email and role required'
            }, { status: 400 });
        }
        
        // Update user role
        const result = await pool.query(
            'UPDATE public.users SET role = $1 WHERE email = $2 RETURNING id, email, display_name, role',
            [role, email]
        );
        
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            message: 'User role updated',
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error('Update user role error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
