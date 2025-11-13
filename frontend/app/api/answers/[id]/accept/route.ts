import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// POST /api/answers/[id]/accept - Accept answer
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = requireAuth(request);
        const answerId = params.id;
        
        // Get answer and question details
        const answerResult = await pool.query(
            `SELECT a.*, q.author_id as question_author_id 
             FROM public.answers a 
             JOIN public.questions q ON a.question_id = q.id 
             WHERE a.id = $1`,
            [answerId]
        );
        
        if (answerResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Answer not found'
            }, { status: 404 });
        }
        
        const answer = answerResult.rows[0];
        
        // Only question author can accept answers
        if (answer.question_author_id !== user.id) {
            return NextResponse.json({
                success: false,
                message: 'Only question author can accept answers'
            }, { status: 403 });
        }
        
        // Start transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Unaccept any previously accepted answer for this question
            await client.query(
                'UPDATE public.answers SET is_accepted = FALSE WHERE question_id = $1',
                [answer.question_id]
            );
            
            // Accept this answer
            await client.query(
                'UPDATE public.answers SET is_accepted = TRUE WHERE id = $1',
                [answerId]
            );
            
            // Update question to mark it has accepted answer
            await client.query(
                'UPDATE public.questions SET has_accepted_answer = TRUE WHERE id = $1',
                [answer.question_id]
            );
            
            // Add reputation points to answer author (+15 points for accepted answer)
            await client.query(
                'UPDATE public.users SET reputation_points = reputation_points + 15 WHERE id = $1',
                [answer.author_id]
            );
            
            await client.query('COMMIT');
            
            return NextResponse.json({
                success: true,
                message: 'Answer accepted successfully'
            });
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('Accept answer error:', error);
        
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
