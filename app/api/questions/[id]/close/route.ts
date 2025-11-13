import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// POST /api/questions/[id]/close - Close question
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = requireAuth(request);
        const questionId = params.id;
        
        // Check if question exists and get author
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
                message: 'Not authorized to close this question'
            }, { status: 403 });
        }
        
        // Close question
        await pool.query(
            'UPDATE public.questions SET is_closed = TRUE WHERE id = $1',
            [questionId]
        );
        
        return NextResponse.json({
            success: true,
            message: 'Question closed successfully'
        });
        
    } catch (error) {
        console.error('Close question error:', error);
        
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
