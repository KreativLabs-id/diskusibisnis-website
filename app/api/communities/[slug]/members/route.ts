import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET /api/communities/[slug]/members - Get community members

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

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
        
        // Get members - Try with is_verified first, fallback if column doesn't exist
        let result;
        try {
            result = await pool.query(`
                SELECT 
                    cm.id, 
                    cm.user_id, 
                    cm.role, 
                    cm.joined_at,
                    u.display_name, 
                    u.avatar_url,
                    u.is_verified
                FROM public.community_members cm
                JOIN public.users u ON cm.user_id = u.id
                WHERE cm.community_id = $1
                ORDER BY 
                    CASE cm.role 
                        WHEN 'admin' THEN 1 
                        WHEN 'moderator' THEN 2 
                        ELSE 3 
                    END,
                    cm.joined_at ASC
            `, [communityId]);
        } catch (columnError: any) {
            // If is_verified column doesn't exist, query without it
            console.log('is_verified column not found, falling back to query without it');
            result = await pool.query(`
                SELECT 
                    cm.id, 
                    cm.user_id, 
                    cm.role, 
                    cm.joined_at,
                    u.display_name, 
                    u.avatar_url,
                    false as is_verified
                FROM public.community_members cm
                JOIN public.users u ON cm.user_id = u.id
                WHERE cm.community_id = $1
                ORDER BY 
                    CASE cm.role 
                        WHEN 'admin' THEN 1 
                        WHEN 'moderator' THEN 2 
                        ELSE 3 
                    END,
                    cm.joined_at ASC
            `, [communityId]);
        }
        
        return NextResponse.json({
            success: true,
            data: { members: result.rows }
        });
        
    } catch (error: any) {
        console.error('Get community members error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
