import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/communities/[slug] - Get community by slug

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const slug = params.slug;
        
        // Try to get user from token (optional for this endpoint)
        let currentUserId = null;
        try {
            const user = requireAuth(request);
            currentUserId = user.id;
        } catch (error) {
            // User not authenticated, continue without user-specific data
        }
        
        const result = await pool.query(`
            SELECT 
                c.id, c.name, c.slug, c.description, c.category, c.location, c.created_at, c.created_by,
                u.display_name as creator_name,
                COUNT(DISTINCT cm.id) as members_count,
                CASE WHEN $2::uuid IS NOT NULL THEN 
                    EXISTS(SELECT 1 FROM community_members WHERE community_id = c.id AND user_id = $2::uuid)
                ELSE FALSE END as is_member,
                CASE WHEN $2::uuid IS NOT NULL THEN 
                    (SELECT role FROM community_members WHERE community_id = c.id AND user_id = $2::uuid)
                ELSE NULL END as user_role
            FROM public.communities c
            LEFT JOIN public.users u ON c.created_by = u.id
            LEFT JOIN public.community_members cm ON c.id = cm.community_id
            WHERE c.slug = $1
            GROUP BY c.id, u.display_name
        `, [slug, currentUserId]);
        
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Community not found'
            }, { status: 404 });
        }
        
        const community = result.rows[0];
        
        return NextResponse.json({
            success: true,
            data: { community }
        });
        
    } catch (error) {
        console.error('Get community error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
