import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { requireAuth } from '@/lib/auth-middleware';

// GET /api/users/[id] - Get user profile
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        
        const result = await pool.query(
            `SELECT id, display_name, avatar_url, bio, reputation_points, created_at 
             FROM public.users 
             WHERE id = $1 AND is_banned = FALSE`,
            [userId]
        );
        
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }
        
        const user = result.rows[0];
        
        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    displayName: user.display_name,
                    avatarUrl: user.avatar_url,
                    bio: user.bio,
                    reputationPoints: user.reputation_points,
                    createdAt: user.created_at
                }
            }
        });
        
    } catch (error) {
        console.error('Get user profile error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = requireAuth(request);
        const userId = params.id;
        const { displayName, bio, avatarUrl } = await request.json();
        
        // Check if user is updating their own profile
        if (userId !== user.id) {
            return NextResponse.json({
                success: false,
                message: 'Not authorized to update this profile'
            }, { status: 403 });
        }
        
        // Update user profile
        const result = await pool.query(
            `UPDATE public.users 
             SET display_name = $1, bio = $2, avatar_url = $3, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $4 
             RETURNING id, display_name, avatar_url, bio, reputation_points`,
            [displayName, bio, avatarUrl, userId]
        );
        
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'User not found'
            }, { status: 404 });
        }
        
        const updatedUser = result.rows[0];
        
        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: updatedUser.id,
                    displayName: updatedUser.display_name,
                    avatarUrl: updatedUser.avatar_url,
                    bio: updatedUser.bio,
                    reputationPoints: updatedUser.reputation_points
                }
            }
        });
        
    } catch (error) {
        console.error('Update user profile error:', error);
        
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
