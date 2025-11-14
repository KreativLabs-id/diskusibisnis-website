import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// POST /api/answers/[id]/accept - Accept answer

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const user = requireAuth(request);
        const resolvedParams = await Promise.resolve(params);
        const answerId = resolvedParams.id;
        
        if (!answerId || answerId === 'undefined' || answerId === 'null') {
            return NextResponse.json({
                success: false,
                message: 'Invalid answer ID'
            }, { status: 400 });
        }
        
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
            
            // Check if this answer is already accepted
            const isCurrentlyAccepted = answer.is_accepted;
            
            if (isCurrentlyAccepted) {
                // UNACCEPT: Remove acceptance
                await client.query(
                    'UPDATE public.answers SET is_accepted = FALSE WHERE id = $1',
                    [answerId]
                );
                
                // Remove reputation points from answer author (-15 points)
                await client.query(
                    'UPDATE public.users SET reputation_points = GREATEST(0, reputation_points - 15) WHERE id = $1',
                    [answer.author_id]
                );
                
                await client.query('COMMIT');
                
                return NextResponse.json({
                    success: true,
                    message: 'Answer unaccepted successfully',
                    action: 'unaccepted'
                });
            } else {
                // ACCEPT: First, unaccept any previously accepted answer for this question
                const previousAcceptedResult = await client.query(
                    'SELECT id, author_id FROM public.answers WHERE question_id = $1 AND is_accepted = TRUE',
                    [answer.question_id]
                );
                
                // Remove reputation from previous accepted answer author if exists
                if (previousAcceptedResult.rows.length > 0) {
                    await client.query(
                        'UPDATE public.users SET reputation_points = GREATEST(0, reputation_points - 15) WHERE id = $1',
                        [previousAcceptedResult.rows[0].author_id]
                    );
                }
                
                // Unaccept all answers for this question
                await client.query(
                    'UPDATE public.answers SET is_accepted = FALSE WHERE question_id = $1',
                    [answer.question_id]
                );
                
                // Accept this answer
                await client.query(
                    'UPDATE public.answers SET is_accepted = TRUE WHERE id = $1',
                    [answerId]
                );
                
                // Add reputation points to answer author (+15 points for accepted answer)
                await client.query(
                    'UPDATE public.users SET reputation_points = reputation_points + 15 WHERE id = $1',
                    [answer.author_id]
                );
                
                await client.query('COMMIT');
                
                return NextResponse.json({
                    success: true,
                    message: 'Answer accepted successfully',
                    action: 'accepted'
                });
            }
            
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
