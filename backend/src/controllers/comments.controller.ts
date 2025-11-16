import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response.utils';

/**
 * Create new comment
 * POST /api/comments
 */
export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const { content, commentableType, commentableId } = req.body;

    if (!['question', 'answer'].includes(commentableType)) {
      errorResponse(res, 'Invalid commentable type', 400);
      return;
    }

    // Check if target exists
    const targetTable = commentableType === 'question' ? 'questions' : 'answers';
    const targetResult = await pool.query(
      `SELECT id, author_id FROM public.${targetTable} WHERE id = $1`,
      [commentableId]
    );

    if (targetResult.rows.length === 0) {
      notFoundResponse(res, `${commentableType} not found`);
      return;
    }

    // Create comment
    const result = await pool.query(
      `INSERT INTO public.comments (content, author_id, commentable_type, commentable_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, content, commentable_type, commentable_id, created_at, updated_at`,
      [content, user.id, commentableType, commentableId]
    );

    successResponse(res, { comment: result.rows[0] }, 'Comment created successfully', 201);
  } catch (error) {
    console.error('Create comment error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get comment by ID
 * GET /api/comments/:id
 */
export const getCommentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const commentId = req.params.id;

    const result = await pool.query(`
      SELECT 
        c.id, c.content, c.commentable_type, c.commentable_id, c.created_at, c.updated_at,
        u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar
      FROM public.comments c
      LEFT JOIN public.users u ON c.author_id = u.id
      WHERE c.id = $1
    `, [commentId]);

    if (result.rows.length === 0) {
      notFoundResponse(res, 'Comment not found');
      return;
    }

    successResponse(res, result.rows[0]);
  } catch (error) {
    console.error('Get comment error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Update comment
 * PUT /api/comments/:id
 */
export const updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const commentId = req.params.id;
    const { content } = req.body;

    const commentResult = await pool.query(
      'SELECT author_id FROM public.comments WHERE id = $1',
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      notFoundResponse(res, 'Comment not found');
      return;
    }

    const comment = commentResult.rows[0];

    if (comment.author_id !== user.id && user.role !== 'admin') {
      forbiddenResponse(res, 'Not authorized to update this comment');
      return;
    }

    const updateResult = await pool.query(
      `UPDATE public.comments 
       SET content = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, content, commentable_type, commentable_id, created_at, updated_at`,
      [content, commentId]
    );

    successResponse(res, { comment: updateResult.rows[0] }, 'Comment updated successfully');
  } catch (error) {
    console.error('Update comment error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Delete comment
 * DELETE /api/comments/:id
 */
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const commentId = req.params.id;

    const commentResult = await pool.query(
      'SELECT author_id FROM public.comments WHERE id = $1',
      [commentId]
    );

    if (commentResult.rows.length === 0) {
      notFoundResponse(res, 'Comment not found');
      return;
    }

    const comment = commentResult.rows[0];

    if (comment.author_id !== user.id && user.role !== 'admin') {
      forbiddenResponse(res, 'Not authorized to delete this comment');
      return;
    }

    await pool.query('DELETE FROM public.comments WHERE id = $1', [commentId]);

    successResponse(res, null, 'Comment deleted successfully');
  } catch (error) {
    console.error('Delete comment error:', error);
    errorResponse(res, 'Server error');
  }
};
