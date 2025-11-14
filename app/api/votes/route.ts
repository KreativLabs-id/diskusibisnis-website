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
        
        console.log('📝 Vote request:', { userId: user.id, targetType, targetId, voteType });
        
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
            let existingVoteResult;
            if (targetType === 'question') {
                existingVoteResult = await client.query(
                    `SELECT id, vote_type FROM public.votes WHERE user_id = $1 AND question_id = $2`,
                    [user.id, targetId]
                );
            } else {
                existingVoteResult = await client.query(
                    `SELECT id, vote_type FROM public.votes WHERE user_id = $1 AND answer_id = $2`,
                    [user.id, targetId]
                );
            }
            
            if (existingVoteResult.rows.length > 0) {
                const existingVote = existingVoteResult.rows[0];
                
                if (existingVote.vote_type === voteType) {
                    // Remove vote if same type
                    console.log('🗑️ Removing existing vote:', existingVote.id);
                    const deleteResult = await client.query(
                        'DELETE FROM public.votes WHERE id = $1',
                        [existingVote.id]
                    );
                    console.log('✅ Vote deleted, rows affected:', deleteResult.rowCount);
                    
                    // Get updated vote counts before commit
                    const countsResult = await client.query(
                        targetType === 'question'
                            ? `SELECT 
                                COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes_count,
                                COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes_count
                               FROM votes WHERE question_id = $1`
                            : `SELECT 
                                COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes_count,
                                COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes_count
                               FROM votes WHERE answer_id = $1`,
                        [targetId]
                    );
                    
                    await client.query('COMMIT');
                    
                    return NextResponse.json({
                        success: true,
                        message: 'Vote removed',
                        data: { 
                            action: 'removed',
                            userVote: null,
                            upvotes_count: parseInt(countsResult.rows[0].upvotes_count) || 0,
                            downvotes_count: parseInt(countsResult.rows[0].downvotes_count) || 0
                        }
                    });
                } else {
                    // Update vote type
                    console.log('🔄 Updating vote type from', existingVote.vote_type, 'to', voteType);
                    const updateResult = await client.query(
                        'UPDATE public.votes SET vote_type = $1 WHERE id = $2',
                        [voteType, existingVote.id]
                    );
                    console.log('✅ Vote updated, rows affected:', updateResult.rowCount);
                    
                    // Get updated vote counts before commit
                    const countsResult = await client.query(
                        targetType === 'question'
                            ? `SELECT 
                                COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes_count,
                                COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes_count
                               FROM votes WHERE question_id = $1`
                            : `SELECT 
                                COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes_count,
                                COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes_count
                               FROM votes WHERE answer_id = $1`,
                        [targetId]
                    );
                    
                    await client.query('COMMIT');
                    
                    return NextResponse.json({
                        success: true,
                        message: 'Vote updated',
                        data: { 
                            action: 'updated', 
                            voteType,
                            userVote: voteType,
                            upvotes_count: parseInt(countsResult.rows[0].upvotes_count) || 0,
                            downvotes_count: parseInt(countsResult.rows[0].downvotes_count) || 0
                        }
                    });
                }
            } else {
                // Create new vote
                console.log('➕ Creating new vote for', targetType);
                let insertResult;
                if (targetType === 'question') {
                    insertResult = await client.query(
                        `INSERT INTO public.votes (user_id, question_id, vote_type) VALUES ($1, $2, $3) RETURNING id`,
                        [user.id, targetId, voteType]
                    );
                } else {
                    insertResult = await client.query(
                        `INSERT INTO public.votes (user_id, answer_id, vote_type) VALUES ($1, $2, $3) RETURNING id`,
                        [user.id, targetId, voteType]
                    );
                }
                console.log('✅ Vote created with id:', insertResult.rows[0]?.id);
                
                // Send notification for upvote
                if (voteType === 'upvote') {
                    try {
                        // Get target content and owner info
                        let contentQuery, notifQuestionId;
                        if (targetType === 'question') {
                            const contentResult = await client.query(
                                `SELECT q.author_id, q.title, q.id as question_id, u.display_name as voter_name
                                 FROM questions q, users u
                                 WHERE q.id = $1 AND u.id = $2`,
                                [targetId, user.id]
                            );
                            if (contentResult.rows.length > 0 && contentResult.rows[0].author_id !== user.id) {
                                await createVoteNotification(
                                    contentResult.rows[0].author_id,
                                    contentResult.rows[0].voter_name,
                                    contentResult.rows[0].title,
                                    contentResult.rows[0].question_id,
                                    'upvote',
                                    'question'
                                );
                            }
                        } else {
                            const contentResult = await client.query(
                                `SELECT a.author_id, q.title, q.id as question_id, u.display_name as voter_name
                                 FROM answers a
                                 JOIN questions q ON a.question_id = q.id
                                 JOIN users u ON u.id = $2
                                 WHERE a.id = $1`,
                                [targetId, user.id]
                            );
                            if (contentResult.rows.length > 0 && contentResult.rows[0].author_id !== user.id) {
                                await createVoteNotification(
                                    contentResult.rows[0].author_id,
                                    contentResult.rows[0].voter_name,
                                    contentResult.rows[0].title,
                                    contentResult.rows[0].question_id,
                                    'upvote',
                                    'answer'
                                );
                            }
                        }
                    } catch (notifError) {
                        console.error('Error creating vote notification:', notifError);
                        // Don't fail the vote if notification fails
                    }
                }
                
                // Get updated vote counts before commit
                const countsResult = await client.query(
                    targetType === 'question'
                        ? `SELECT 
                            COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes_count,
                            COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes_count
                           FROM votes WHERE question_id = $1`
                        : `SELECT 
                            COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes_count,
                            COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes_count
                           FROM votes WHERE answer_id = $1`,
                    [targetId]
                );
                
                await client.query('COMMIT');
                
                return NextResponse.json({
                    success: true,
                    message: 'Vote created',
                    data: { 
                        action: 'created', 
                        voteType,
                        userVote: voteType,
                        upvotes_count: parseInt(countsResult.rows[0].upvotes_count) || 0,
                        downvotes_count: parseInt(countsResult.rows[0].downvotes_count) || 0
                    }
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
