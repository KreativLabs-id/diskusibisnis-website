import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/notifications - Get user notifications

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = requireAuth(request);
        
        const result = await pool.query(
            `SELECT id, type, title, message, link, is_read, created_at 
             FROM public.notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [user.id]
        );
        
        return NextResponse.json({
            success: true,
            data: { notifications: result.rows }
        });
        
    } catch (error) {
        console.error('Get notifications error:', error);
        
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
