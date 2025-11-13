import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// POST /api/admin/users/[id]/unban - Unban user (admin only)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = requireAuth(request);
        const targetUserId = params.id;
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Admin access required'
            }, { status: 403 });
        }
        
        // Check if target user exists
        const userResult = await pool.query(
            'SELECT id FROM public.users WHERE id = $1',
            [targetUserId]
        );
        
        if (userResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }
        
        // Unban user
        await pool.query(
            'UPDATE public.users SET is_banned = FALSE WHERE id = $1',
            [targetUserId]
        );
        
        return NextResponse.json({
            success: true,
            message: 'User unbanned successfully'
        });
        
    } catch (error) {
        console.error('Unban user error:', error);
        
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
