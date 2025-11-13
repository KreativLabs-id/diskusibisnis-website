import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
    try {
        const user = requireAuth(request);
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Admin access required'
            }, { status: 403 });
        }
        
        const result = await pool.query(
            `SELECT id, email, display_name, role, reputation_points, is_banned, created_at 
             FROM public.users 
             ORDER BY created_at DESC`
        );
        
        return NextResponse.json({
            success: true,
            data: { users: result.rows }
        });
        
    } catch (error) {
        console.error('Get admin users error:', error);
        
        if (error instanceof Error && error.message === 'Authentication required') {
            return NextResponse.json({
                success: false,
                message: 'Authentication required'
            }, { status: 401 });
        }
        
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
