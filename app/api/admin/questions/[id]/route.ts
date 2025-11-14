import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// DELETE /api/admin/questions/[id] - Delete question (admin only)

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const user = requireAuth(request);
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Admin access required'
            }, { status: 403 });
        }
        
        const resolvedParams = await Promise.resolve(params);
        const questionId = resolvedParams.id;
        
        if (!questionId || questionId === 'undefined' || questionId === 'null') {
            return NextResponse.json({
                success: false,
                message: 'Invalid question ID'
            }, { status: 400 });
        }
        
        // Start transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Delete related data first (foreign key constraints)
            await client.query('DELETE FROM public.votes WHERE question_id = $1', [questionId]);
            await client.query('DELETE FROM public.bookmarks WHERE question_id = $1', [questionId]);
            await client.query('DELETE FROM public.question_tags WHERE question_id = $1', [questionId]);
            
            // Delete answers and their votes
            await client.query(`
                DELETE FROM public.votes 
                WHERE answer_id IN (
                    SELECT id FROM public.answers WHERE question_id = $1
                )
            `, [questionId]);
            
            await client.query('DELETE FROM public.answers WHERE question_id = $1', [questionId]);
            
            // Finally delete the question
            const result = await client.query(
                'DELETE FROM public.questions WHERE id = $1 RETURNING id',
                [questionId]
            );
            
            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return NextResponse.json({
                    success: false,
                    message: 'Question not found'
                }, { status: 404 });
            }
            
            await client.query('COMMIT');
            
            return NextResponse.json({
                success: true,
                message: 'Question deleted successfully'
            });
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
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
