import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT id, email, display_name, role, reputation_points, is_banned, created_at FROM public.users ORDER BY created_at DESC'
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const banUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE public.users SET is_banned = TRUE WHERE id = $1', [id]);
        res.json({ success: true, message: 'User banned successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const unbanUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE public.users SET is_banned = FALSE WHERE id = $1', [id]);
        res.json({ success: true, message: 'User unbanned successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM public.users WHERE id = $1', [id]);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getAllQuestionsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            `SELECT q.*, u.display_name as author_name FROM public.questions q 
             LEFT JOIN public.users u ON q.author_id = u.id 
             ORDER BY q.created_at DESC`
        );
        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteQuestionAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM questions WHERE id = $1', [id]);
        res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteAnswerAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM answers WHERE id = $1', [id]);
        res.json({ success: true, message: 'Answer deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteCommentAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM comments WHERE id = $1', [id]);
        res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const usersCount = await pool.query('SELECT COUNT(*) FROM users');
        const questionsCount = await pool.query('SELECT COUNT(*) FROM questions');
        const answersCount = await pool.query('SELECT COUNT(*) FROM answers');
        const tagsCount = await pool.query('SELECT COUNT(*) FROM tags');

        res.json({
            success: true,
            data: {
                users: parseInt(usersCount.rows[0].count),
                questions: parseInt(questionsCount.rows[0].count),
                answers: parseInt(answersCount.rows[0].count),
                tags: parseInt(tagsCount.rows[0].count)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
