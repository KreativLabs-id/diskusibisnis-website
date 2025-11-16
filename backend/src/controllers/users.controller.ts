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
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const result = await pool.query(`
      SELECT 
        id, display_name, avatar_url, reputation_points, 
        role, is_verified, created_at,
        (SELECT COUNT(*) FROM questions WHERE author_id = $1) as questions_count,
        (SELECT COUNT(*) FROM answers WHERE author_id = $1) as answers_count
      FROM public.users
      WHERE id = $1
    `, [userId]);

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
 * Get user questions
 * GET /api/users/:id/questions
 */
export const getUserQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

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
 */
export const getUserAnswers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

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
