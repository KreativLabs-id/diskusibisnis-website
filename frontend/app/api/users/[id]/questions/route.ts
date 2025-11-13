import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET /api/users/[id]/questions - Get user's questions
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        
        // Check if user exists
        const userResult = await pool.query(
            'SELECT id FROM public.users WHERE id = $1 AND is_banned = FALSE',
            [userId]
        );
        
        if (userResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }
        
        // Get user's questions with answer count
        const result = await pool.query(
            `SELECT 
                q.id, q.title, q.content, q.views_count, q.is_closed, q.created_at, q.updated_at,
                COUNT(DISTINCT a.id) as answer_count,
                COUNT(DISTINCT v.id) FILTER (WHERE v.vote_type = 'upvote') as upvotes,
                ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
             FROM public.questions q 
             LEFT JOIN public.answers a ON q.id = a.question_id 
             LEFT JOIN public.votes v ON q.id = v.votable_id AND v.votable_type = 'question'
             LEFT JOIN public.question_tags qt ON q.id = qt.question_id
             LEFT JOIN public.tags t ON qt.tag_id = t.id
             WHERE q.author_id = $1 
             GROUP BY q.id 
             ORDER BY q.created_at DESC`,
            [userId]
        );
        
        return NextResponse.json({
            success: true,
            data: { questions: result.rows }
        });
        
    } catch (error) {
        console.error('Get user questions error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
