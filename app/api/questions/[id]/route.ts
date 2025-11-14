import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { authenticateToken, requireAuth } from '@/lib/auth-middleware';
import { generateUniqueSlug } from '@/lib/slug-utils';

// GET /api/questions/[id] - Get question by ID

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const questionId = params.id;
        
        // Try to get user from token (optional for this endpoint)
        let currentUserId = null;
        try {
            const user = requireAuth(request);
            currentUserId = user.id;
        } catch (error) {
            // User not authenticated, continue without user-specific data
        }
        
        const result = await pool.query(`
            SELECT 
                q.id, q.title, q.content, 
                COALESCE(q.views_count, 0) as views_count, 
                q.is_closed, q.created_at, q.updated_at,
                u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar,
                u.reputation_points as author_reputation, 
                COALESCE(u.is_verified, false) as author_is_verified,
                COALESCE(
                    (SELECT COUNT(*) FROM public.votes v WHERE v.question_id = q.id AND v.vote_type = 'upvote'), 
                    0
                ) as upvotes_count,
                COALESCE(
                    (SELECT COUNT(*) FROM public.votes v WHERE v.question_id = q.id AND v.vote_type = 'downvote'), 
                    0
                ) as downvotes_count,
                COUNT(DISTINCT a.id) as answers_count,
                CASE 
                    WHEN $2::uuid IS NOT NULL THEN 
                        (SELECT v.vote_type FROM public.votes v WHERE v.question_id = q.id AND v.user_id = $2)
                    ELSE NULL 
                END as user_vote,
                CASE 
                    WHEN $2::uuid IS NOT NULL THEN 
                        EXISTS(SELECT 1 FROM public.bookmarks b WHERE b.question_id = q.id AND b.user_id = $2)
                    ELSE FALSE 
                END as is_bookmarked
            FROM public.questions q
            LEFT JOIN public.users u ON q.author_id = u.id
            LEFT JOIN public.answers a ON q.id = a.question_id
            WHERE q.id = $1
            GROUP BY q.id, u.id
        `, [questionId, currentUserId]);
        
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Question not found'
            }, { status: 404 });
        }
        
        const question = result.rows[0];
        
        // Get tags for this question
        const tagsResult = await pool.query(`
            SELECT t.id, t.name, t.slug
            FROM public.tags t
            JOIN public.question_tags qt ON t.id = qt.tag_id
            WHERE qt.question_id = $1
        `, [questionId]);
        
        question.tags = tagsResult.rows;
        
        // Get answers for this question
        const answersResult = await pool.query(`
            SELECT 
                a.id, a.content, a.is_accepted, a.created_at, a.updated_at,
                u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar,
                u.reputation_points as author_reputation, 
                COALESCE(u.is_verified, false) as author_is_verified,
                COALESCE(
                    (SELECT COUNT(*) FROM public.votes v WHERE v.answer_id = a.id AND v.vote_type = 'upvote'), 
                    0
                ) as upvotes_count,
                COALESCE(
                    (SELECT COUNT(*) FROM public.votes v WHERE v.answer_id = a.id AND v.vote_type = 'downvote'), 
                    0
                ) as downvotes_count,
                CASE 
                    WHEN $2::uuid IS NOT NULL THEN 
                        (SELECT v.vote_type FROM public.votes v WHERE v.answer_id = a.id AND v.user_id = $2)
                    ELSE NULL 
                END as user_vote
            FROM public.answers a
            LEFT JOIN public.users u ON a.author_id = u.id
            WHERE a.question_id = $1
            ORDER BY a.is_accepted DESC, a.created_at ASC
        `, [questionId, currentUserId]);
        
        // Combine question and answers into the expected format
        const questionWithAnswers = {
            ...question,
            answers: answersResult.rows
        };
        
        return NextResponse.json({
            success: true,
            data: questionWithAnswers
        });
    } catch (error) {
        console.error('Get question error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}

// PUT /api/questions/[id] - Update question
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = requireAuth(request);
        const questionId = params.id;
        const { title, content, tags } = await request.json();
        
        // Check if question exists and user is author
        const questionResult = await pool.query(
            'SELECT author_id FROM public.questions WHERE id = $1',
            [questionId]
        );
        
        if (questionResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Question not found'
            }, { status: 404 });
        }
        
        const question = questionResult.rows[0];
        
        // Check if user is author or admin
        if (question.author_id !== user.id && user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Not authorized to update this question'
            }, { status: 403 });
        }
        
        // Start transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Update question
            const updateResult = await client.query(
                `UPDATE public.questions 
                 SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $3 
                 RETURNING id, title, content, views_count, is_closed, created_at, updated_at`,
                [title, content, questionId]
            );
            
            // Handle tags if provided
            if (tags) {
                // Remove existing tags
                await client.query(
                    'DELETE FROM public.question_tags WHERE question_id = $1',
                    [questionId]
                );
                
                // Add new tags
                for (const tagName of tags) {
                    // Get or create tag (case-insensitive lookup)
                    let tagResult = await client.query(
                        'SELECT id FROM public.tags WHERE LOWER(name) = LOWER($1)',
                        [tagName]
                    );
                    
                    let tagId;
                    if (tagResult.rows.length === 0) {
                        // Create new tag with unique slug
                        const checkSlugExists = async (slug: string): Promise<boolean> => {
                            const result = await client.query(
                                'SELECT id FROM public.tags WHERE slug = $1',
                                [slug]
                            );
                            return result.rows.length > 0;
                        };
                        
                        const uniqueSlug = await generateUniqueSlug(tagName, checkSlugExists);
                        const newTagResult = await client.query(
                            'INSERT INTO public.tags (name, slug) VALUES ($1, $2) RETURNING id',
                            [tagName, uniqueSlug]
                        );
                        tagId = newTagResult.rows[0].id;
                    } else {
                        tagId = tagResult.rows[0].id;
                    }
                    
                    // Link question to tag
                    await client.query(
                        'INSERT INTO public.question_tags (question_id, tag_id) VALUES ($1, $2)',
                        [questionId, tagId]
                    );
                }
            }
            
            await client.query('COMMIT');
            
            return NextResponse.json({
                success: true,
                message: 'Question updated successfully',
                data: { question: updateResult.rows[0] }
            });
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('Update question error:', error);
        
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

// DELETE /api/questions/[id] - Delete question
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = requireAuth(request);
        const questionId = params.id;
        
        // Check if question exists and user is author
        const questionResult = await pool.query(
            'SELECT author_id FROM public.questions WHERE id = $1',
            [questionId]
        );
        
        if (questionResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Question not found'
            }, { status: 404 });
        }
        
        const question = questionResult.rows[0];
        
        // Check if user is author or admin
        if (question.author_id !== user.id && user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Not authorized to delete this question'
            }, { status: 403 });
        }
        
        // Delete question (cascade will handle related records)
        await pool.query('DELETE FROM public.questions WHERE id = $1', [questionId]);
        
        return NextResponse.json({
            success: true,
            message: 'Question deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete question error:', error);
        
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
