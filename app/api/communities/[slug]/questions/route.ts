import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET /api/communities/[slug]/questions - Get questions from a community

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const slug = resolvedParams.slug;
        
        if (!slug || slug === 'undefined' || slug === 'null') {
            return NextResponse.json({
                success: false,
                message: 'Invalid slug'
            }, { status: 400 });
        }
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = (page - 1) * limit;
        
        // First get community ID from slug
        const communityResult = await pool.query(
            'SELECT id FROM public.communities WHERE slug = $1',
            [slug]
        );
        
        if (communityResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Community not found'
            }, { status: 404 });
        }
        
        const communityId = communityResult.rows[0].id;
        
        // Get questions from this community
        const result = await pool.query(`
            SELECT 
                q.id,
                q.title,
                q.content,
                q.created_at,
                q.views_count,
                u.id as author_id,
                u.display_name as author_name,
                u.avatar_url as author_avatar,
                COALESCE(u.is_verified, false) as author_verified,
                COUNT(DISTINCT a.id) as answer_count,
                COUNT(DISTINCT v.id) FILTER (WHERE v.vote_type = 'upvote') as upvote_count,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object('id', t.id, 'name', t.name)
                    ) FILTER (WHERE t.id IS NOT NULL),
                    '[]'
                ) as tags
            FROM public.questions q
            LEFT JOIN public.users u ON q.author_id = u.id
            LEFT JOIN public.answers a ON q.id = a.question_id
            LEFT JOIN public.votes v ON q.id = v.question_id
            LEFT JOIN public.question_tags qt ON q.id = qt.question_id
            LEFT JOIN public.tags t ON qt.tag_id = t.id
            WHERE q.community_id = $1
            GROUP BY q.id, u.id, u.display_name, u.avatar_url, u.is_verified
            ORDER BY q.created_at DESC
            LIMIT $2 OFFSET $3
        `, [communityId, limit, offset]);
        
        // Get total count
        const countResult = await pool.query(
            'SELECT COUNT(*) FROM public.questions WHERE community_id = $1',
            [communityId]
        );
        
        const totalQuestions = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalQuestions / limit);
        
        return NextResponse.json({
            success: true,
            data: {
                questions: result.rows,
                pagination: {
                    page,
                    limit,
                    total: totalQuestions,
                    totalPages
                }
            }
        });
        
    } catch (error: any) {
        console.error('Get community questions error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
