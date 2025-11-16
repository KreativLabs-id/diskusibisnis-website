import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response.utils';

/**
 * Get all tags
 * GET /api/tags
 */
export const getTags = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const search = (req.query.search as string) || '';
    const limit = parseInt(req.query.limit as string) || 50;

    let query = `
      SELECT 
        t.id, t.name, t.slug, t.description,
        COUNT(qt.question_id) as usage_count
      FROM public.tags t
      LEFT JOIN public.question_tags qt ON t.id = qt.tag_id
    `;

    const queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` WHERE t.name ILIKE $${paramIndex}`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY t.id ORDER BY usage_count DESC, t.name ASC LIMIT $${paramIndex}`;
    queryParams.push(limit);

    const result = await pool.query(query, queryParams);

    successResponse(res, { tags: result.rows });
  } catch (error) {
    console.error('Get tags error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get tag by slug
 * GET /api/tags/:slug
 */
export const getTagBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug;

    const result = await pool.query(`
      SELECT 
        t.id, t.name, t.slug, t.description,
        COUNT(qt.question_id) as usage_count
      FROM public.tags t
      LEFT JOIN public.question_tags qt ON t.id = qt.tag_id
      WHERE t.slug = $1
      GROUP BY t.id
    `, [slug]);

    if (result.rows.length === 0) {
      notFoundResponse(res, 'Tag not found');
      return;
    }

    successResponse(res, { tag: result.rows[0] });
  } catch (error) {
    console.error('Get tag error:', error);
    errorResponse(res, 'Server error');
  }
};
