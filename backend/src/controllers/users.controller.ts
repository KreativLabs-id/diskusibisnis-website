import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response.utils';

/**
 * Get all users
 * GET /api/users
 */
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id, display_name, avatar_url, reputation_points, 
        role, is_verified, created_at
      FROM public.users
      WHERE is_banned = false
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND display_name ILIKE $${paramIndex}`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    query += ` ORDER BY reputation_points DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM public.users WHERE is_banned = false';
    const countParams: any[] = [];

    if (search) {
      countQuery += ' AND display_name ILIKE $1';
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    successResponse(res, {
      users: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get user by ID or username
 * GET /api/users/:id
 * Supports both UUID and username
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idOrUsername = req.params.id;

    // Check if parameter is UUID or username
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUsername);

    let query;
    if (isUUID) {
      query = `
        SELECT 
          id, display_name, username, avatar_url, bio, reputation_points, 
          role, is_verified, created_at, google_id,
          (password_hash IS NOT NULL) as has_password,
          (SELECT COUNT(*) FROM questions WHERE author_id = users.id) as questions_count,
          (SELECT COUNT(*) FROM answers WHERE author_id = users.id) as answers_count,
          (SELECT COUNT(*) FROM votes WHERE user_id = users.id) as total_votes
        FROM public.users
        WHERE id = $1
      `;
    } else {
      query = `
        SELECT 
          id, display_name, username, avatar_url, bio, reputation_points, 
          role, is_verified, created_at, google_id,
          (password_hash IS NOT NULL) as has_password,
          (SELECT COUNT(*) FROM questions WHERE author_id = users.id) as questions_count,
          (SELECT COUNT(*) FROM answers WHERE author_id = users.id) as answers_count,
          (SELECT COUNT(*) FROM votes WHERE user_id = users.id) as total_votes
        FROM public.users
        WHERE username = $1
      `;
    }

    const result = await pool.query(query, [idOrUsername]);

    if (result.rows.length === 0) {
      notFoundResponse(res, 'User not found');
      return;
    }

    successResponse(res, { user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get user by username
 * GET /api/users/username/:username
 */
export const getUserByUsername = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const username = req.params.username;

    const result = await pool.query(`
      SELECT 
        id, display_name, username, avatar_url, bio, reputation_points, 
        role, is_verified, created_at,
        (SELECT COUNT(*) FROM questions WHERE author_id = users.id) as questions_count,
        (SELECT COUNT(*) FROM answers WHERE author_id = users.id) as answers_count,
        (SELECT COUNT(*) FROM votes WHERE user_id = users.id) as total_votes
      FROM public.users
      WHERE username = $1
    `, [username]);

    if (result.rows.length === 0) {
      notFoundResponse(res, 'User not found');
      return;
    }

    successResponse(res, { user: result.rows[0] });
  } catch (error) {
    console.error('Get user by username error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get user questions
 * GET /api/users/:id/questions
 * Supports both UUID and username
 */
export const getUserQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idOrUsername = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Check if parameter is UUID or username
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUsername);

    // Get user ID from username if needed
    let userId = idOrUsername;
    if (!isUUID) {
      const userResult = await pool.query(
        'SELECT id FROM public.users WHERE username = $1',
        [idOrUsername]
      );
      if (userResult.rows.length === 0) {
        notFoundResponse(res, 'User not found');
        return;
      }
      userId = userResult.rows[0].id;
    }

    const result = await pool.query(`
      SELECT 
        q.id, q.title, q.content, q.views_count, q.is_closed, q.created_at,
        COUNT(DISTINCT a.id) as answers_count,
        COUNT(DISTINCT CASE WHEN v.vote_type = 'upvote' THEN v.id END) as upvotes_count
      FROM public.questions q
      LEFT JOIN public.answers a ON q.id = a.question_id
      LEFT JOIN public.votes v ON v.question_id = q.id
      WHERE q.author_id = $1
      GROUP BY q.id
      ORDER BY q.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM public.questions WHERE author_id = $1',
      [userId]
    );

    const total = parseInt(countResult.rows[0].total);

    successResponse(res, {
      questions: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user questions error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get user answers
 * GET /api/users/:id/answers
 * Supports both UUID and username
 */
export const getUserAnswers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idOrUsername = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Check if parameter is UUID or username
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrUsername);

    // Get user ID from username if needed
    let userId = idOrUsername;
    if (!isUUID) {
      const userResult = await pool.query(
        'SELECT id FROM public.users WHERE username = $1',
        [idOrUsername]
      );
      if (userResult.rows.length === 0) {
        notFoundResponse(res, 'User not found');
        return;
      }
      userId = userResult.rows[0].id;
    }

    const result = await pool.query(`
      SELECT 
        a.id, a.content, a.is_accepted, a.created_at,
        q.id as question_id, q.title as question_title,
        COUNT(DISTINCT CASE WHEN v.vote_type = 'upvote' THEN v.id END) as upvotes_count
      FROM public.answers a
      JOIN public.questions q ON a.question_id = q.id
      LEFT JOIN public.votes v ON v.answer_id = a.id
      WHERE a.author_id = $1
      GROUP BY a.id, q.id
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM public.answers WHERE author_id = $1',
      [userId]
    );

    const total = parseInt(countResult.rows[0].total);

    successResponse(res, {
      answers: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user answers error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get user activities (reputation activities)
 * GET /api/users/:id/activities
 */
export const getUserActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // Get reputation activities
    const result = await pool.query(`
      SELECT * FROM (
        -- Question upvotes (+5 points)
        SELECT 
          v.id,
          'question_upvote' as type,
          5 as points,
          'Pertanyaan Anda mendapat upvote' as description,
          v.created_at as date,
          q.title as "questionTitle",
          q.id as "questionId"
        FROM public.votes v
        JOIN public.questions q ON v.question_id = q.id
        WHERE q.author_id = $1 
          AND v.vote_type = 'upvote'
          AND v.question_id IS NOT NULL
        
        UNION ALL
        
        -- Answer upvotes (+10 points)
        SELECT 
          v.id,
          'answer_upvote' as type,
          10 as points,
          'Jawaban Anda mendapat upvote' as description,
          v.created_at as date,
          q.title as "questionTitle",
          q.id as "questionId"
        FROM public.votes v
        JOIN public.answers a ON v.answer_id = a.id
        JOIN public.questions q ON a.question_id = q.id
        WHERE a.author_id = $1 
          AND v.vote_type = 'upvote'
          AND v.answer_id IS NOT NULL
        
        UNION ALL
        
        -- Answer accepted (+15 points)
        SELECT 
          a.id,
          'answer_accepted' as type,
          15 as points,
          'Jawaban Anda diterima' as description,
          a.updated_at as date,
          q.title as "questionTitle",
          q.id as "questionId"
        FROM public.answers a
        JOIN public.questions q ON a.question_id = q.id
        WHERE a.author_id = $1 
          AND a.is_accepted = true
        
        UNION ALL
        
        -- Question posted (+2 points)
        SELECT 
          q.id,
          'question_posted' as type,
          2 as points,
          'Pertanyaan diposting' as description,
          q.created_at as date,
          q.title as "questionTitle",
          q.id as "questionId"
        FROM public.questions q
        WHERE q.author_id = $1
      ) activities
      ORDER BY date DESC
      LIMIT $2 OFFSET $3
    `, [userId, limit, offset]);

    // Get total reputation points
    const reputationResult = await pool.query(
      'SELECT reputation_points FROM public.users WHERE id = $1',
      [userId]
    );

    const totalReputation = reputationResult.rows[0]?.reputation_points || 0;

    successResponse(res, {
      activities: result.rows,
      totalReputation,
      pagination: {
        page,
        limit,
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Get user activities error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get user rank
 * GET /api/users/:id/rank
 */
export const getUserRank = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const result = await pool.query(`
      SELECT 
        COUNT(*) + 1 as rank
      FROM public.users
      WHERE reputation_points > (
        SELECT reputation_points FROM public.users WHERE id = $1
      )
    `, [userId]);

    const userResult = await pool.query(
      'SELECT reputation_points FROM public.users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      notFoundResponse(res, 'User not found');
      return;
    }

    successResponse(res, {
      rank: parseInt(result.rows[0].rank),
      reputation_points: userResult.rows[0].reputation_points
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Update user profile
 * PUT /api/users/:id
 */
export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { displayName, bio, avatarUrl } = req.body;

    // Check if user is updating their own profile or is admin
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only update your own profile'
      });
      return;
    }

    // Validate required fields
    if (!displayName || displayName.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Display name is required'
      });
      return;
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    updates.push(`display_name = $${paramIndex}`);
    values.push(displayName.trim());
    paramIndex++;

    if (bio !== undefined) {
      updates.push(`bio = $${paramIndex}`);
      values.push(bio ? bio.trim() : null);
      paramIndex++;
    }

    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramIndex}`);
      values.push(avatarUrl || null);
      paramIndex++;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE public.users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, display_name, avatar_url, bio, reputation_points, role, is_verified, created_at, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      notFoundResponse(res, 'User not found');
      return;
    }

    successResponse(res, {
      user: result.rows[0],
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Delete user avatar
 * DELETE /api/users/:id/avatar
 */
export const deleteUserAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    // Check if user is deleting their own avatar or is admin
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own avatar'
      });
      return;
    }

    const result = await pool.query(`
      UPDATE public.users
      SET avatar_url = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, display_name, avatar_url, bio, reputation_points, role, is_verified
    `, [userId]);

    if (result.rows.length === 0) {
      notFoundResponse(res, 'User not found');
      return;
    }

    successResponse(res, {
      user: result.rows[0],
      message: 'Avatar deleted successfully'
    });
  } catch (error) {
    console.error('Delete user avatar error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Delete user account (self-deletion)
 * DELETE /api/users/:id/account
 * 
 * This permanently deletes:
 * - User record
 * - All questions authored by user
 * - All answers authored by user
 * - All comments authored by user
 * - All votes by user
 * - All bookmarks by user
 * - All notifications for user
 * - All community memberships
 */
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  const client = await pool.connect();

  try {
    const userId = req.params.id;
    const { password } = req.body;

    // Check if user is deleting their own account
    if (req.user?.id !== userId) {
      res.status(403).json({
        success: false,
        message: 'Anda hanya dapat menghapus akun Anda sendiri'
      });
      return;
    }

    // Get user data to verify password (if not Google user)
    const userResult = await client.query(
      'SELECT id, email, password_hash, google_id, display_name FROM public.users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
      return;
    }

    const user = userResult.rows[0];

    // Password is required ONLY if user has a password (not a Google-only account)
    // Google-only users (have google_id but no password_hash) don't need password
    const needsPassword = user.password_hash && !user.google_id;

    if (needsPassword) {
      if (!password) {
        res.status(400).json({
          success: false,
          message: 'Password diperlukan untuk menghapus akun'
        });
        return;
      }

      // Import bcrypt for password verification
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: 'Password tidak sesuai'
        });
        return;
      }
    }

    // Start transaction
    await client.query('BEGIN');

    try {
      // Delete in order to respect foreign key constraints

      // 1. Delete notifications
      await client.query('DELETE FROM public.notifications WHERE user_id = $1', [userId]);
      console.log(`Deleted notifications for user ${userId}`);

      // 2. Delete bookmarks
      await client.query('DELETE FROM public.bookmarks WHERE user_id = $1', [userId]);
      console.log(`Deleted bookmarks for user ${userId}`);

      // 3. Delete votes
      await client.query('DELETE FROM public.votes WHERE user_id = $1', [userId]);
      console.log(`Deleted votes for user ${userId}`);

      // 4. Delete comments
      await client.query('DELETE FROM public.comments WHERE author_id = $1', [userId]);
      console.log(`Deleted comments for user ${userId}`)

      // 5. Delete answers
      await client.query('DELETE FROM public.answers WHERE author_id = $1', [userId]);
      console.log(`Deleted answers for user ${userId}`);

      // 6. Delete community memberships
      await client.query('DELETE FROM public.community_members WHERE user_id = $1', [userId]);
      console.log(`Deleted community memberships for user ${userId}`);

      // 7. Delete questions
      await client.query('DELETE FROM public.questions WHERE author_id = $1', [userId]);
      console.log(`Deleted questions for user ${userId}`);

      // 8. Delete support tickets if table exists
      const supportTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_tickets'
        )
      `);
      if (supportTableExists.rows[0].exists) {
        await client.query('DELETE FROM public.support_tickets WHERE email = $1', [user.email]);
        console.log(`Deleted support tickets for user ${userId}`);
      }

      // 9. Delete newsletter subscription if table exists
      const newsletterTableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'newsletter_subscribers'
        )
      `);
      if (newsletterTableExists.rows[0].exists) {
        await client.query('DELETE FROM public.newsletter_subscribers WHERE email = $1', [user.email]);
        console.log(`Deleted newsletter subscription for user ${userId}`);
      }

      // 10. Finally, delete the user
      await client.query('DELETE FROM public.users WHERE id = $1', [userId]);
      console.log(`Deleted user ${userId}`);

      // Commit transaction
      await client.query('COMMIT');

      successResponse(res, null, 'Akun Anda berhasil dihapus secara permanen');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Delete account error:', error);
    errorResponse(res, 'Gagal menghapus akun. Silakan coba lagi.');
  } finally {
    client.release();
  }
};
