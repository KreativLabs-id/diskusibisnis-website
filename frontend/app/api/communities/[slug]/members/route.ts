import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET /api/communities/[slug]/members - Get community members
export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const slug = params.slug;
        
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
        
        // Get members
        const result = await pool.query(`
            SELECT 
                cm.id, cm.user_id, cm.role, cm.created_at as joined_at,
                u.display_name, u.avatar_url
            FROM public.community_members cm
            JOIN public.users u ON cm.user_id = u.id
            WHERE cm.community_id = $1
            ORDER BY 
                CASE cm.role 
                    WHEN 'admin' THEN 1 
                    WHEN 'moderator' THEN 2 
                    ELSE 3 
                END,
                cm.created_at ASC
        `, [communityId]);
        
        return NextResponse.json({
            success: true,
            data: { members: result.rows }
        });
        
    } catch (error) {
        console.error('Get community members error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
