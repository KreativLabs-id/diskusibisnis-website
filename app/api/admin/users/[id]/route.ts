import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// DELETE /api/admin/users/[id] - Delete user (admin only)

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = requireAuth(request);
        const targetUserId = params.id;
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Admin access required'
            }, { status: 403 });
        }
        
        // Prevent admin from deleting themselves
        if (user.id === targetUserId) {
            return NextResponse.json({
                success: false,
                message: 'Cannot delete your own account'
            }, { status: 400 });
        }
        
        // Check if target user exists
        const userResult = await pool.query(
            'SELECT id, role FROM public.users WHERE id = $1',
            [targetUserId]
        );
        
        if (userResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }
        
        // Start transaction to delete user and all related data
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Delete user's votes
            await client.query('DELETE FROM public.votes WHERE user_id = $1', [targetUserId]);
            
            // Delete user's bookmarks
            await client.query('DELETE FROM public.bookmarks WHERE user_id = $1', [targetUserId]);
            
            // Delete user's notifications
            await client.query('DELETE FROM public.notifications WHERE user_id = $1', [targetUserId]);
            
            // Delete votes on user's answers
            await client.query(`
                DELETE FROM public.votes 
                WHERE answer_id IN (
                    SELECT id FROM public.answers WHERE user_id = $1
                )
            `, [targetUserId]);
            
            // Delete user's answers
            await client.query('DELETE FROM public.answers WHERE user_id = $1', [targetUserId]);
            
            // Delete votes on user's questions
            await client.query(`
                DELETE FROM public.votes 
                WHERE question_id IN (
                    SELECT id FROM public.questions WHERE user_id = $1
                )
            `, [targetUserId]);
            
            // Delete bookmarks on user's questions
            await client.query(`
                DELETE FROM public.bookmarks 
                WHERE question_id IN (
                    SELECT id FROM public.questions WHERE user_id = $1
                )
            `, [targetUserId]);
            
            // Delete question tags for user's questions
            await client.query(`
                DELETE FROM public.question_tags 
                WHERE question_id IN (
                    SELECT id FROM public.questions WHERE user_id = $1
                )
            `, [targetUserId]);
            
            // Delete user's questions
            await client.query('DELETE FROM public.questions WHERE user_id = $1', [targetUserId]);
            
            // Finally delete the user
            await client.query('DELETE FROM public.users WHERE id = $1', [targetUserId]);
            
            await client.query('COMMIT');
            
            return NextResponse.json({
                success: true,
                message: 'User deleted successfully'
            });
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('Delete user error:', error);
        
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
