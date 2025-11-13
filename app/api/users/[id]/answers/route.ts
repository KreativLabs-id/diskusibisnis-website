import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET /api/users/[id]/answers - Get user's answers

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

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
        
        // Get user's answers with question details
        const result = await pool.query(
            `SELECT 
                a.id, a.content, a.is_accepted, a.created_at, a.updated_at,
                q.id as question_id, q.title as question_title,
                COUNT(DISTINCT v.id) FILTER (WHERE v.vote_type = 'upvote') as upvotes
             FROM public.answers a 
             JOIN public.questions q ON a.question_id = q.id 
             LEFT JOIN public.votes v ON a.id = v.votable_id AND v.votable_type = 'answer'
             WHERE a.author_id = $1 
             GROUP BY a.id, q.id, q.title
             ORDER BY a.created_at DESC`,
            [userId]
        );
        
        return NextResponse.json({
            success: true,
            data: { answers: result.rows }
        });
        
    } catch (error) {
        console.error('Get user answers error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
