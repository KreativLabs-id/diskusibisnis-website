import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { successResponse, errorResponse, forbiddenResponse } from '../utils/response.utils';

/**
 * Get user notifications
 * GET /api/notifications
 */
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT 
        id, type, title, message, link, is_read, created_at
      FROM public.notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [user.id, limit, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM public.notifications WHERE user_id = $1',
      [user.id]
    );

    const unreadCount = await pool.query(
      'SELECT COUNT(*) as unread FROM public.notifications WHERE user_id = $1 AND is_read = false',
      [user.id]
    );

    const total = parseInt(countResult.rows[0].total);

    successResponse(res, {
      notifications: result.rows,
      unreadCount: parseInt(unreadCount.rows[0].unread),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Mark notification as read
 * POST /api/notifications/:id/read
 */
export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const notificationId = req.params.id;

    const result = await pool.query(
      'UPDATE public.notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notificationId, user.id]
    );

    if (result.rowCount === 0) {
      errorResponse(res, 'Notification not found', 404);
      return;
    }

    successResponse(res, null, 'Notification marked as read');
  } catch (error) {
    console.error('Mark notification as read error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Mark all notifications as read
 * POST /api/notifications/read-all
 */
export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    await pool.query(
      'UPDATE public.notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [user.id]
    );

    successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    errorResponse(res, 'Server error');
  }
};
