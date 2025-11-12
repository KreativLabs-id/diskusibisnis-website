import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT id, display_name, avatar_url, bio, reputation_points, created_at 
             FROM public.users WHERE id = $1 AND is_banned = FALSE`,
            [id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { displayName, bio, avatarUrl } = req.body;
        const userId = req.user?.id;

        if (id !== userId) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        const result = await pool.query(
            `UPDATE public.users SET display_name = $1, bio = $2, avatar_url = $3, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $4 RETURNING id, display_name, avatar_url, bio, reputation_points`,
            [displayName, bio, avatarUrl, id]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getUserQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT q.*, COUNT(a.id) as answers_count 
             FROM questions q 
             LEFT JOIN answers a ON q.id = a.question_id 
             WHERE q.author_id = $1 
             GROUP BY q.id 
             ORDER BY q.created_at DESC`,
            [id]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getUserAnswers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT a.*, q.title as question_title, q.id as question_id 
             FROM answers a 
             JOIN questions q ON a.question_id = q.id 
             WHERE a.author_id = $1 
             ORDER BY a.created_at DESC`,
            [id]
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
