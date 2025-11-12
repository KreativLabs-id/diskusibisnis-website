import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { content, commentableType, commentableId } = req.body;
        const userId = req.user?.id;

        const result = await pool.query(
            `INSERT INTO comments (content, author_id, commentable_type, commentable_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [content, userId, commentableType, commentableId]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user?.id;

        const checkResult = await pool.query('SELECT author_id FROM comments WHERE id = $1', [id]);
        if (checkResult.rows.length === 0 || checkResult.rows[0].author_id !== userId) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        const result = await pool.query(
            'UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [content, id]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const checkResult = await pool.query('SELECT author_id FROM comments WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) {
            res.status(404).json({ success: false, message: 'Comment not found' });
            return;
        }

        if (checkResult.rows[0].author_id !== userId && req.user?.role !== 'admin') {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        await pool.query('DELETE FROM comments WHERE id = $1', [id]);
        res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
