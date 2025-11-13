import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// POST /api/comments - Create new comment

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const user = requireAuth(request);
        const { content, commentableType, commentableId } = await request.json();
        
        if (!content || !commentableType || !commentableId) {
            return NextResponse.json({
                success: false,
                message: 'Content, commentable type, and commentable ID are required'
            }, { status: 400 });
        }
        
        if (!['question', 'answer'].includes(commentableType)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid commentable type'
            }, { status: 400 });
        }
        
        // Check if target exists
        const targetTable = commentableType === 'question' ? 'questions' : 'answers';
        const targetResult = await pool.query(
            `SELECT id, author_id FROM public.${targetTable} WHERE id = $1`,
            [commentableId]
        );
        
        if (targetResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: `${commentableType} not found`
            }, { status: 404 });
        }
        
        // Create comment
        const result = await pool.query(
            `INSERT INTO public.comments (content, author_id, commentable_type, commentable_id) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, content, commentable_type, commentable_id, created_at, updated_at`,
            [content, user.id, commentableType, commentableId]
        );
        
        const comment = result.rows[0];
        
        return NextResponse.json({
            success: true,
            message: 'Comment created successfully',
            data: { comment }
        }, { status: 201 });
        
    } catch (error) {
        console.error('Create comment error:', error);
        
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
