import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

// ============================================
// PUBLIC ENDPOINTS (for mobile/web apps)
// ============================================

/**
 * Get active announcements for display
 * Returns all active announcements that user hasn't dismissed
 */
export const getActiveAnnouncements = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const deviceId = req.headers['x-device-id'] as string;
        const showOn = req.query.showOn as string || 'all';

        // Simplified query - just get active announcements
        const query = `
      SELECT a.*
      FROM announcements a
      WHERE a.is_active = TRUE
        AND a.start_date <= NOW()
        AND (a.end_date IS NULL OR a.end_date >= NOW())
        AND (a.show_on = 'all' OR a.show_on = $1)
      ORDER BY a.priority DESC, a.created_at DESC
    `;

        const result = await pool.query(query, [showOn]);

        // Filter out dismissed announcements in JavaScript
        let announcements = result.rows;

        if (userId || deviceId) {
            const dismissQuery = `
        SELECT announcement_id FROM announcement_dismissals 
        WHERE user_id = $1::uuid OR device_id = $2::text
      `;
            const dismissedResult = await pool.query(dismissQuery, [userId || null, deviceId || null]);
            const dismissedIds = new Set(dismissedResult.rows.map((r: any) => r.announcement_id));

            announcements = announcements.filter((a: any) =>
                !a.is_dismissible || !dismissedIds.has(a.id)
            );
        }

        res.json({
            status: 'success',
            data: { announcements }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Dismiss an announcement
 */
export const dismissAnnouncement = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { announcementId } = req.params;
        const userId = (req as any).user?.id;
        const deviceId = req.headers['x-device-id'] as string;

        if (!userId && !deviceId) {
            res.status(400).json({
                status: 'error',
                message: 'User ID or Device ID required'
            });
            return;
        }

        // Check if announcement exists and is dismissible
        const announcementCheck = await pool.query(
            'SELECT id, is_dismissible FROM announcements WHERE id = $1',
            [announcementId]
        );

        if (announcementCheck.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Announcement not found'
            });
            return;
        }

        if (!announcementCheck.rows[0].is_dismissible) {
            res.status(400).json({
                status: 'error',
                message: 'This announcement cannot be dismissed'
            });
            return;
        }

        // Insert dismissal record
        const query = `
      INSERT INTO announcement_dismissals (announcement_id, user_id, device_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (announcement_id, user_id) DO NOTHING
      RETURNING *
    `;

        await pool.query(query, [
            announcementId,
            userId || null,
            deviceId || null
        ]);

        res.json({
            status: 'success',
            message: 'Announcement dismissed'
        });
    } catch (err) {
        next(err);
    }
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * Get all announcements (admin)
 */
export const getAllAnnouncements = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { page = 1, limit = 20, status, type } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let whereConditions: string[] = [];
        const params: any[] = [];

        if (status === 'active') {
            whereConditions.push('a.is_active = TRUE AND a.start_date <= NOW() AND (a.end_date IS NULL OR a.end_date >= NOW())');
        } else if (status === 'scheduled') {
            whereConditions.push('a.is_active = TRUE AND a.start_date > NOW()');
        } else if (status === 'expired') {
            whereConditions.push('a.end_date IS NOT NULL AND a.end_date < NOW()');
        } else if (status === 'inactive') {
            whereConditions.push('a.is_active = FALSE');
        }

        if (type) {
            params.push(type);
            whereConditions.push(`a.type = $${params.length}`);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM announcements a ${whereClause}`;
        const countResult = await pool.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count);

        // Get announcements
        const query = `
      SELECT 
        a.*,
        u.display_name as created_by_name,
        (SELECT COUNT(*) FROM announcement_dismissals WHERE announcement_id = a.id) as dismiss_count,
        CASE 
          WHEN a.is_active = FALSE THEN 'inactive'
          WHEN a.start_date > NOW() THEN 'scheduled'
          WHEN a.end_date IS NOT NULL AND a.end_date < NOW() THEN 'expired'
          ELSE 'active'
        END as status
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      ${whereClause}
      ORDER BY a.priority DESC, a.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

        params.push(Number(limit), offset);
        const result = await pool.query(query, params);

        res.json({
            status: 'success',
            data: {
                announcements: result.rows,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    totalItems,
                    totalPages: Math.ceil(totalItems / Number(limit))
                }
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get single announcement (admin)
 */
export const getAnnouncementById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const query = `
      SELECT 
        a.*,
        u.display_name as created_by_name,
        (SELECT COUNT(*) FROM announcement_dismissals WHERE announcement_id = a.id) as dismiss_count
      FROM announcements a
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = $1
    `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Announcement not found'
            });
            return;
        }

        res.json({
            status: 'success',
            data: { announcement: result.rows[0] }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Create new announcement (admin)
 */
export const createAnnouncement = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        const {
            title,
            message,
            type = 'info',
            linkUrl,
            linkText,
            startDate,
            endDate,
            isActive = true,
            isDismissible = true,
            priority = 0,
            showOn = 'all'
        } = req.body;

        if (!title || !message) {
            res.status(400).json({
                status: 'error',
                message: 'Title and message are required'
            });
            return;
        }

        const query = `
      INSERT INTO announcements (
        title, message, type, link_url, link_text,
        start_date, end_date, is_active, is_dismissible,
        priority, show_on, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

        const result = await pool.query(query, [
            title,
            message,
            type,
            linkUrl || null,
            linkText || null,
            startDate || new Date(),
            endDate || null,
            isActive,
            isDismissible,
            priority,
            showOn,
            userId
        ]);

        res.status(201).json({
            status: 'success',
            message: 'Announcement created successfully',
            data: { announcement: result.rows[0] }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update announcement (admin)
 */
export const updateAnnouncement = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            title,
            message,
            type,
            linkUrl,
            linkText,
            startDate,
            endDate,
            isActive,
            isDismissible,
            priority,
            showOn
        } = req.body;

        // Check if announcement exists
        const existing = await pool.query(
            'SELECT id FROM announcements WHERE id = $1',
            [id]
        );

        if (existing.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Announcement not found'
            });
            return;
        }

        const query = `
      UPDATE announcements SET
        title = COALESCE($1, title),
        message = COALESCE($2, message),
        type = COALESCE($3, type),
        link_url = COALESCE($4, link_url),
        link_text = COALESCE($5, link_text),
        start_date = COALESCE($6, start_date),
        end_date = $7,
        is_active = COALESCE($8, is_active),
        is_dismissible = COALESCE($9, is_dismissible),
        priority = COALESCE($10, priority),
        show_on = COALESCE($11, show_on)
      WHERE id = $12
      RETURNING *
    `;

        const result = await pool.query(query, [
            title,
            message,
            type,
            linkUrl,
            linkText,
            startDate,
            endDate,
            isActive,
            isDismissible,
            priority,
            showOn,
            id
        ]);

        res.json({
            status: 'success',
            message: 'Announcement updated successfully',
            data: { announcement: result.rows[0] }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete announcement (admin)
 */
export const deleteAnnouncement = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM announcements WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Announcement not found'
            });
            return;
        }

        res.json({
            status: 'success',
            message: 'Announcement deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Toggle announcement active status (admin)
 */
export const toggleAnnouncementStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE announcements 
       SET is_active = NOT is_active 
       WHERE id = $1 
       RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Announcement not found'
            });
            return;
        }

        res.json({
            status: 'success',
            message: `Announcement ${result.rows[0].is_active ? 'activated' : 'deactivated'}`,
            data: { announcement: result.rows[0] }
        });
    } catch (err) {
        next(err);
    }
};
