import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';
import { createAnswerNotification } from '@/lib/notification-service';

// POST /api/answers - Create new answer
export async function POST(request: NextRequest) {
    try {
        const user = requireAuth(request);
        const { questionId, content } = await request.json();
        
        if (!questionId || !content) {
            return NextResponse.json({
                success: false,
                message: 'Question ID and content are required'
            }, { status: 400 });
        }
        
        // Check if question exists and is not closed
        const questionResult = await pool.query(
            'SELECT id, is_closed FROM public.questions WHERE id = $1',
            [questionId]
        );
        
        if (questionResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Question not found'
            }, { status: 404 });
        }
        
        const question = questionResult.rows[0];
        
        if (question.is_closed) {
            return NextResponse.json({
                success: false,
                message: 'Cannot answer a closed question'
            }, { status: 400 });
        }
        
        // Create answer
        const result = await pool.query(
            `INSERT INTO public.answers (question_id, author_id, content) 
             VALUES ($1, $2, $3) 
             RETURNING id, question_id, content, is_accepted, created_at, updated_at`,
            [questionId, user.id, content]
        );
        
        const answer = result.rows[0];
        
        // Update question answers count
        await pool.query(
            'UPDATE public.questions SET answers_count = answers_count + 1 WHERE id = $1',
            [questionId]
        );
        
        // Get question details and user info for notification
        const notificationData = await pool.query(
            `SELECT q.title, q.author_id, u.display_name as answerer_name
             FROM public.questions q, public.users u
             WHERE q.id = $1 AND u.id = $2`,
            [questionId, user.id]
        );
        
        if (notificationData.rows.length > 0) {
            const questionData = notificationData.rows[0];
            // Only send notification if answerer is not the question author
            if (questionData.author_id !== user.id) {
                try {
                    await createAnswerNotification(
                        questionData.author_id,
                        questionData.answerer_name,
                        questionData.title,
                        questionId
                    );
                } catch (notifError) {
                    console.error('Error creating answer notification:', notifError);
                    // Don't fail the answer creation if notification fails
                }
            }
        }
        
        return NextResponse.json({
            success: true,
            message: 'Answer created successfully',
            data: { answer }
        }, { status: 201 });
        
    } catch (error) {
        console.error('Create answer error:', error);
        
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
