import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response.utils';

/**
 * Get admin statistics
 * GET /api/admin/stats
 */
export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [usersCount, questionsCount, answersCount, tagsCount, communitiesCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM public.users'),
      pool.query('SELECT COUNT(*) FROM public.questions'),
      pool.query('SELECT COUNT(*) FROM public.answers'),
      pool.query('SELECT COUNT(*) FROM public.tags'),
      pool.query('SELECT COUNT(*) FROM public.communities')
    ]);

    successResponse(res, {
      users: parseInt(usersCount.rows[0].count),
      questions: parseInt(questionsCount.rows[0].count),
      answers: parseInt(answersCount.rows[0].count),
      tags: parseInt(tagsCount.rows[0].count),
      communities: parseInt(communitiesCount.rows[0].count)
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get all users (admin)
 * GET /api/admin/users
 */
export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, email, display_name, role, reputation_points, is_banned, is_verified, created_at 
       FROM public.users 
       ORDER BY created_at DESC`
    );

    successResponse(res, { users: result.rows });
  } catch (error) {
    console.error('Get admin users error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Update user (admin)
 * PUT /api/admin/users/:id
 */
export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { displayName, role, reputationPoints } = req.body;

    const result = await pool.query(
      `UPDATE public.users 
       SET display_name = COALESCE($1, display_name),
           role = COALESCE($2, role),
           reputation_points = COALESCE($3, reputation_points),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, email, display_name, role, reputation_points, is_banned, is_verified`,
      [displayName, role, reputationPoints, userId]
    );

    if (result.rows.length === 0) {
      notFoundResponse(res, 'User not found');
      return;
    }

    successResponse(res, { user: result.rows[0] }, 'User updated successfully');
  } catch (error) {
    console.error('Update user error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Delete user (admin)
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const result = await pool.query('DELETE FROM public.users WHERE id = $1', [userId]);

    if (result.rowCount === 0) {
      notFoundResponse(res, 'User not found');
      return;
    }

    successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Ban user
 * POST /api/admin/users/:id/ban
 */
export const banUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const result = await pool.query(
      'UPDATE public.users SET is_banned = true WHERE id = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      notFoundResponse(res, 'User not found');
      return;
    }

    successResponse(res, null, 'User banned successfully');
  } catch (error) {
    console.error('Ban user error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Unban user
 * POST /api/admin/users/:id/unban
 */
export const unbanUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const result = await pool.query(
      'UPDATE public.users SET is_banned = false WHERE id = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      notFoundResponse(res, 'User not found');
      return;
    }

    successResponse(res, null, 'User unbanned successfully');
  } catch (error) {
    console.error('Unban user error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Verify user
 * POST /api/admin/users/:id/verify
 */
export const verifyUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const result = await pool.query(
      'UPDATE public.users SET is_verified = true WHERE id = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      notFoundResponse(res, 'User not found');
      return;
    }

    successResponse(res, null, 'User verified successfully');
  } catch (error) {
    console.error('Verify user error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Unverify user
 * POST /api/admin/users/:id/unverify
 */
export const unverifyUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const result = await pool.query(
      'UPDATE public.users SET is_verified = false WHERE id = $1',
      [userId]
    );

    if (result.rowCount === 0) {
      notFoundResponse(res, 'User not found');
      return;
    }

    successResponse(res, null, 'User unverified successfully');
  } catch (error) {
    console.error('Unverify user error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get all questions (admin)
 * GET /api/admin/questions
 */
export const getAllQuestions = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        q.id, q.title, q.content, q.views_count, q.is_closed, q.created_at,
        u.id as author_id, u.display_name as author_name,
        COUNT(DISTINCT a.id) as answers_count
      FROM public.questions q
      LEFT JOIN public.users u ON q.author_id = u.id
      LEFT JOIN public.answers a ON q.id = a.question_id
      GROUP BY q.id, u.id
      ORDER BY q.created_at DESC
    `);

    successResponse(res, { questions: result.rows });
  } catch (error) {
    console.error('Get admin questions error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Update question (admin)
 * PUT /api/admin/questions/:id
 */
export const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questionId = req.params.id;
    const { title, content, isClosed } = req.body;

    const result = await pool.query(
      `UPDATE public.questions 
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           is_closed = COALESCE($3, is_closed),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, title, content, is_closed, created_at, updated_at`,
      [title, content, isClosed, questionId]
    );

    if (result.rows.length === 0) {
      notFoundResponse(res, 'Question not found');
      return;
    }

    successResponse(res, { question: result.rows[0] }, 'Question updated successfully');
  } catch (error) {
    console.error('Update question error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Delete question (admin)
 * DELETE /api/admin/questions/:id
 */
export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questionId = req.params.id;

    // Clean up related notifications before deleting question
    await pool.query(
      `DELETE FROM public.notifications 
       WHERE link LIKE $1`,
      [`/questions/${questionId}%`]
    );

    const result = await pool.query('DELETE FROM public.questions WHERE id = $1', [questionId]);

    if (result.rowCount === 0) {
      notFoundResponse(res, 'Question not found');
      return;
    }

    successResponse(res, null, 'Question deleted successfully');
  } catch (error) {
    console.error('Delete question error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get all communities (admin)
 * GET /api/admin/communities
 */
export const getAllCommunities = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.name, c.slug, c.description, c.category, c.is_popular, c.created_at,
        COUNT(DISTINCT cm.id) as members_count
      FROM public.communities c
      LEFT JOIN public.community_members cm ON c.id = cm.community_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    successResponse(res, { communities: result.rows });
  } catch (error) {
    console.error('Get admin communities error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Ban community
 * POST /api/admin/communities/:id/ban
 */
export const banCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const communityId = req.params.id;

    const result = await pool.query(
      'UPDATE public.communities SET is_banned = true WHERE id = $1',
      [communityId]
    );

    if (result.rowCount === 0) {
      notFoundResponse(res, 'Community not found');
      return;
    }

    successResponse(res, null, 'Community banned successfully');
  } catch (error) {
    console.error('Ban community error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Unban community
 * POST /api/admin/communities/:id/unban
 */
export const unbanCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const communityId = req.params.id;

    const result = await pool.query(
      'UPDATE public.communities SET is_banned = false WHERE id = $1',
      [communityId]
    );

    if (result.rowCount === 0) {
      notFoundResponse(res, 'Community not found');
      return;
    }

    successResponse(res, null, 'Community unbanned successfully');
  } catch (error) {
    console.error('Unban community error:', error);
    errorResponse(res, 'Server error');
  }
};
