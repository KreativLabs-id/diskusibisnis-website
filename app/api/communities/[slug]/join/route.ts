import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// POST /api/communities/[slug]/join - Join community
export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const user = requireAuth(request);
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
        
        // Check if user is already a member
        const existingMember = await pool.query(
            'SELECT id FROM public.community_members WHERE community_id = $1 AND user_id = $2',
            [communityId, user.id]
        );
        
        if (existingMember.rows.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'You are already a member of this community'
            }, { status: 400 });
        }
        
        // Add user as member
        await pool.query(
            'INSERT INTO public.community_members (community_id, user_id, role) VALUES ($1, $2, $3)',
            [communityId, user.id, 'member']
        );
        
        return NextResponse.json({
            success: true,
            message: 'Successfully joined community'
        });
        
    } catch (error) {
        console.error('Join community error:', error);
        
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
