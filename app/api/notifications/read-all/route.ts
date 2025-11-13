import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// PUT /api/notifications/read-all - Mark all notifications as read

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
    try {
        const user = requireAuth(request);
        
        // Mark all user's notifications as read
        await pool.query(
            'UPDATE public.notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
            [user.id]
        );
        
        return NextResponse.json({
            success: true,
            message: 'All notifications marked as read'
        });
        
    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        
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
