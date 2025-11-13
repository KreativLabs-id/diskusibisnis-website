import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// PUT /api/comments/[id] - Update comment
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = requireAuth(request);
        const commentId = params.id;
        const { content } = await request.json();
        
        if (!content) {
            return NextResponse.json({
                success: false,
                message: 'Content is required'
            }, { status: 400 });
        }
        
        // Check if comment exists and user is author
        const commentResult = await pool.query(
            'SELECT author_id FROM public.comments WHERE id = $1',
            [commentId]
        );
        
        if (commentResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Comment not found'
            }, { status: 404 });
        }
        
        const comment = commentResult.rows[0];
        
        // Check if user is author
        if (comment.author_id !== user.id) {
            return NextResponse.json({
                success: false,
                message: 'Not authorized to update this comment'
            }, { status: 403 });
        }
        
        // Update comment
        const updateResult = await pool.query(
            `UPDATE public.comments 
             SET content = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING id, content, commentable_type, commentable_id, created_at, updated_at`,
            [content, commentId]
        );
        
        return NextResponse.json({
            success: true,
            message: 'Comment updated successfully',
            data: { comment: updateResult.rows[0] }
        });
        
    } catch (error) {
        console.error('Update comment error:', error);
        
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

// DELETE /api/comments/[id] - Delete comment
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = requireAuth(request);
        const commentId = params.id;
        
        // Check if comment exists
        const commentResult = await pool.query(
            'SELECT author_id FROM public.comments WHERE id = $1',
            [commentId]
        );
        
        if (commentResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Comment not found'
            }, { status: 404 });
        }
        
        const comment = commentResult.rows[0];
        
        // Check if user is author or admin
        if (comment.author_id !== user.id && user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Not authorized to delete this comment'
            }, { status: 403 });
        }
        
        // Delete comment
        await pool.query('DELETE FROM public.comments WHERE id = $1', [commentId]);
        
        return NextResponse.json({
            success: true,
            message: 'Comment deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete comment error:', error);
        
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
