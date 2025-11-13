import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// POST /api/questions/[id]/view - Increment view count
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const questionId = params.id;
        
        // Check if question exists
        const questionResult = await pool.query(
            'SELECT id FROM public.questions WHERE id = $1',
            [questionId]
        );
        
        if (questionResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Question not found'
            }, { status: 404 });
        }
        
        // Increment view count
        await pool.query(
            'UPDATE public.questions SET views_count = views_count + 1 WHERE id = $1',
            [questionId]
        );
        
        return NextResponse.json({
            success: true,
            message: 'View count incremented'
        });
        
    } catch (error) {
        console.error('Increment view count error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
