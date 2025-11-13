import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';

// GET /api/users - Get all users with stats

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const sort = searchParams.get('sort') || 'reputation';
        
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT 
                u.id, u.email, u.display_name, u.avatar_url, u.bio,
                u.role, u.reputation_points, u.created_at,
                COUNT(DISTINCT q.id) as question_count,
                COUNT(DISTINCT a.id) as answer_count
            FROM public.users u
            LEFT JOIN public.questions q ON u.id = q.author_id
            LEFT JOIN public.answers a ON u.id = a.author_id
            WHERE u.is_banned = false
        `;
        
        const queryParams: any[] = [];
        let paramIndex = 1;
        
        if (search) {
            query += ` AND (u.display_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }
        
        query += ` GROUP BY u.id`;
        
        // Add sorting
        switch (sort) {
            case 'reputation':
                query += ` ORDER BY u.reputation_points DESC`;
                break;
            case 'newest':
                query += ` ORDER BY u.created_at DESC`;
                break;
            case 'questions':
                query += ` ORDER BY question_count DESC`;
                break;
            case 'answers':
                query += ` ORDER BY answer_count DESC`;
                break;
            default:
                query += ` ORDER BY u.reputation_points DESC`;
        }
        
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);
        
        const result = await pool.query(query, queryParams);
        
        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM public.users u
            WHERE u.is_banned = false
        `;
        
        const countParams: any[] = [];
        let countParamIndex = 1;
        
        if (search) {
            countQuery += ` AND (u.display_name ILIKE $${countParamIndex} OR u.email ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
        }
        
        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);
        
        // Remove sensitive data
        const users = result.rows.map((user: any) => ({
            id: user.id,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            bio: user.bio,
            role: user.role,
            reputationPoints: user.reputation_points,
            createdAt: user.created_at,
            questionCount: parseInt(user.question_count),
            answerCount: parseInt(user.answer_count)
        }));
        
        return NextResponse.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
