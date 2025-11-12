import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllTags = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query(
            'SELECT * FROM tags ORDER BY usage_count DESC, name ASC'
        );

        res.json({ success: true, data: result.rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getTagBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;

        const tagResult = await pool.query('SELECT * FROM tags WHERE slug = $1', [slug]);
        
        if (tagResult.rows.length === 0) {
            res.status(404).json({ success: false, message: 'Tag not found' });
            return;
        }

        const questionsResult = await pool.query(
            `SELECT q.* FROM questions q 
             JOIN question_tags qt ON q.id = qt.question_id 
             WHERE qt.tag_id = $1 
             ORDER BY q.created_at DESC`,
            [tagResult.rows[0].id]
        );

        res.json({ 
            success: true, 
            data: { 
                tag: tagResult.rows[0], 
                questions: questionsResult.rows 
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const createTag = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, slug, description } = req.body;
        const userId = req.user?.id;

        const result = await pool.query(
            'INSERT INTO tags (name, slug, description, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, slug, description, userId]
        );

        res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateTag = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, slug, description } = req.body;

        const result = await pool.query(
            'UPDATE tags SET name = $1, slug = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
            [name, slug, description, id]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteTag = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM tags WHERE id = $1', [id]);
        res.json({ success: true, message: 'Tag deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
