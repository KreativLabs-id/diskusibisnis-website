import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET /api/tags - Get all tags with question counts

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const limit = parseInt(searchParams.get('limit') || '50');
        
        let query = `
            SELECT 
                t.id, t.name, t.slug, t.description, t.created_at,
                COUNT(qt.question_id) as question_count
            FROM public.tags t
            LEFT JOIN public.question_tags qt ON t.id = qt.tag_id
            WHERE 1=1
        `;
        
        const queryParams: any[] = [];
        let paramIndex = 1;
        
        if (search) {
            query += ` AND t.name ILIKE $${paramIndex}`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }
        
        query += ` GROUP BY t.id ORDER BY question_count DESC, t.name ASC`;
        
        if (limit > 0) {
            query += ` LIMIT $${paramIndex}`;
            queryParams.push(limit);
        }
        
        const result = await pool.query(query, queryParams);
        
        return NextResponse.json({
            success: true,
            data: { tags: result.rows }
        });
    } catch (error) {
        console.error('Get tags error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
