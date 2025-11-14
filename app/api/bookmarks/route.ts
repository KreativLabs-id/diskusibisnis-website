import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/bookmarks - Get user's bookmarks

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = requireAuth(request);
        
        const result = await pool.query(
            `SELECT 
                b.id as bookmark_id,
                b.created_at as bookmarked_at,
                q.id, q.title, q.content, q.views_count, q.created_at,
                u.display_name as author_name,
                COALESCE(u.is_verified, false) as author_is_verified,
                COUNT(DISTINCT a.id) as answers_count,
                COUNT(DISTINCT v.id) FILTER (WHERE v.vote_type = 'upvote') as upvotes_count,
                ARRAY_AGG(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug)) 
                    FILTER (WHERE t.id IS NOT NULL) as tags
             FROM bookmarks b
             JOIN questions q ON b.question_id = q.id
             JOIN users u ON q.author_id = u.id
             LEFT JOIN answers a ON q.id = a.question_id
             LEFT JOIN votes v ON q.id = v.votable_id AND v.votable_type = 'question'
             LEFT JOIN question_tags qt ON q.id = qt.question_id
             LEFT JOIN tags t ON qt.tag_id = t.id
             WHERE b.user_id = $1
             GROUP BY b.id, b.created_at, q.id, u.display_name, u.is_verified
             ORDER BY b.created_at DESC`,
            [user.id]
        );
        
        return NextResponse.json({
            success: true,
            data: { bookmarks: result.rows }
        });
        
    } catch (error) {
        console.error('Get bookmarks error:', error);
        
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

// POST /api/bookmarks - Add bookmark
export async function POST(request: NextRequest) {
    try {
        const user = requireAuth(request);
        const { questionId } = await request.json();
        
        if (!questionId) {
            return NextResponse.json({
                success: false,
                message: 'Question ID is required'
            }, { status: 400 });
        }
        
        // Check if question exists
        const questionResult = await pool.query(
            'SELECT id FROM questions WHERE id = $1',
            [questionId]
        );
        
        if (questionResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Question not found'
            }, { status: 404 });
        }
        
        // Add bookmark (ON CONFLICT DO NOTHING to handle duplicates)
        const result = await pool.query(
            `INSERT INTO bookmarks (user_id, question_id) 
             VALUES ($1, $2) 
             ON CONFLICT (user_id, question_id) DO NOTHING
             RETURNING id`,
            [user.id, questionId]
        );
        
        return NextResponse.json({
            success: true,
            message: result.rows.length > 0 ? 'Bookmark added' : 'Already bookmarked',
            data: { bookmarked: true }
        });
        
    } catch (error) {
        console.error('Add bookmark error:', error);
        
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

// DELETE /api/bookmarks - Remove bookmark
export async function DELETE(request: NextRequest) {
    try {
        const user = requireAuth(request);
        const { searchParams } = new URL(request.url);
        const questionId = searchParams.get('questionId');
        
        if (!questionId) {
            return NextResponse.json({
                success: false,
                message: 'Question ID is required'
            }, { status: 400 });
        }
        
        const result = await pool.query(
            'DELETE FROM bookmarks WHERE user_id = $1 AND question_id = $2 RETURNING id',
            [user.id, questionId]
        );
        
        return NextResponse.json({
            success: true,
            message: result.rows.length > 0 ? 'Bookmark removed' : 'Bookmark not found',
            data: { bookmarked: false }
        });
        
    } catch (error) {
        console.error('Remove bookmark error:', error);
        
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
