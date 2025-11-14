import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { authenticateToken, requireAuth } from '@/lib/auth-middleware';
import { generateSlug, generateUniqueSlug } from '@/lib/slug-utils';

// GET /api/questions - Get all questions with filters

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        let sort = searchParams.get('sort') || 'newest';
        const search = searchParams.get('search') || '';
        const tag = searchParams.get('tag') || '';
        let status = searchParams.get('status') || '';
        
        // Map frontend sort values to backend values
        if (sort === 'popular') {
            sort = 'most_voted';
        } else if (sort === 'unanswered') {
            status = 'unanswered';
            sort = 'newest'; // Sort unanswered by newest
        }
        
        const offset = (page - 1) * limit;
        
        let baseQuery = `
            SELECT 
                q.id, q.title, q.content, 
                COALESCE(q.views_count, 0) as views_count, 
                q.is_closed, q.created_at, q.updated_at,
                u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar,
                u.reputation_points as author_reputation, 
                COALESCE(u.is_verified, false) as author_is_verified,
                COUNT(DISTINCT a.id) as answers_count,
                COUNT(DISTINCT CASE WHEN v.vote_type = 'upvote' THEN v.id END) as upvotes_count,
                CASE WHEN COUNT(DISTINCT a_accepted.id) > 0 THEN true ELSE false END as has_accepted_answer
            FROM public.questions q
            LEFT JOIN public.users u ON q.author_id = u.id
            LEFT JOIN public.answers a ON q.id = a.question_id
            LEFT JOIN public.answers a_accepted ON q.id = a_accepted.question_id AND a_accepted.is_accepted = true
            LEFT JOIN public.votes v ON v.question_id = q.id
            LEFT JOIN public.question_tags qt ON q.id = qt.question_id
            LEFT JOIN public.tags t ON qt.tag_id = t.id
            WHERE q.community_id IS NULL
        `;
        
        const queryParams: any[] = [];
        let paramIndex = 1;
        
        if (search) {
            baseQuery += ` AND (q.title ILIKE $${paramIndex} OR q.content ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }
        
        if (tag) {
            baseQuery += ` AND t.name = $${paramIndex}`;
            queryParams.push(tag);
            paramIndex++;
        }
        
        if (status === 'unanswered') {
            baseQuery += ` AND NOT EXISTS (SELECT 1 FROM public.answers WHERE question_id = q.id)`;
        } else if (status === 'answered') {
            baseQuery += ` AND EXISTS (SELECT 1 FROM public.answers WHERE question_id = q.id)`;
        }
        
        baseQuery += ` GROUP BY q.id, u.id`;
        
        // Add sorting
        switch (sort) {
            case 'newest':
                baseQuery += ` ORDER BY q.created_at DESC`;
                break;
            case 'oldest':
                baseQuery += ` ORDER BY q.created_at ASC`;
                break;
            case 'most_viewed':
                baseQuery += ` ORDER BY q.views_count DESC`;
                break;
            case 'most_voted':
                // Popular: Sort by votes first, then by views if votes are equal
                baseQuery += ` ORDER BY upvotes_count DESC, q.views_count DESC, q.created_at DESC`;
                break;
            default:
                baseQuery += ` ORDER BY q.created_at DESC`;
        }
        
        baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(limit, offset);
        
        const result = await pool.query(baseQuery, queryParams);
        
        // Fetch all tags for all questions in ONE query (optimization)
        const questionIds = result.rows.map(q => q.id);
        let questionsWithTags = result.rows;
        
        if (questionIds.length > 0) {
            const tagsResult = await pool.query(`
                SELECT 
                    qt.question_id,
                    t.id, t.name, t.slug
                FROM public.tags t
                JOIN public.question_tags qt ON t.id = qt.tag_id
                WHERE qt.question_id = ANY($1)
                ORDER BY qt.question_id, t.name
            `, [questionIds]);
            
            // Group tags by question_id
            const tagsByQuestion = tagsResult.rows.reduce((acc, row) => {
                if (!acc[row.question_id]) {
                    acc[row.question_id] = [];
                }
                acc[row.question_id].push({
                    id: row.id,
                    name: row.name,
                    slug: row.slug
                });
                return acc;
            }, {} as Record<string, any[]>);
            
            // Attach tags to questions
            questionsWithTags = result.rows.map(question => ({
                ...question,
                tags: tagsByQuestion[question.id] || []
            }));
        }
        
        // Get total count for pagination
        let countQuery = `
            SELECT COUNT(DISTINCT q.id) as total
            FROM public.questions q
            LEFT JOIN public.question_tags qt ON q.id = qt.question_id
            LEFT JOIN public.tags t ON qt.tag_id = t.id
            WHERE q.community_id IS NULL
        `;
        
        const countParams: any[] = [];
        let countParamIndex = 1;
        
        if (search) {
            countQuery += ` AND (q.title ILIKE $${countParamIndex} OR q.content ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
            countParamIndex++;
        }
        
        if (tag) {
            countQuery += ` AND t.name = $${countParamIndex}`;
            countParams.push(tag);
            countParamIndex++;
        }
        
        if (status === 'unanswered') {
            countQuery += ` AND NOT EXISTS (SELECT 1 FROM public.answers WHERE question_id = q.id)`;
        } else if (status === 'answered') {
            countQuery += ` AND EXISTS (SELECT 1 FROM public.answers WHERE question_id = q.id)`;
        }
        
        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);
        
        return NextResponse.json({
            success: true,
            data: {
                questions: questionsWithTags,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get questions error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}

// POST /api/questions - Create new question
export async function POST(request: NextRequest) {
    try {
        const user = requireAuth(request);
        const { title, content, tags, community_slug } = await request.json();
        
        if (!title || !content) {
            return NextResponse.json({
                success: false,
                message: 'Title and content are required'
            }, { status: 400 });
        }
        
        // Start transaction
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Get community ID if community_slug is provided
            let communityId = null;
            if (community_slug) {
                const communityResult = await client.query(
                    'SELECT id FROM public.communities WHERE slug = $1',
                    [community_slug]
                );
                if (communityResult.rows.length > 0) {
                    communityId = communityResult.rows[0].id;
                }
            }
            
            // Create question
            const questionResult = await client.query(
                `INSERT INTO public.questions (title, content, author_id, community_id) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING id, title, content, views_count, is_closed, created_at, updated_at`,
                [title, content, user.id, communityId]
            );
            
            const question = questionResult.rows[0];
            
            // Handle tags if provided
            if (tags && tags.length > 0) {
                for (const tagName of tags) {
                    // Get or create tag (case-insensitive lookup)
                    let tagResult = await client.query(
                        'SELECT id FROM public.tags WHERE LOWER(name) = LOWER($1)',
                        [tagName]
                    );
                    
                    let tagId;
                    if (tagResult.rows.length === 0) {
                        // Create new tag with unique slug
                        const checkSlugExists = async (slug: string): Promise<boolean> => {
                            const result = await client.query(
                                'SELECT id FROM public.tags WHERE slug = $1',
                                [slug]
                            );
                            return result.rows.length > 0;
                        };
                        
                        const uniqueSlug = await generateUniqueSlug(tagName, checkSlugExists);
                        const newTagResult = await client.query(
                            'INSERT INTO public.tags (name, slug) VALUES ($1, $2) RETURNING id',
                            [tagName, uniqueSlug]
                        );
                        tagId = newTagResult.rows[0].id;
                    } else {
                        tagId = tagResult.rows[0].id;
                    }
                    
                    // Link question to tag
                    await client.query(
                        'INSERT INTO public.question_tags (question_id, tag_id) VALUES ($1, $2)',
                        [question.id, tagId]
                    );
                }
            }
            
            await client.query('COMMIT');
            
            return NextResponse.json({
                success: true,
                message: 'Question created successfully',
                data: { question }
            }, { status: 201 });
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
        
    } catch (error) {
        console.error('Create question error:', error);
        
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
