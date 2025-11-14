import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// POST /api/admin/communities/[id]/ban - Ban community (admin only)
export const dynamic = 'force-dynamic';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
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
        
        const communityId = params.id;
        
        // Check if community exists
        const communityResult = await pool.query(
            'SELECT id FROM public.communities WHERE id = $1',
            [communityId]
        );
        
        if (communityResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Community not found'
            }, { status: 404 });
        }
        
        // Ban community
        await pool.query(
            'UPDATE public.communities SET is_banned = TRUE WHERE id = $1',
            [communityId]
        );
        
        return NextResponse.json({
            success: true,
            message: 'Community banned successfully'
        });
        
    } catch (error) {
        console.error('Ban community error:', error);
        
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
