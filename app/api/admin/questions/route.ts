import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/admin/questions - Get all questions (admin only)

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

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
            `SELECT 
                q.id, 
                q.title, 
                q.content, 
                q.created_at, 
                q.updated_at,
                q.views,
                u.display_name as author_name,
                u.email as author_email,
                (SELECT COUNT(*) FROM public.answers a WHERE a.question_id = q.id) as answer_count,
                (SELECT COUNT(*) FROM public.votes v WHERE v.question_id = q.id AND v.vote_type = 'up') as upvotes,
                (SELECT COUNT(*) FROM public.votes v WHERE v.question_id = q.id AND v.vote_type = 'down') as downvotes
             FROM public.questions q 
             JOIN public.users u ON q.user_id = u.id
             ORDER BY q.created_at DESC`
        );
        
        return NextResponse.json({
            success: true,
            data: { questions: result.rows }
        });
        
    } catch (error) {
        console.error('Get admin questions error:', error);
        
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
