import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET /api/users/[id]/rank - Get user ranking

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> | { id: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const userId = resolvedParams.id;
        
        if (!userId || userId === 'undefined' || userId === 'null') {
            return NextResponse.json({
                success: false,
                message: 'Invalid user ID'
            }, { status: 400 });
        }
        
        // Get user's rank by reputation points
        const rankResult = await pool.query(
            `SELECT COUNT(*) + 1 as rank
             FROM public.users
             WHERE reputation_points > (
                 SELECT reputation_points 
                 FROM public.users 
                 WHERE id = $1
             )
             AND is_banned = FALSE`,
            [userId]
        );
        
        const rank = rankResult.rows[0]?.rank || null;
        
        return NextResponse.json({
            success: true,
            data: { rank }
        });
        
    } catch (error) {
        console.error('Get user rank error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
