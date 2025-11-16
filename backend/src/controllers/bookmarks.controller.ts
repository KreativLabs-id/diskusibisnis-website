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
        q.id, q.title, q.content, q.images, q.views_count, q.created_at,
        u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar,
        u.reputation_points as author_reputation,
        COALESCE(u.is_verified, false) as author_is_verified,
        COUNT(DISTINCT a.id) as answers_count,
        COUNT(DISTINCT CASE WHEN v.vote_type = 'upvote' THEN v.id END) as upvotes_count,
        CASE WHEN COUNT(DISTINCT a_accepted.id) > 0 THEN true ELSE false END as has_accepted_answer
      FROM public.bookmarks b
      JOIN public.questions q ON b.question_id = q.id
      LEFT JOIN public.users u ON q.author_id = u.id
      LEFT JOIN public.answers a ON q.id = a.question_id
      LEFT JOIN public.answers a_accepted ON q.id = a_accepted.question_id AND a_accepted.is_accepted = true
      LEFT JOIN public.votes v ON v.question_id = q.id
      WHERE b.user_id = $1
      GROUP BY b.id, q.id, u.id
      ORDER BY b.created_at DESC
      LIMIT $2 OFFSET $3
    `, [user.id, limit, offset]);

    // Fetch tags for each question
    const questionIds = result.rows.map(row => row.id);
    const tagsResult = await pool.query(`
      SELECT qt.question_id, t.id, t.name, t.slug
      FROM public.question_tags qt
      JOIN public.tags t ON qt.tag_id = t.id
      WHERE qt.question_id = ANY($1)
    `, [questionIds]);

    // Group tags by question_id
    const tagsByQuestion: { [key: string]: any[] } = {};
    tagsResult.rows.forEach(tag => {
      if (!tagsByQuestion[tag.question_id]) {
        tagsByQuestion[tag.question_id] = [];
      }
      tagsByQuestion[tag.question_id].push({
        id: tag.id,
        name: tag.name,
        slug: tag.slug
      });
    });

    // Add tags and parse images to each bookmark
    const bookmarksWithTags = result.rows.map(bookmark => ({
      ...bookmark,
      images: bookmark.images ? (typeof bookmark.images === 'string' ? JSON.parse(bookmark.images) : bookmark.images) : null,
      tags: tagsByQuestion[bookmark.id] || []
    }));

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM public.bookmarks WHERE user_id = $1',
      [user.id]
    );

    const total = parseInt(countResult.rows[0].total);

    successResponse(res, {
      bookmarks: bookmarksWithTags,
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
    console.log('Create bookmark request:', { userId: user.id, questionId });

    if (!questionId) {
      errorResponse(res, 'Question ID is required', 400);
      return;
    }

    // Check if question exists
    const questionCheck = await pool.query(
      'SELECT id FROM public.questions WHERE id = $1',
      [questionId]
    );

    if (questionCheck.rows.length === 0) {
      errorResponse(res, 'Question not found', 404);
      return;
    }

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

    console.log('Bookmark created:', result.rows[0]);
    successResponse(res, { bookmark: result.rows[0] }, 'Bookmark created successfully', 201);
  } catch (error: any) {
    console.error('Create bookmark error:', error);
    console.error('Error details:', { message: error.message, code: error.code });
    errorResponse(res, 'Failed to create bookmark');
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
    console.log('Delete bookmark request:', { userId: user.id, questionId });

    if (!questionId) {
      errorResponse(res, 'Question ID is required', 400);
      return;
    }

    const result = await pool.query(
      'DELETE FROM public.bookmarks WHERE user_id = $1 AND question_id = $2',
      [user.id, questionId]
    );

    if (result.rowCount === 0) {
      console.log('Bookmark not found for deletion');
      errorResponse(res, 'Bookmark not found', 404);
      return;
    }

    console.log('Bookmark deleted successfully');
    successResponse(res, null, 'Bookmark deleted successfully');
  } catch (error) {
    console.error('Delete bookmark error:', error);
    errorResponse(res, 'Server error');
  }
};
