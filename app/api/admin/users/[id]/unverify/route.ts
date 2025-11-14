import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// POST /api/admin/users/[id]/unverify - Unverify user (admin only)
export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = requireAuth(request);
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Admin access required'
            }, { status: 403 });
        }
        
        const targetUserId = params.id;
        
        // Check if target user exists and is not admin
        const userResult = await pool.query(
            'SELECT id, role FROM public.users WHERE id = $1',
            [targetUserId]
        );
        
        if (userResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }
        
        // Don't allow unverifying admin users
        if (userResult.rows[0].role === 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Cannot unverify admin users'
            }, { status: 400 });
        }
        
        // Unverify user
        await pool.query(
            'UPDATE public.users SET is_verified = FALSE WHERE id = $1',
            [targetUserId]
        );
        
        return NextResponse.json({
            success: true,
            message: 'User unverified successfully'
        });
        
    } catch (error) {
        console.error('Unverify user error:', error);
        
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
