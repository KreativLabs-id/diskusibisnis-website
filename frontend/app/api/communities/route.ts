import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';
import { generateUniqueSlug } from '@/lib/slug-utils';

// GET /api/communities - Get all communities
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        
        const offset = (page - 1) * limit;
        
        let query = `
            SELECT 
                c.id, c.name, c.slug, c.description, c.category, c.location,
                c.avatar_url, c.is_popular, c.created_at,
                COUNT(DISTINCT cm.user_id) as member_count,
                COUNT(DISTINCT q.id) as question_count
            FROM public.communities c
            LEFT JOIN public.community_members cm ON c.id = cm.community_id
            LEFT JOIN public.questions q ON c.id = q.community_id
            WHERE 1=1
        `;
        
        const queryParams: any[] = [];
        let paramIndex = 1;
        
        if (search) {
            query += ` AND (c.name ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }
        
        if (category && category !== 'all') {
            query += ` AND c.category = $${paramIndex}`;
            queryParams.push(category);
            paramIndex++;
        }
        
        query += ` GROUP BY c.id ORDER BY c.is_popular DESC, member_count DESC`;
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);
        
        const result = await pool.query(query, queryParams);
        
        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(*) as total
            FROM public.communities c
            WHERE 1=1
        `;
        
        const countParams: any[] = [];
        let countParamIndex = 1;
        
        if (search) {
            countQuery += ` AND (c.name ILIKE $${countParamIndex} OR c.description ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
            countParamIndex++;
        }
        
        if (category && category !== 'all') {
            countQuery += ` AND c.category = $${countParamIndex}`;
            countParams.push(category);
        }
        
        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);
        
        return NextResponse.json({
            success: true,
            data: {
                communities: result.rows,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get communities error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}

// POST /api/communities - Create new community
export async function POST(request: NextRequest) {
    try {
        const user = requireAuth(request);
        const { name, description, category, location } = await request.json();
        
        if (!name || !description || !category) {
            return NextResponse.json({
                success: false,
                message: 'Name, description, and category are required'
            }, { status: 400 });
        }
        
        // Check if community name already exists
        const existingCommunity = await pool.query(
            'SELECT id FROM public.communities WHERE name = $1',
            [name]
        );
        
        if (existingCommunity.rows.length > 0) {
            return NextResponse.json({
                success: false,
                message: 'Community name already exists'
            }, { status: 400 });
        }
        
        // Generate unique slug
        const slug = await generateUniqueSlug(name, async (slug) => {
            const result = await pool.query(
                'SELECT id FROM public.communities WHERE slug = $1',
                [slug]
            );
            return result.rows.length > 0;
        });
        
        // Create community
        const result = await pool.query(
            `INSERT INTO public.communities (name, slug, description, category, location, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING id, name, slug, description, category, location, created_at`,
            [name, slug, description, category, location, user.id]
        );
        
        const community = result.rows[0];
        
        // Add creator as first member
        await pool.query(
            'INSERT INTO public.community_members (community_id, user_id, role) VALUES ($1, $2, $3)',
            [community.id, user.id, 'admin']
        );
        
        return NextResponse.json({
            success: true,
            message: 'Community created successfully',
            data: { community }
        }, { status: 201 });
        
    } catch (error) {
        console.error('Create community error:', error);
        
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
