import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// PUT /api/answers/[id] - Update answer
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = requireAuth(request);
        const answerId = params.id;
        const { content } = await request.json();
        
        if (!content) {
            return NextResponse.json({
                success: false,
                message: 'Content is required'
            }, { status: 400 });
        }
        
        // Check if answer exists and user is author
        const answerResult = await pool.query(
            'SELECT author_id FROM public.answers WHERE id = $1',
            [answerId]
        );
        
        if (answerResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Answer not found'
            }, { status: 404 });
        }
        
        const answer = answerResult.rows[0];
        
        // Check if user is author
        if (answer.author_id !== user.id) {
            return NextResponse.json({
                success: false,
                message: 'Not authorized to update this answer'
            }, { status: 403 });
        }
        
        // Update answer
        const updateResult = await pool.query(
            `UPDATE public.answers 
             SET content = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING id, content, is_accepted, created_at, updated_at`,
            [content, answerId]
        );
        
        return NextResponse.json({
            success: true,
            message: 'Answer updated successfully',
            data: { answer: updateResult.rows[0] }
        });
        
    } catch (error) {
        console.error('Update answer error:', error);
        
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

// DELETE /api/answers/[id] - Delete answer
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = requireAuth(request);
        const answerId = params.id;
        
        // Check if answer exists and get question_id
        const answerResult = await pool.query(
            'SELECT author_id, question_id FROM public.answers WHERE id = $1',
            [answerId]
        );
        
        if (answerResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Answer not found'
            }, { status: 404 });
        }
        
        const answer = answerResult.rows[0];
        
        // Check if user is author or admin
        if (answer.author_id !== user.id && user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Not authorized to delete this answer'
            }, { status: 403 });
        }
        
        // Delete answer
        await pool.query('DELETE FROM public.answers WHERE id = $1', [answerId]);
        
        // Update question answers count
        await pool.query(
            'UPDATE public.questions SET answers_count = answers_count - 1 WHERE id = $1',
            [answer.question_id]
        );
        
        return NextResponse.json({
            success: true,
            message: 'Answer deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete answer error:', error);
        
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
