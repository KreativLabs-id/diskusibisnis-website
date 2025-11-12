import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// ============================================
// GET ALL QUESTIONS
// ============================================
export const getAllQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            sort = 'newest', // newest, popular, unanswered
            tag,
            search,
            page = 1,
            limit = 20
        } = req.query;

        const offset = (Number(page) - 1) * Number(limit);
        
        let query = `
            SELECT 
                q.*,
                u.display_name as author_name,
                u.avatar_url as author_avatar,
                u.reputation_points as author_reputation,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', t.id,
                            'name', t.name,
                            'slug', t.slug
                        )
                    ) FILTER (WHERE t.id IS NOT NULL), '[]'
                ) as tags,
                COUNT(DISTINCT a.id) as answers_count
            FROM questions q
            LEFT JOIN users u ON q.author_id = u.id
            LEFT JOIN question_tags qt ON q.id = qt.question_id
            LEFT JOIN tags t ON qt.tag_id = t.id
            LEFT JOIN answers a ON q.id = a.question_id
            WHERE 1=1
        `;

        const queryParams: any[] = [];
        let paramIndex = 1;

        // Filter by tag
        if (tag) {
            query += ` AND t.slug = $${paramIndex}`;
            queryParams.push(tag);
            paramIndex++;
        }

        // Search
        if (search) {
            query += ` AND (q.title ILIKE $${paramIndex} OR q.content ILIKE $${paramIndex})`;
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        query += ` GROUP BY q.id, u.display_name, u.avatar_url, u.reputation_points`;

        // Sorting
        switch (sort) {
            case 'popular':
                query += ` ORDER BY q.upvotes_count DESC, q.views_count DESC`;
                break;
            case 'unanswered':
                query += ` HAVING COUNT(a.id) = 0 ORDER BY q.created_at DESC`;
                break;
            default: // newest
                query += ` ORDER BY q.created_at DESC`;
        }

        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        queryParams.push(Number(limit), offset);

        const result = await pool.query(query, queryParams);

        // Get total count
        const countQuery = `SELECT COUNT(DISTINCT q.id) as total FROM questions q`;
        const countResult = await pool.query(countQuery);
        const total = parseInt(countResult.rows[0]?.total || '0');

        res.json({
            success: true,
            data: {
                questions: result.rows,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            }
        });
    } catch (error) {
        console.error('Get all questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ============================================
// GET QUESTION BY ID
// ============================================
export const getQuestionById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Increment view count
        await pool.query(
            'UPDATE questions SET views_count = views_count + 1 WHERE id = $1',
            [id]
        );

        // Get question details
        const questionResult = await pool.query(
            `SELECT 
                q.*,
                u.id as author_id,
                u.display_name as author_name,
                u.avatar_url as author_avatar,
                u.reputation_points as author_reputation,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', t.id,
                            'name', t.name,
                            'slug', t.slug
                        )
                    ) FILTER (WHERE t.id IS NOT NULL), '[]'
                ) as tags
            FROM questions q
            LEFT JOIN users u ON q.author_id = u.id
            LEFT JOIN question_tags qt ON q.id = qt.question_id
            LEFT JOIN tags t ON qt.tag_id = t.id
            WHERE q.id = $1
            GROUP BY q.id, u.id, u.display_name, u.avatar_url, u.reputation_points`,
            [id]
        );

        if (questionResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Question not found'
            });
            return;
        }

        // Get answers with comments
        const answersResult = await pool.query(
            `SELECT 
                a.*,
                u.id as author_id,
                u.display_name as author_name,
                u.avatar_url as author_avatar,
                u.reputation_points as author_reputation,
                COALESCE(
                    json_agg(
                        DISTINCT jsonb_build_object(
                            'id', c.id,
                            'content', c.content,
                            'authorId', cu.id,
                            'authorName', cu.display_name,
                            'authorAvatar', cu.avatar_url,
                            'createdAt', c.created_at
                        ) ORDER BY c.created_at ASC
                    ) FILTER (WHERE c.id IS NOT NULL), '[]'
                ) as comments
            FROM answers a
            LEFT JOIN users u ON a.author_id = u.id
            LEFT JOIN comments c ON c.commentable_type = 'answer' AND c.commentable_id = a.id
            LEFT JOIN users cu ON c.author_id = cu.id
            WHERE a.question_id = $1
            GROUP BY a.id, u.id, u.display_name, u.avatar_url, u.reputation_points
            ORDER BY a.is_accepted DESC, a.upvotes_count DESC, a.created_at ASC`,
            [id]
        );

        // Get question comments
        const commentsResult = await pool.query(
            `SELECT 
                c.*,
                u.id as author_id,
                u.display_name as author_name,
                u.avatar_url as author_avatar
            FROM comments c
            LEFT JOIN users u ON c.author_id = u.id
            WHERE c.commentable_type = 'question' AND c.commentable_id = $1
            ORDER BY c.created_at ASC`,
            [id]
        );

        const question = questionResult.rows[0];
        question.answers = answersResult.rows;
        question.comments = commentsResult.rows;

        res.json({
            success: true,
            data: question
        });
    } catch (error) {
        console.error('Get question by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ============================================
// CREATE QUESTION
// ============================================
export const createQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, content, tags } = req.body;
        const userId = req.user?.id;

        if (!title || !content || !tags || tags.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Title, content, and at least one tag are required'
            });
            return;
        }

        // Create question
        const questionResult = await pool.query(
            `INSERT INTO questions (title, content, author_id) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [title, content, userId]
        );

        const question = questionResult.rows[0];

        // Add tags - convert tag names to tag IDs
        for (const tagName of tags) {
            // First, try to find existing tag by name or slug
            let tagResult = await pool.query(
                'SELECT id FROM tags WHERE name = $1 OR slug = $1',
                [tagName.toLowerCase()]
            );

            let tagId;
            if (tagResult.rows.length > 0) {
                // Tag exists, use its ID
                tagId = tagResult.rows[0].id;
                
                // Increment usage count
                await pool.query(
                    'UPDATE tags SET usage_count = usage_count + 1 WHERE id = $1',
                    [tagId]
                );
            } else {
                // Tag doesn't exist, create it
                const newTagResult = await pool.query(
                    `INSERT INTO tags (name, slug, description, usage_count, created_by) 
                     VALUES ($1, $2, $3, 1, $4) 
                     RETURNING id`,
                    [tagName.toLowerCase(), tagName.toLowerCase(), `Tag untuk ${tagName}`, userId]
                );
                tagId = newTagResult.rows[0].id;
            }

            // Link tag to question
            await pool.query(
                'INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2)',
                [question.id, tagId]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Question created successfully',
            data: question
        });
    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ============================================
// UPDATE QUESTION
// ============================================
export const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, content, tags } = req.body;
        const userId = req.user?.id;

        // Check if user is the author
        const checkResult = await pool.query(
            'SELECT author_id FROM questions WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Question not found'
            });
            return;
        }

        if (checkResult.rows[0].author_id !== userId && req.user?.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Not authorized to update this question'
            });
            return;
        }

        // Update question
        const updateResult = await pool.query(
            `UPDATE questions 
             SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3 
             RETURNING *`,
            [title, content, id]
        );

        // Update tags if provided
        if (tags) {
            await pool.query('DELETE FROM question_tags WHERE question_id = $1', [id]);
            for (const tagId of tags) {
                await pool.query(
                    'INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2)',
                    [id, tagId]
                );
            }
        }

        res.json({
            success: true,
            message: 'Question updated successfully',
            data: updateResult.rows[0]
        });
    } catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ============================================
// DELETE QUESTION
// ============================================
export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Check if user is the author or admin
        const checkResult = await pool.query(
            'SELECT author_id FROM questions WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Question not found'
            });
            return;
        }

        if (checkResult.rows[0].author_id !== userId && req.user?.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Not authorized to delete this question'
            });
            return;
        }

        // Delete question (cascade will delete related records)
        await pool.query('DELETE FROM questions WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// ============================================
// CLOSE QUESTION
// ============================================
export const closeQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        // Check if user is the author or admin
        const checkResult = await pool.query(
            'SELECT author_id FROM questions WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: 'Question not found'
            });
            return;
        }

        if (checkResult.rows[0].author_id !== userId && req.user?.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Not authorized to close this question'
            });
            return;
        }

        // Close question
        await pool.query(
            'UPDATE questions SET is_closed = TRUE WHERE id = $1',
            [id]
        );

        res.json({
            success: true,
            message: 'Question closed successfully'
        });
    } catch (error) {
        console.error('Close question error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
