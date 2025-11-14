import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// POST /api/auth/reset-password - Reset password with token
export async function POST(request: NextRequest) {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json({
                success: false,
                message: 'Token dan password baru harus diisi'
            }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({
                success: false,
                message: 'Password minimal 6 karakter'
            }, { status: 400 });
        }

        // Hash the token to compare with database
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid reset token
        const userResult = await pool.query(
            `SELECT id FROM public.users 
             WHERE password_reset_token = $1 
             AND password_reset_expires > NOW()`,
            [resetTokenHash]
        );

        if (userResult.rows.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'Token tidak valid atau sudah kadaluarsa'
            }, { status: 400 });
        }

        const user = userResult.rows[0];

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await pool.query(
            `UPDATE public.users 
             SET password_hash = $1, 
                 password_reset_token = NULL, 
                 password_reset_expires = NULL,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2`,
            [hashedPassword, user.id]
        );

        return NextResponse.json({
            success: true,
            message: 'Password berhasil direset'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({
            success: false,
            message: 'Server error'
        }, { status: 500 });
    }
}
