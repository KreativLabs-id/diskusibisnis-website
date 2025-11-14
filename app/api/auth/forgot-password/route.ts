import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import crypto from 'crypto';

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({
                success: false,
                message: 'Email is required'
            }, { status: 400 });
        }

        // Check if user exists
        const userResult = await pool.query(
            'SELECT id, email FROM public.users WHERE email = $1',
            [email]
        );

        // Always return success (security best practice)
        if (userResult.rows.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Jika email terdaftar, link reset password akan dikirim'
            });
        }

        const user = userResult.rows[0];

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Store reset token in database
        await pool.query(
            `UPDATE public.users 
             SET password_reset_token = $1, password_reset_expires = $2 
             WHERE id = $3`,
            [resetTokenHash, resetTokenExpiry, user.id]
        );

        // TODO: Send email with reset link
        // For now, just return the token (in production, send via email)
        console.log(`Reset token for ${email}: ${resetToken}`);
        console.log(`Reset URL: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);

        return NextResponse.json({
            success: true,
            message: 'Jika email terdaftar, link reset password akan dikirim',
            // Remove this in production
            devToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
