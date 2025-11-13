import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/admin/stats - Get admin statistics

// Force dynamic rendering for API routes
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
        
        // Get statistics
        const [usersCount, questionsCount, answersCount, tagsCount] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM public.users'),
            pool.query('SELECT COUNT(*) FROM public.questions'),
            pool.query('SELECT COUNT(*) FROM public.answers'),
            pool.query('SELECT COUNT(*) FROM public.tags')
        ]);
        
        return NextResponse.json({
            success: true,
            data: {
                users: parseInt(usersCount.rows[0].count),
                questions: parseInt(questionsCount.rows[0].count),
                answers: parseInt(answersCount.rows[0].count),
                tags: parseInt(tagsCount.rows[0].count)
            }
        });
        
    } catch (error) {
        console.error('Get admin stats error:', error);
        
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
