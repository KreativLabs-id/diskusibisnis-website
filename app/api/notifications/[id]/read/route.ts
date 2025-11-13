import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// PUT /api/notifications/[id]/read - Mark notification as read

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = requireAuth(request);
        const notificationId = params.id;
        
        // Mark notification as read (only if it belongs to the user)
        const result = await pool.query(
            'UPDATE public.notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING id',
            [notificationId, user.id]
        );
        
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Notification not found'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            message: 'Notification marked as read'
        });
        
    } catch (error) {
        console.error('Mark notification as read error:', error);
        
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
