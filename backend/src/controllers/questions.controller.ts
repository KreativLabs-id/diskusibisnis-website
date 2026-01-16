import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response.utils';
import { generateUniqueSlug } from '../utils/slug.utils';
import { createMentions } from './mentions.controller';
import { apiCache, cacheKeys, invalidateCache } from '../utils/cache';

/**
 * Get all questions with filters
 * GET /api/questions
 */
export const getQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    let sort = (req.query.sort as string) || 'newest';
    const search = (req.query.search as string) || '';
    const tag = (req.query.tag as string) || '';
    let status = (req.query.status as string) || '';

    // Map frontend sort values to backend values
    if (sort === 'popular') {
      sort = 'most_voted';
    } else if (sort === 'unanswered') {
      status = 'unanswered';
      sort = 'newest';
    }

    // ✅ Check cache first for non-search requests (30 second cache)
    const cacheKey = cacheKeys.questions(sort + status, tag, page);
    if (!search) {
      const cached = apiCache.get<any>(cacheKey);
      if (cached) {
        console.log(`[Cache HIT] ${cacheKey}`);
        successResponse(res, cached);
        return;
      }
    }

    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT 
        q.id, q.title, q.content, q.images,
        COALESCE(q.views_count, 0) as views_count, 
        q.is_closed, q.created_at, q.updated_at,
        u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar,
        u.reputation_points as author_reputation, 
        COALESCE(u.is_verified, false) as author_is_verified,
        COUNT(DISTINCT a.id) as answers_count,
        COUNT(DISTINCT CASE WHEN v.vote_type = 'upvote' THEN v.id END) as upvotes_count,
        CASE WHEN COUNT(DISTINCT a_accepted.id) > 0 THEN true ELSE false END as has_accepted_answer
      FROM public.questions q
      LEFT JOIN public.users u ON q.author_id = u.id
      LEFT JOIN public.answers a ON q.id = a.question_id
      LEFT JOIN public.answers a_accepted ON q.id = a_accepted.question_id AND a_accepted.is_accepted = true
      LEFT JOIN public.votes v ON v.question_id = q.id
      LEFT JOIN public.question_tags qt ON q.id = qt.question_id
      LEFT JOIN public.tags t ON qt.tag_id = t.id
      WHERE q.community_id IS NULL
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      baseQuery += ` AND (q.title ILIKE $${paramIndex} OR q.content ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (tag) {
      baseQuery += ` AND t.name = $${paramIndex}`;
      queryParams.push(tag);
      paramIndex++;
    }

    if (status === 'unanswered') {
      baseQuery += ` AND NOT EXISTS (SELECT 1 FROM public.answers WHERE question_id = q.id)`;
    } else if (status === 'answered') {
      baseQuery += ` AND EXISTS (SELECT 1 FROM public.answers WHERE question_id = q.id)`;
    }

    baseQuery += ` GROUP BY q.id, u.id`;

    // Add sorting
    switch (sort) {
      case 'newest':
        baseQuery += ` ORDER BY q.created_at DESC`;
        break;
      case 'oldest':
        baseQuery += ` ORDER BY q.created_at ASC`;
        break;
      case 'most_viewed':
        baseQuery += ` ORDER BY q.views_count DESC`;
        break;
      case 'most_voted':
        baseQuery += ` ORDER BY upvotes_count DESC, q.views_count DESC, q.created_at DESC`;
        break;
      default:
        baseQuery += ` ORDER BY q.created_at DESC`;
    }

    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(baseQuery, queryParams);

    // Fetch all tags for all questions
    const questionIds = result.rows.map(q => q.id);
    let questionsWithTags = result.rows;

    if (questionIds.length > 0) {
      const tagsResult = await pool.query(`
        SELECT 
          qt.question_id,
          t.id, t.name, t.slug
        FROM public.tags t
        JOIN public.question_tags qt ON t.id = qt.tag_id
        WHERE qt.question_id = ANY($1)
        ORDER BY qt.question_id, t.name
      `, [questionIds]);

      const tagsByQuestion = tagsResult.rows.reduce((acc, row) => {
        if (!acc[row.question_id]) {
          acc[row.question_id] = [];
        }
        acc[row.question_id].push({
          id: row.id,
          name: row.name,
          slug: row.slug
        });
        return acc;
      }, {} as Record<string, any[]>);

      questionsWithTags = result.rows.map(question => ({
        ...question,
        images: typeof question.images === 'string' ? JSON.parse(question.images) : question.images,
        tags: tagsByQuestion[question.id] || []
      }));
    }

    // Get total count
    let countQuery = `
      SELECT COUNT(DISTINCT q.id) as total
      FROM public.questions q
      LEFT JOIN public.question_tags qt ON q.id = qt.question_id
      LEFT JOIN public.tags t ON qt.tag_id = t.id
      WHERE q.community_id IS NULL
    `;

    const countParams: any[] = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (q.title ILIKE $${countParamIndex} OR q.content ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (tag) {
      countQuery += ` AND t.name = $${countParamIndex}`;
      countParams.push(tag);
      countParamIndex++;
    }

    if (status === 'unanswered') {
      countQuery += ` AND NOT EXISTS (SELECT 1 FROM public.answers WHERE question_id = q.id)`;
    } else if (status === 'answered') {
      countQuery += ` AND EXISTS (SELECT 1 FROM public.answers WHERE question_id = q.id)`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    const responseData = {
      questions: questionsWithTags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    // ✅ Cache results for 10 seconds (reduced for faster vote updates)
    if (!search) {
      apiCache.set(cacheKey, responseData, 10000);
      console.log(`[Cache SET] ${cacheKey}`);
    }

    successResponse(res, responseData);
  } catch (error) {
    console.error('Get questions error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Create new question
 * POST /api/questions
 */
export const createQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const { title, content, tags, community_slug, images } = req.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get community ID if community_slug is provided
      let communityId = null;
      if (community_slug) {
        const communityResult = await client.query(
          'SELECT id FROM public.communities WHERE slug = $1',
          [community_slug]
        );
        if (communityResult.rows.length > 0) {
          communityId = communityResult.rows[0].id;
        }
      }

      // Prepare images JSON (store as JSONB array)
      const imagesJson = images && images.length > 0 ? JSON.stringify(images) : null;

      // Create question with images
      const questionResult = await client.query(
        `INSERT INTO public.questions (title, content, author_id, community_id, images) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, title, content, images, views_count, is_closed, created_at, updated_at`,
        [title, content, user.id, communityId, imagesJson]
      );

      const question = questionResult.rows[0];

      // Handle tags
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          const tagResult = await client.query(
            'SELECT id FROM public.tags WHERE LOWER(name) = LOWER($1)',
            [tagName]
          );

          let tagId;
          if (tagResult.rows.length === 0) {
            const uniqueSlug = await generateUniqueSlug(tagName, 'tags');
            const newTagResult = await client.query(
              'INSERT INTO public.tags (name, slug) VALUES ($1, $2) RETURNING id',
              [tagName, uniqueSlug]
            );
            tagId = newTagResult.rows[0].id;
          } else {
            tagId = tagResult.rows[0].id;
          }

          await client.query(
            'INSERT INTO public.question_tags (question_id, tag_id) VALUES ($1, $2)',
            [question.id, tagId]
          );
        }
      }

      await client.query('COMMIT');

      // Create mentions after successful question creation
      await createMentions(user.id, 'question', question.id, content);

      // ✅ Invalidate questions cache so new question appears immediately
      invalidateCache.questions();

      successResponse(res, { question }, 'Question created successfully', 201);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create question error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get question by ID
 * GET /api/questions/:id
 */
export const getQuestionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questionId = req.params.id;
    const currentUserId = req.user?.id || null;

    const result = await pool.query(`
      SELECT 
        q.id, q.title, q.content, q.images,
        COALESCE(q.views_count, 0) as views_count, 
        q.is_closed, q.created_at, q.updated_at,
        u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar,
        u.reputation_points as author_reputation, 
        COALESCE(u.is_verified, false) as author_is_verified,
        COALESCE(
          (SELECT COUNT(*) FROM public.votes v WHERE v.question_id = q.id AND v.vote_type = 'upvote'), 
          0
        ) as upvotes_count,
        COALESCE(
          (SELECT COUNT(*) FROM public.votes v WHERE v.question_id = q.id AND v.vote_type = 'downvote'), 
          0
        ) as downvotes_count,
        COUNT(DISTINCT a.id) as answers_count,
        CASE 
          WHEN $2::uuid IS NOT NULL THEN 
            (SELECT v.vote_type FROM public.votes v WHERE v.question_id = q.id AND v.user_id = $2)
          ELSE NULL 
        END as user_vote,
        CASE 
          WHEN $2::uuid IS NOT NULL THEN 
            EXISTS(SELECT 1 FROM public.bookmarks b WHERE b.question_id = q.id AND b.user_id = $2)
          ELSE FALSE 
        END as is_bookmarked
      FROM public.questions q
      LEFT JOIN public.users u ON q.author_id = u.id
      LEFT JOIN public.answers a ON q.id = a.question_id
      WHERE q.id = $1
      GROUP BY q.id, u.id
    `, [questionId, currentUserId]);

    if (result.rows.length === 0) {
      notFoundResponse(res, 'Question not found');
      return;
    }

    const question = result.rows[0];

    if (typeof question.images === 'string') {
      try {
        question.images = JSON.parse(question.images);
      } catch (error) {
        console.error('Failed to parse question images JSON:', error);
        question.images = [];
      }
    } else if (!question.images) {
      question.images = [];
    }

    // Get tags
    const tagsResult = await pool.query(`
      SELECT t.id, t.name, t.slug
      FROM public.tags t
      JOIN public.question_tags qt ON t.id = qt.tag_id
      WHERE qt.question_id = $1
    `, [questionId]);

    question.tags = tagsResult.rows;

    // Get answers
    const answersResult = await pool.query(`
      SELECT 
        a.id, a.content, a.is_accepted, a.created_at, a.updated_at,
        u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar,
        u.reputation_points as author_reputation, 
        COALESCE(u.is_verified, false) as author_is_verified,
        COALESCE(
          (SELECT COUNT(*) FROM public.votes v WHERE v.answer_id = a.id AND v.vote_type = 'upvote'), 
          0
        ) as upvotes_count,
        COALESCE(
          (SELECT COUNT(*) FROM public.votes v WHERE v.answer_id = a.id AND v.vote_type = 'downvote'), 
          0
        ) as downvotes_count,
        CASE 
          WHEN $2::uuid IS NOT NULL THEN 
            (SELECT v.vote_type FROM public.votes v WHERE v.answer_id = a.id AND v.user_id = $2)
          ELSE NULL 
        END as user_vote
      FROM public.answers a
      LEFT JOIN public.users u ON a.author_id = u.id
      WHERE a.question_id = $1
      ORDER BY a.is_accepted DESC, a.created_at ASC
    `, [questionId, currentUserId]);

    question.answers = answersResult.rows;

    // Get question comments
    const questionCommentsResult = await pool.query(`
      SELECT 
        c.id, c.content, c.created_at, c.updated_at,
        u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar,
        u.reputation_points as author_reputation, 
        COALESCE(u.is_verified, false) as author_is_verified
      FROM public.comments c
      LEFT JOIN public.users u ON c.author_id = u.id
      WHERE c.commentable_type = 'question' AND c.commentable_id = $1
      ORDER BY c.created_at ASC
    `, [questionId]);
    question.comments = questionCommentsResult.rows;

    // Get answer comments
    if (question.answers.length > 0) {
      const answerIds = question.answers.map((a: any) => a.id);
      const answerCommentsResult = await pool.query(`
        SELECT 
          c.id, c.content, c.commentable_id, c.created_at, c.updated_at,
          u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar,
          u.reputation_points as author_reputation, 
          COALESCE(u.is_verified, false) as author_is_verified
        FROM public.comments c
        LEFT JOIN public.users u ON c.author_id = u.id
        WHERE c.commentable_type = 'answer' AND c.commentable_id = ANY($1)
        ORDER BY c.created_at ASC
      `, [answerIds]);

      const commentsByAnswerId = answerCommentsResult.rows.reduce((acc: any, row: any) => {
        if (!acc[row.commentable_id]) acc[row.commentable_id] = [];
        acc[row.commentable_id].push(row);
        return acc;
      }, {});

      question.answers = question.answers.map((a: any) => ({
        ...a,
        comments: commentsByAnswerId[a.id] || []
      }));
    } else {
      question.answers = question.answers.map((a: any) => ({ ...a, comments: [] }));
    }

    successResponse(res, question);
  } catch (error) {
    console.error('Get question error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Update question
 * PUT /api/questions/:id
 */
export const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const questionId = req.params.id;
    const { title, content, tags } = req.body;

    // Check if question exists and user is author
    const questionResult = await pool.query(
      'SELECT author_id FROM public.questions WHERE id = $1',
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      notFoundResponse(res, 'Question not found');
      return;
    }

    const question = questionResult.rows[0];

    if (question.author_id !== user.id && user.role !== 'admin') {
      forbiddenResponse(res, 'Not authorized to update this question');
      return;
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update question
      const updateResult = await client.query(
        `UPDATE public.questions 
         SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3 
         RETURNING id, title, content, views_count, is_closed, created_at, updated_at`,
        [title, content, questionId]
      );

      // Handle tags if provided
      if (tags) {
        await client.query('DELETE FROM public.question_tags WHERE question_id = $1', [questionId]);

        for (const tagName of tags) {
          const tagResult = await client.query(
            'SELECT id FROM public.tags WHERE LOWER(name) = LOWER($1)',
            [tagName]
          );

          let tagId;
          if (tagResult.rows.length === 0) {
            const uniqueSlug = await generateUniqueSlug(tagName, 'tags');
            const newTagResult = await client.query(
              'INSERT INTO public.tags (name, slug) VALUES ($1, $2) RETURNING id',
              [tagName, uniqueSlug]
            );
            tagId = newTagResult.rows[0].id;
          } else {
            tagId = tagResult.rows[0].id;
          }

          await client.query(
            'INSERT INTO public.question_tags (question_id, tag_id) VALUES ($1, $2)',
            [questionId, tagId]
          );
        }
      }

      await client.query('COMMIT');

      // ✅ Invalidate cache
      invalidateCache.allQuestions();

      successResponse(res, { question: updateResult.rows[0] }, 'Question updated successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update question error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Delete question
 * DELETE /api/questions/:id
 */
export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const questionId = req.params.id;

    const questionResult = await pool.query(
      'SELECT author_id FROM public.questions WHERE id = $1',
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      notFoundResponse(res, 'Question not found');
      return;
    }

    const question = questionResult.rows[0];

    if (question.author_id !== user.id && user.role !== 'admin') {
      forbiddenResponse(res, 'Not authorized to delete this question');
      return;
    }

    // Clean up related notifications before deleting question
    await pool.query(
      `DELETE FROM public.notifications 
       WHERE link LIKE $1`,
      [`/questions/${questionId}%`]
    );

    await pool.query('DELETE FROM public.questions WHERE id = $1', [questionId]);

    // ✅ Invalidate cache
    invalidateCache.allQuestions();

    successResponse(res, null, 'Question deleted successfully');
  } catch (error) {
    console.error('Delete question error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Increment question view count
 * POST /api/questions/:id/view
 */
export const incrementViewCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const questionId = req.params.id;

    await pool.query(
      'UPDATE public.questions SET views_count = COALESCE(views_count, 0) + 1 WHERE id = $1',
      [questionId]
    );

    successResponse(res, null, 'View count incremented');
  } catch (error) {
    console.error('Increment view count error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Close/reopen question
 * POST /api/questions/:id/close
 */
export const toggleCloseQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const questionId = req.params.id;

    const questionResult = await pool.query(
      'SELECT author_id, is_closed FROM public.questions WHERE id = $1',
      [questionId]
    );

    if (questionResult.rows.length === 0) {
      notFoundResponse(res, 'Question not found');
      return;
    }

    const question = questionResult.rows[0];

    if (question.author_id !== user.id && user.role !== 'admin') {
      forbiddenResponse(res, 'Not authorized to close this question');
      return;
    }

    const newClosedState = !question.is_closed;

    await pool.query(
      'UPDATE public.questions SET is_closed = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newClosedState, questionId]
    );

    successResponse(res, { is_closed: newClosedState }, newClosedState ? 'Question closed' : 'Question reopened');
  } catch (error) {
    console.error('Toggle close question error:', error);
    errorResponse(res, 'Server error');
  }
};
