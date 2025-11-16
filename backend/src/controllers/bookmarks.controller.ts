import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { successResponse, errorResponse, forbiddenResponse } from '../utils/response.utils';

/**
 * Get user bookmarks
 * GET /api/bookmarks
 */
export const getBookmarks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        b.id as bookmark_id, b.created_at as bookmarked_at,
        q.id, q.title, q.content, q.views_count, q.created_at,
        u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar,
        COUNT(DISTINCT a.id) as answers_count,
        COUNT(DISTINCT CASE WHEN v.vote_type = 'upvote' THEN v.id END) as upvotes_count
      FROM public.bookmarks b
      JOIN public.questions q ON b.question_id = q.id
      LEFT JOIN public.users u ON q.author_id = u.id
      LEFT JOIN public.answers a ON q.id = a.question_id
      LEFT JOIN public.votes v ON v.question_id = q.id
      WHERE b.user_id = $1
      GROUP BY b.id, q.id, u.id
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `, [user.id, limit, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM public.bookmarks WHERE user_id = $1',
      [user.id]
    );

    const total = parseInt(countResult.rows[0].total);

    successResponse(res, {
      bookmarks: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Create bookmark
 * POST /api/bookmarks
 */
export const createBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const { questionId } = req.body;

    // Check if already bookmarked
    const existing = await pool.query(
      'SELECT id FROM public.bookmarks WHERE user_id = $1 AND question_id = $2',
      [user.id, questionId]
    );

    if (existing.rows.length > 0) {
      errorResponse(res, 'Question already bookmarked', 400);
      return;
    }

    // Create bookmark
    const result = await pool.query(
      'INSERT INTO public.bookmarks (user_id, question_id) VALUES ($1, $2) RETURNING id, created_at',
      [user.id, questionId]
    );

    successResponse(res, { bookmark: result.rows[0] }, 'Bookmark created successfully', 201);
  } catch (error) {
    console.error('Create bookmark error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Delete bookmark
 * DELETE /api/bookmarks
 */
export const deleteBookmark = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    // Accept questionId from query params or body
    const questionId = req.query.questionId || req.body.questionId;

    if (!questionId) {
      errorResponse(res, 'Question ID is required', 400);
      return;
    }

    const result = await pool.query(
      'DELETE FROM public.bookmarks WHERE user_id = $1 AND question_id = $2',
      [user.id, questionId]
    );

    if (result.rowCount === 0) {
      errorResponse(res, 'Bookmark not found', 404);
      return;
    }

    successResponse(res, null, 'Bookmark deleted successfully');
  } catch (error) {
    console.error('Delete bookmark error:', error);
    errorResponse(res, 'Server error');
  }
};
