import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response.utils';
import { createVoteNotification } from '../utils/notification.service';

/**
 * Create or update vote
 * POST /api/votes
 */
export const createOrUpdateVote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const { targetType, targetId, voteType } = req.body;

    if (!['question', 'answer'].includes(targetType)) {
      errorResponse(res, 'Invalid target type', 400);
      return;
    }

    if (!['upvote', 'downvote'].includes(voteType)) {
      errorResponse(res, 'Invalid vote type', 400);
      return;
    }

    // Check if target exists
    const targetTable = targetType === 'question' ? 'questions' : 'answers';
    const targetResult = await pool.query(
      `SELECT id FROM public.${targetTable} WHERE id = $1`,
      [targetId]
    );

    if (targetResult.rows.length === 0) {
      notFoundResponse(res, `${targetType} not found`);
      return;
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Lock the target row to prevent race conditions
      await client.query(
        `SELECT id FROM public.${targetTable} WHERE id = $1 FOR UPDATE`,
        [targetId]
      );

      // Check existing vote with row-level lock
      let existingVoteResult;
      if (targetType === 'question') {
        existingVoteResult = await client.query(
          `SELECT id, vote_type FROM public.votes 
           WHERE user_id = $1 AND question_id = $2 
           FOR UPDATE`,
          [user.id, targetId]
        );
      } else {
        existingVoteResult = await client.query(
          `SELECT id, vote_type FROM public.votes 
           WHERE user_id = $1 AND answer_id = $2 
           FOR UPDATE`,
          [user.id, targetId]
        );
      }

      if (existingVoteResult.rows.length > 0) {
        const existingVote = existingVoteResult.rows[0];

        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          await client.query('DELETE FROM public.votes WHERE id = $1', [existingVote.id]);

          const countsResult = await client.query(
            targetType === 'question'
              ? `SELECT 
                  COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes_count,
                  COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes_count
                 FROM votes WHERE question_id = $1`
              : `SELECT 
                  COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes_count,
                  COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes_count
                 FROM votes WHERE answer_id = $1`,
            [targetId]
          );

          await client.query('COMMIT');

          successResponse(res, {
            action: 'removed',
            userVote: null,
            upvotes_count: parseInt(countsResult.rows[0].upvotes_count),
            downvotes_count: parseInt(countsResult.rows[0].downvotes_count)
          }, 'Vote removed');
          return;
        } else {
          // Update vote type
          await client.query(
            'UPDATE public.votes SET vote_type = $1 WHERE id = $2',
            [voteType, existingVote.id]
          );
        }
      } else {
        // Create new vote
        if (targetType === 'question') {
          await client.query(
            'INSERT INTO public.votes (user_id, question_id, vote_type) VALUES ($1, $2, $3)',
            [user.id, targetId, voteType]
          );
        } else {
          await client.query(
            'INSERT INTO public.votes (user_id, answer_id, vote_type) VALUES ($1, $2, $3)',
            [user.id, targetId, voteType]
          );
        }
      }

      // Get updated vote counts and user's current vote
      const countsResult = await client.query(
        targetType === 'question'
          ? `SELECT 
              COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes_count,
              COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes_count
             FROM votes WHERE question_id = $1`
          : `SELECT 
              COUNT(*) FILTER (WHERE vote_type = 'upvote') as upvotes_count,
              COUNT(*) FILTER (WHERE vote_type = 'downvote') as downvotes_count
             FROM votes WHERE answer_id = $1`,
        [targetId]
      );

      // Get user's current vote after the operation
      const userVoteResult = await client.query(
        targetType === 'question'
          ? `SELECT vote_type FROM votes WHERE user_id = $1 AND question_id = $2`
          : `SELECT vote_type FROM votes WHERE user_id = $1 AND answer_id = $2`,
        [user.id, targetId]
      );

      await client.query('COMMIT');

      // Send notification for upvotes (optional)
      try {
        if (voteType === 'upvote') {
          const targetData = await pool.query(
            targetType === 'question'
              ? `SELECT q.author_id, q.title, u.display_name 
                 FROM questions q, users u 
                 WHERE q.id = $1 AND u.id = $2`
              : `SELECT a.author_id, q.title, u.display_name 
                 FROM answers a, questions q, users u 
                 WHERE a.id = $1 AND a.question_id = q.id AND u.id = $2`,
            [targetId, user.id]
          );

          if (targetData.rows.length > 0 && targetData.rows[0].author_id !== user.id) {
            await createVoteNotification(
              targetData.rows[0].author_id,
              targetData.rows[0].display_name,
              targetData.rows[0].title,
              targetId,
              voteType,
              targetType
            );
          }
        }
      } catch (notifError) {
        console.error('Error creating vote notification:', notifError);
      }

      const currentUserVote = userVoteResult.rows.length > 0 ? userVoteResult.rows[0].vote_type : null;

      successResponse(res, {
        action: existingVoteResult.rows.length > 0 ? 'updated' : 'created',
        userVote: currentUserVote,
        upvotes_count: parseInt(countsResult.rows[0].upvotes_count),
        downvotes_count: parseInt(countsResult.rows[0].downvotes_count)
      }, 'Vote recorded successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Vote error:', error);
    errorResponse(res, 'Server error');
  }
};
