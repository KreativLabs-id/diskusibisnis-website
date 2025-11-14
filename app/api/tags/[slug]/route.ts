import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/tags/[slug] - Get tag by slug

// Force dynamic rendering for API routes
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
    try {
        const resolvedParams = await Promise.resolve(params);
        const slug = resolvedParams.slug;
        
        if (!slug || slug === 'undefined' || slug === 'null') {
            return NextResponse.json({
                success: false,
                message: 'Invalid slug'
            }, { status: 400 });
        }
        
        const result = await pool.query(
            `SELECT 
                id, name, slug, description, usage_count as question_count, created_at
             FROM public.tags 
             WHERE slug = $1`,
            [slug]
        );
        
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Tag not found'
            }, { status: 404 });
        }
        
        const tag = result.rows[0];
        
        return NextResponse.json({
            success: true,
            data: { tag }
        });
        
    } catch (error) {
        console.error('Get tag by slug error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}

// PUT /api/tags/[slug] - Update tag (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
    try {
        const user = requireAuth(request);
        const resolvedParams = await Promise.resolve(params);
        const slug = resolvedParams.slug;
        
        if (!slug || slug === 'undefined' || slug === 'null') {
            return NextResponse.json({
                success: false,
                message: 'Invalid slug'
            }, { status: 400 });
        }
        const { name, description } = await request.json();
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Admin access required'
            }, { status: 403 });
        }
        
        // Update tag
        const result = await pool.query(
            `UPDATE public.tags 
             SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE slug = $3 
             RETURNING id, name, slug, description, usage_count, created_at`,
            [name, description, slug]
        );
        
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Tag not found'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            message: 'Tag updated successfully',
            data: { tag: result.rows[0] }
        });
        
    } catch (error) {
        console.error('Update tag error:', error);
        
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

// DELETE /api/tags/[slug] - Delete tag (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
    try {
        const user = requireAuth(request);
        const resolvedParams = await Promise.resolve(params);
        const slug = resolvedParams.slug;
        
        if (!slug || slug === 'undefined' || slug === 'null') {
            return NextResponse.json({
                success: false,
                message: 'Invalid slug'
            }, { status: 400 });
        }
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json({
                success: false,
                message: 'Admin access required'
            }, { status: 403 });
        }
        
        // Delete tag
        const result = await pool.query(
            'DELETE FROM public.tags WHERE slug = $1 RETURNING id',
            [slug]
        );
        
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Tag not found'
            }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            message: 'Tag deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete tag error:', error);
        
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
