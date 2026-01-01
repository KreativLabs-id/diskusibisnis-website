import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';

// ============================================
// PUBLIC ENDPOINTS (for mobile/web apps)
// ============================================

/**
 * Get active popup for display
 * Returns the highest priority active popup that user hasn't seen
 * (if show_once_per_user is true)
 */
export const getActivePopup = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as any).userId; // May be null for guests
        const deviceId = req.headers['x-device-id'] as string; // For guests

        // Simplified query - just get active popups
        const query = `
      SELECT p.*
      FROM promo_popups p
      WHERE p.is_active = TRUE
        AND p.start_date <= NOW()
        AND (p.end_date IS NULL OR p.end_date >= NOW())
      ORDER BY p.priority DESC, p.created_at DESC
    `;

        const result = await pool.query(query);

        if (result.rows.length === 0) {
            res.json({
                status: 'success',
                data: { popup: null }
            });
            return;
        }

        // Filter out popups user has already seen (if show_once_per_user is true)
        let popup = null;

        if (userId || deviceId) {
            const viewQuery = `
        SELECT popup_id FROM promo_popup_views 
        WHERE user_id = $1::uuid OR device_id = $2::text
      `;
            const viewedResult = await pool.query(viewQuery, [userId || null, deviceId || null]);
            const viewedIds = new Set(viewedResult.rows.map((r: any) => r.popup_id));

            // Find first popup that user hasn't seen (or show_once_per_user is false)
            popup = result.rows.find((p: any) =>
                !p.show_once_per_user || !viewedIds.has(p.id)
            ) || null;
        } else {
            // No user/device ID, just return the first popup
            popup = result.rows[0];
        }

        res.json({
            status: 'success',
            data: { popup }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Record that user has viewed/dismissed a popup
 */
export const recordPopupView = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { popupId } = req.params;
        const { clicked } = req.body;
        const userId = (req as any).userId;
        const deviceId = req.headers['x-device-id'] as string;

        if (!userId && !deviceId) {
            res.status(400).json({
                status: 'error',
                message: 'User ID or Device ID required'
            });
            return;
        }

        // Check if popup exists
        const popupCheck = await pool.query(
            'SELECT id FROM promo_popups WHERE id = $1',
            [popupId]
        );

        if (popupCheck.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Popup not found'
            });
            return;
        }

        // Insert or update view record
        const query = `
      INSERT INTO promo_popup_views (popup_id, user_id, device_id, clicked)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (popup_id, user_id) 
      DO UPDATE SET 
        clicked = COALESCE(promo_popup_views.clicked, $4),
        viewed_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

        await pool.query(query, [
            popupId,
            userId || null,
            deviceId || null,
            clicked || false
        ]);

        res.json({
            status: 'success',
            message: 'Popup view recorded'
        });
    } catch (err) {
        next(err);
    }
};

// ============================================
// ADMIN ENDPOINTS
// ============================================

/**
 * Get all popups (admin)
 */
export const getAllPopups = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let whereClause = '';
        const params: any[] = [];

        if (status === 'active') {
            whereClause = 'WHERE p.is_active = TRUE AND p.start_date <= NOW() AND (p.end_date IS NULL OR p.end_date >= NOW())';
        } else if (status === 'scheduled') {
            whereClause = 'WHERE p.is_active = TRUE AND p.start_date > NOW()';
        } else if (status === 'expired') {
            whereClause = 'WHERE p.end_date IS NOT NULL AND p.end_date < NOW()';
        } else if (status === 'inactive') {
            whereClause = 'WHERE p.is_active = FALSE';
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM promo_popups p ${whereClause}`;
        const countResult = await pool.query(countQuery, params);
        const totalItems = parseInt(countResult.rows[0].count);

        // Get popups with stats
        const query = `
      SELECT 
        p.*,
        u.display_name as created_by_name,
        (SELECT COUNT(*) FROM promo_popup_views WHERE popup_id = p.id) as view_count,
        (SELECT COUNT(*) FROM promo_popup_views WHERE popup_id = p.id AND clicked = TRUE) as click_count,
        CASE 
          WHEN p.is_active = FALSE THEN 'inactive'
          WHEN p.start_date > NOW() THEN 'scheduled'
          WHEN p.end_date IS NOT NULL AND p.end_date < NOW() THEN 'expired'
          ELSE 'active'
        END as status
      FROM promo_popups p
      LEFT JOIN users u ON p.created_by = u.id
      ${whereClause}
      ORDER BY p.priority DESC, p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

        params.push(Number(limit), offset);
        const result = await pool.query(query, params);

        res.json({
            status: 'success',
            data: {
                popups: result.rows,
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
 * Get single popup (admin)
 */
export const getPopupById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const query = `
      SELECT 
        p.*,
        u.display_name as created_by_name,
        (SELECT COUNT(*) FROM promo_popup_views WHERE popup_id = p.id) as view_count,
        (SELECT COUNT(*) FROM promo_popup_views WHERE popup_id = p.id AND clicked = TRUE) as click_count
      FROM promo_popups p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = $1
    `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Popup not found'
            });
            return;
        }

        res.json({
            status: 'success',
            data: { popup: result.rows[0] }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Create new popup (admin)
 */
export const createPopup = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const {
            title,
            imageUrl,
            linkUrl,
            linkType = 'external',
            description,
            startDate,
            endDate,
            isActive = true,
            priority = 0,
            targetAudience = 'all',
            showOncePerUser = false
        } = req.body;

        if (!title || !imageUrl) {
            res.status(400).json({
                status: 'error',
                message: 'Title and image URL are required'
            });
            return;
        }

        const query = `
      INSERT INTO promo_popups (
        title, image_url, link_url, link_type, description,
        start_date, end_date, is_active, priority,
        target_audience, show_once_per_user, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

        const result = await pool.query(query, [
            title,
            imageUrl,
            linkUrl || null,
            linkType,
            description || null,
            startDate || new Date(),
            endDate || null,
            isActive,
            priority,
            targetAudience,
            showOncePerUser,
            userId
        ]);

        res.status(201).json({
            status: 'success',
            message: 'Popup created successfully',
            data: { popup: result.rows[0] }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update popup (admin)
 */
export const updatePopup = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            title,
            imageUrl,
            linkUrl,
            linkType,
            description,
            startDate,
            endDate,
            isActive,
            priority,
            targetAudience,
            showOncePerUser
        } = req.body;

        // Check if popup exists
        const existing = await pool.query(
            'SELECT id FROM promo_popups WHERE id = $1',
            [id]
        );

        if (existing.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Popup not found'
            });
            return;
        }

        const query = `
      UPDATE promo_popups SET
        title = COALESCE($1, title),
        image_url = COALESCE($2, image_url),
        link_url = COALESCE($3, link_url),
        link_type = COALESCE($4, link_type),
        description = COALESCE($5, description),
        start_date = COALESCE($6, start_date),
        end_date = $7,
        is_active = COALESCE($8, is_active),
        priority = COALESCE($9, priority),
        target_audience = COALESCE($10, target_audience),
        show_once_per_user = COALESCE($11, show_once_per_user)
      WHERE id = $12
      RETURNING *
    `;

        const result = await pool.query(query, [
            title,
            imageUrl,
            linkUrl,
            linkType,
            description,
            startDate,
            endDate,
            isActive,
            priority,
            targetAudience,
            showOncePerUser,
            id
        ]);

        res.json({
            status: 'success',
            message: 'Popup updated successfully',
            data: { popup: result.rows[0] }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete popup (admin)
 */
export const deletePopup = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM promo_popups WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Popup not found'
            });
            return;
        }

        res.json({
            status: 'success',
            message: 'Popup deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Toggle popup active status (admin)
 */
export const togglePopupStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE promo_popups 
       SET is_active = NOT is_active 
       WHERE id = $1 
       RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Popup not found'
            });
            return;
        }

        res.json({
            status: 'success',
            message: `Popup ${result.rows[0].is_active ? 'activated' : 'deactivated'}`,
            data: { popup: result.rows[0] }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get popup statistics (admin)
 */
export const getPopupStats = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;

        // Get popup with detailed stats
        const query = `
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM promo_popup_views WHERE popup_id = p.id) as total_views,
        (SELECT COUNT(*) FROM promo_popup_views WHERE popup_id = p.id AND clicked = TRUE) as total_clicks,
        (SELECT COUNT(DISTINCT user_id) FROM promo_popup_views WHERE popup_id = p.id AND user_id IS NOT NULL) as unique_user_views,
        (SELECT COUNT(DISTINCT device_id) FROM promo_popup_views WHERE popup_id = p.id AND device_id IS NOT NULL) as unique_device_views
      FROM promo_popups p
      WHERE p.id = $1
    `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            res.status(404).json({
                status: 'error',
                message: 'Popup not found'
            });
            return;
        }

        const popup = result.rows[0];
        const ctr = popup.total_views > 0
            ? ((popup.total_clicks / popup.total_views) * 100).toFixed(2)
            : '0.00';

        res.json({
            status: 'success',
            data: {
                popup: {
                    ...popup,
                    click_through_rate: `${ctr}%`
                }
            }
        });
    } catch (err) {
        next(err);
    }
};
