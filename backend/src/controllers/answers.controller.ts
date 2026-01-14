import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response.utils';
import { createAnswerNotification } from '../utils/notification.service';
import { createMentions } from './mentions.controller';
import { invalidateCache } from '../utils/cache';

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

    // Create mentions after successful answer creation
    await createMentions(user.id, 'answer', answer.id, content);

    // ✅ Invalidate questions cache so answer count updates
    invalidateCache.questions();

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

    // Clean up related notifications before deleting answer
    await pool.query(
      `DELETE FROM public.notifications 
       WHERE (type IN ('answer', 'accepted_answer', 'vote', 'comment', 'mention') 
       AND link = $1)
       OR (type = 'accepted_answer' AND user_id = $2 AND link = $1)`,
      [`/questions/${answer.question_id}`, answer.author_id]
    );

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
 * Accept answer (or unaccept if already accepted)
 * POST /api/answers/:id/accept
 */
export const acceptAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  let client;

  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const answerId = req.params.id;
    console.log('Accept answer request:', { answerId, userId: user.id });

    // Validate answerId format (should be UUID)
    if (!answerId || !answerId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      errorResponse(res, 'Invalid answer ID format', 400);
      return;
    }

    client = await pool.connect();

    // Get answer and question details
    const answerResult = await client.query(`
      SELECT a.id, a.question_id, a.is_accepted, q.author_id as question_author_id
      FROM public.answers a
      JOIN public.questions q ON a.question_id = q.id
      WHERE a.id = $1
    `, [answerId]);

    if (answerResult.rows.length === 0) {
      notFoundResponse(res, 'Answer not found');
      return;
    }

    const answer = answerResult.rows[0];
    console.log('Answer found:', { answerId: answer.id, questionId: answer.question_id, isAccepted: answer.is_accepted, questionAuthorId: answer.question_author_id });

    // Only question author can accept answers
    if (answer.question_author_id !== user.id) {
      forbiddenResponse(res, 'Only question author can accept answers');
      return;
    }

    await client.query('BEGIN');

    let action = 'accepted';

    try {
      // If answer is already accepted, unaccept it
      if (answer.is_accepted) {
        console.log('Unaccepting answer:', answerId);
        await client.query(
          'UPDATE public.answers SET is_accepted = false WHERE id = $1',
          [answerId]
        );
        action = 'unaccepted';
      } else {
        console.log('Accepting answer:', answerId);
        // Unaccept all other answers for this question first
        await client.query(
          'UPDATE public.answers SET is_accepted = false WHERE question_id = $1',
          [answer.question_id]
        );

        // Accept this answer
        await client.query(
          'UPDATE public.answers SET is_accepted = true WHERE id = $1',
          [answerId]
        );
        action = 'accepted';
      }

      await client.query('COMMIT');
      console.log('Accept answer success:', { action });

      successResponse(res, { action }, action === 'accepted' ? 'Answer accepted successfully' : 'Answer unaccepted successfully');
    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      await client.query('ROLLBACK');
      throw transactionError;
    }
  } catch (error) {
    console.error('Accept answer error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error('Error details:', { message: errorMessage, stack: error instanceof Error ? error.stack : undefined });
    errorResponse(res, 'Failed to accept answer. Please try again.');
  } finally {
    if (client) {
      client.release();
    }
  }
};
