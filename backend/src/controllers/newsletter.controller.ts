import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { successResponse, errorResponse } from '../utils/response.utils';
import { sendNewsletterEmail } from '../utils/email.service';

// Simple email validation regex
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Get all registered emails count (for newsletter preview)
 * GET /api/admin/newsletter/stats
 */
export const getNewsletterStats = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Get all users with valid email (excluding banned users)
        const result = await pool.query(`
      SELECT COUNT(*) as total_subscribers
      FROM public.users
      WHERE email IS NOT NULL 
        AND email != ''
        AND is_banned = false
    `);

        const totalSubscribers = parseInt(result.rows[0].total_subscribers);

        // Get newsletter history stats
        const historyResult = await pool.query(`
      SELECT 
        COUNT(*) as total_sent,
        COALESCE(SUM(recipients_count), 0) as total_recipients,
        COALESCE(SUM(success_count), 0) as total_success,
        COALESCE(SUM(failed_count), 0) as total_failed
      FROM public.newsletter_history
    `);

        const history = historyResult.rows[0];

        successResponse(res, {
            totalSubscribers,
            totalNewslettersSent: parseInt(history.total_sent) || 0,
            totalRecipients: parseInt(history.total_recipients) || 0,
            totalSuccessful: parseInt(history.total_success) || 0,
            totalFailed: parseInt(history.total_failed) || 0
        });
    } catch (error) {
        console.error('Get newsletter stats error:', error);
        errorResponse(res, 'Server error');
    }
};

/**
 * Get newsletter history
 * GET /api/admin/newsletter/history
 */
export const getNewsletterHistory = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(`
      SELECT 
        nh.id, nh.subject, nh.content, nh.recipients_count, 
        nh.success_count, nh.failed_count, nh.created_at,
        u.display_name as sent_by_name
      FROM public.newsletter_history nh
      LEFT JOIN public.users u ON nh.sent_by = u.id
      ORDER BY nh.created_at DESC
      LIMIT 50
    `);

        successResponse(res, { history: result.rows });
    } catch (error) {
        console.error('Get newsletter history error:', error);
        errorResponse(res, 'Server error');
    }
};

/**
 * Send newsletter to all registered users
 * POST /api/admin/newsletter/send
 */
export const sendNewsletter = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { subject, content, previewHtml } = req.body;
        const adminId = req.user?.id;

        if (!subject || !content) {
            errorResponse(res, 'Subject dan konten newsletter wajib diisi', 400);
            return;
        }

        // Get ALL active users' emails (excluding banned users only)
        const usersResult = await pool.query(`
      SELECT id, email, display_name
      FROM public.users
      WHERE email IS NOT NULL 
        AND email != ''
        AND is_banned = false
    `);

        // Filter out invalid email formats
        const allUsers = usersResult.rows;
        const validUsers = allUsers.filter(user => isValidEmail(user.email));
        const invalidUsers = allUsers.filter(user => !isValidEmail(user.email));

        if (validUsers.length === 0) {
            errorResponse(res, 'Tidak ada pengguna dengan email valid', 400);
            return;
        }

        let successCount = 0;
        let failedCount = 0;
        const successEmails: { email: string; name: string }[] = [];
        const failedEmails: { email: string; name: string; reason: string }[] = [];

        // Add invalid email users to failed list
        invalidUsers.forEach(user => {
            failedEmails.push({
                email: user.email,
                name: user.display_name || 'Unknown',
                reason: 'Format email tidak valid'
            });
            failedCount++;
        });

        // Send emails one by one with delay to avoid rate limiting
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        console.log(`\n📬 Sending newsletter to ${validUsers.length} users...`);

        for (let i = 0; i < validUsers.length; i++) {
            const user = validUsers[i];

            try {
                await sendNewsletterEmail(
                    user.email,
                    subject,
                    content,
                    previewHtml || content,
                    user.display_name || 'Subscriber'
                );

                successCount++;
                successEmails.push({
                    email: user.email,
                    name: user.display_name || 'Unknown'
                });
                console.log(`[${i + 1}/${validUsers.length}] ✓ Sent to ${user.email}`);
            } catch (error: any) {
                failedCount++;
                failedEmails.push({
                    email: user.email,
                    name: user.display_name || 'Unknown',
                    reason: error.message || 'Error tidak diketahui'
                });
                console.error(`[${i + 1}/${validUsers.length}] ✗ Failed ${user.email}: ${error.message}`);
            }

            // Add delay between each email to avoid rate limiting (500ms)
            if (i < validUsers.length - 1) {
                await delay(500);
            }
        }

        console.log(`\n📊 Newsletter complete: ${successCount} success, ${failedCount} failed\n`);

        // Save newsletter history
        await pool.query(`
      INSERT INTO public.newsletter_history 
        (subject, content, sent_by, recipients_count, success_count, failed_count)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [subject, content, adminId, allUsers.length, successCount, failedCount]);

        successResponse(res, {
            message: 'Newsletter berhasil dikirim',
            totalRecipients: allUsers.length,
            successCount,
            failedCount,
            successEmails,
            failedEmails
        });
    } catch (error) {
        console.error('Send newsletter error:', error);
        errorResponse(res, 'Gagal mengirim newsletter');
    }
};

/**
 * Send test newsletter to a single email
 * POST /api/admin/newsletter/test
 */
export const sendTestNewsletter = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, subject, content, previewHtml } = req.body;

        if (!email || !subject || !content) {
            errorResponse(res, 'Email, subject, dan konten wajib diisi', 400);
            return;
        }

        try {
            await sendNewsletterEmail(
                email,
                `[TEST] ${subject}`,
                content,
                previewHtml || content,
                'Admin'
            );
            successResponse(res, null, 'Email test berhasil dikirim');
        } catch (err: any) {
            errorResponse(res, `Gagal mengirim email test: ${err.message}`, 500);
        }
    } catch (error) {
        console.error('Send test newsletter error:', error);
        errorResponse(res, 'Gagal mengirim email test');
    }
};
