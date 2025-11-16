import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response.utils';
import { createAnswerNotification } from '../utils/notification.service';

/**
 * Create new answer
 * POST /api/answers
 */
export const createAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const { questionId, content } = req.body;
    
    console.log('Create answer request:', { questionId, contentLength: content?.length, userId: user.id });

    // Additional validation
    if (!content || content.trim().length === 0) {
      errorResponse(res, 'Answer content is required', 400);
      return;
    }

    if (content.trim().length < 20) {
      errorResponse(res, 'Answer must be at least 20 characters', 400);
      return;
    }

    if (!questionId) {
      errorResponse(res, 'Question ID is required', 400);
      return;
    }

    // Check if question exists and is not closed
    const questionResult = await pool.query(
      'SELECT id, is_closed, author_id, title FROM public.questions WHERE id = $1',
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      notFoundResponse(res, 'Question not found');
      return;
    }

    const question = questionResult.rows[0];

    if (question.is_closed) {
      errorResponse(res, 'Cannot answer a closed question', 400);
      return;
    }

    // Create answer
    const result = await pool.query(
      `INSERT INTO public.answers (question_id, author_id, content) 
       VALUES ($1, $2, $3) 
       RETURNING id, question_id, content, is_accepted, created_at, updated_at`,
      [questionId, user.id, content]
    );

    const answer = result.rows[0];

    // Update question answers count
    await pool.query(
      'UPDATE public.questions SET answers_count = COALESCE(answers_count, 0) + 1 WHERE id = $1',
      [questionId]
    );

    // Get answerer name for notification
    const userResult = await pool.query(
      'SELECT display_name FROM public.users WHERE id = $1',
      [user.id]
    );

    // Send notification if answerer is not the question author
    if (question.author_id !== user.id && userResult.rows.length > 0) {
      try {
        await createAnswerNotification(
          question.author_id,
          userResult.rows[0].display_name,
          question.title,
          questionId
        );
      } catch (notifError) {
        console.error('Error creating answer notification:', notifError);
      }
    }

    successResponse(res, { answer }, 'Answer created successfully', 201);
  } catch (error) {
    console.error('Create answer error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get answer by ID
 * GET /api/answers/:id
 */
export const getAnswerById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const answerId = req.params.id;

    const result = await pool.query(`
      SELECT 
        a.id, a.content, a.question_id, a.is_accepted, a.created_at, a.updated_at,
        u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar
      FROM public.answers a
      LEFT JOIN public.users u ON a.author_id = u.id
      WHERE a.id = $1
    `, [answerId]);

    if (result.rows.length === 0) {
      notFoundResponse(res, 'Answer not found');
      return;
    }

    successResponse(res, result.rows[0]);
  } catch (error) {
    console.error('Get answer error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Update answer
 * PUT /api/answers/:id
 */
export const updateAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const answerId = req.params.id;
    const { content } = req.body;

    // Check if answer exists and user is author
    const answerResult = await pool.query(
      'SELECT author_id FROM public.answers WHERE id = $1',
      [answerId]
    );

    if (answerResult.rows.length === 0) {
      notFoundResponse(res, 'Answer not found');
      return;
    }

    const answer = answerResult.rows[0];

    if (answer.author_id !== user.id && user.role !== 'admin') {
      forbiddenResponse(res, 'Not authorized to update this answer');
      return;
    }

    // Update answer
    const updateResult = await pool.query(
      `UPDATE public.answers 
       SET content = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, content, question_id, is_accepted, created_at, updated_at`,
      [content, answerId]
    );

    successResponse(res, { answer: updateResult.rows[0] }, 'Answer updated successfully');
  } catch (error) {
    console.error('Update answer error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Delete answer
 * DELETE /api/answers/:id
 */
export const deleteAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const answerId = req.params.id;

    const answerResult = await pool.query(
      'SELECT author_id, question_id FROM public.answers WHERE id = $1',
      [answerId]
    );

    if (answerResult.rows.length === 0) {
      notFoundResponse(res, 'Answer not found');
      return;
    }

    const answer = answerResult.rows[0];

    if (answer.author_id !== user.id && user.role !== 'admin') {
      forbiddenResponse(res, 'Not authorized to delete this answer');
      return;
    }

    await pool.query('DELETE FROM public.answers WHERE id = $1', [answerId]);

    // Update question answers count
    await pool.query(
      'UPDATE public.questions SET answers_count = GREATEST(COALESCE(answers_count, 1) - 1, 0) WHERE id = $1',
      [answer.question_id]
    );

    successResponse(res, null, 'Answer deleted successfully');
  } catch (error) {
    console.error('Delete answer error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Accept answer
 * POST /api/answers/:id/accept
 */
export const acceptAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const answerId = req.params.id;

    // Get answer and question details
    const answerResult = await pool.query(`
      SELECT a.id, a.question_id, q.author_id as question_author_id
      FROM public.answers a
      JOIN public.questions q ON a.question_id = q.id
      WHERE a.id = $1
    `, [answerId]);

    if (answerResult.rows.length === 0) {
      notFoundResponse(res, 'Answer not found');
      return;
    }

    const answer = answerResult.rows[0];

    // Only question author can accept answers
    if (answer.question_author_id !== user.id) {
      forbiddenResponse(res, 'Only question author can accept answers');
      return;
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Unaccept all other answers for this question
      await client.query(
        'UPDATE public.answers SET is_accepted = false WHERE question_id = $1',
        [answer.question_id]
      );

      // Accept this answer
      await client.query(
        'UPDATE public.answers SET is_accepted = true WHERE id = $1',
        [answerId]
      );

      await client.query('COMMIT');

      successResponse(res, null, 'Answer accepted successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Accept answer error:', error);
    errorResponse(res, 'Server error');
  }
};
