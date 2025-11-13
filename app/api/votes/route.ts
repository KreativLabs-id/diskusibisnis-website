import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';
import { createVoteNotification } from '@/lib/notification-service';

// POST /api/votes - Create or update vote

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const user = requireAuth(request);
        const { targetType, targetId, voteType } = await request.json();
        
        if (!targetType || !targetId || !voteType) {
            return NextResponse.json({
                success: false,
                message: 'Target type, target ID, and vote type are required'
            }, { status: 400 });
        }
        
        if (!['question', 'answer'].includes(targetType)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid target type'
            }, { status: 400 });
        }
        
        if (!['upvote', 'downvote'].includes(voteType)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid vote type'
            }, { status: 400 });
        }
        
        // Check if target exists
        const targetTable = targetType === 'question' ? 'questions' : 'answers';
        const targetResult = await pool.query(
            `SELECT id FROM public.${targetTable} WHERE id = $1`,
            [targetId]
        );
        
        if (targetResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: `${targetType} not found`
            }, { status: 404 });
        }
        
        // Start transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Check if user already voted
            const existingVoteResult = await client.query(
                `SELECT id, vote_type FROM public.votes 
                 WHERE user_id = $1 AND votable_type = $2 AND votable_id = $3`,
                [user.id, targetType, targetId]
            );
            
            if (existingVoteResult.rows.length > 0) {
                const existingVote = existingVoteResult.rows[0];
                
                if (existingVote.vote_type === voteType) {
                    // Remove vote if same type
                    await client.query(
                        'DELETE FROM public.votes WHERE id = $1',
                        [existingVote.id]
                    );
                    
                    await client.query('COMMIT');
                    
                    return NextResponse.json({
                        success: true,
                        message: 'Vote removed',
                        data: { action: 'removed' }
                    });
                } else {
                    // Update vote type
                    await client.query(
                        'UPDATE public.votes SET vote_type = $1 WHERE id = $2',
                        [voteType, existingVote.id]
                    );
                    
                    await client.query('COMMIT');
                    
                    return NextResponse.json({
                        success: true,
                        message: 'Vote updated',
                        data: { action: 'updated', voteType }
                    });
                }
            } else {
                // Create new vote
                await client.query(
                    `INSERT INTO public.votes (user_id, votable_type, votable_id, vote_type) 
                     VALUES ($1, $2, $3, $4)`,
                    [user.id, targetType, targetId, voteType]
                );
                
                await client.query('COMMIT');
                
                return NextResponse.json({
                    success: true,
                    message: 'Vote created',
                    data: { action: 'created', voteType }
                }, { status: 201 });
            }
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('Vote error:', error);
        
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
