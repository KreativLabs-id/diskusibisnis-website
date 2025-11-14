import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/admin/communities - Get all communities (admin only)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = requireAuth(request);
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Admin access required'
            }, { status: 403 });
        }
        
        const result = await pool.query(
            `SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.slug, 
                c.is_banned,
                c.created_at,
                u.display_name as created_by_name,
                (SELECT COUNT(*) FROM public.community_members cm WHERE cm.community_id = c.id) as member_count,
                (SELECT COUNT(*) FROM public.questions q WHERE q.community_id = c.id) as question_count
             FROM public.communities c 
             LEFT JOIN public.users u ON c.created_by = u.id
             ORDER BY c.created_at DESC`
        );
        
        return NextResponse.json({
            success: true,
            data: { communities: result.rows }
        });
        
    } catch (error) {
        console.error('Get admin communities error:', error);
        
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
