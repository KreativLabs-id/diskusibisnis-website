import { Router, Response } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notifications.controller';
import { requireAuth, authenticateToken } from '../middlewares/auth.middleware';
import { AuthRequest } from '../types';
import pool from '../config/database';
import { successResponse, errorResponse } from '../utils/response.utils';

const router = Router();

// Get user notifications
router.get('/', requireAuth, getNotifications);

// Mark notification as read
router.post('/:id/read', requireAuth, markNotificationAsRead);

// Mark all notifications as read
router.post('/read-all', requireAuth, markAllNotificationsAsRead);

// Register FCM token for push notifications
router.post('/register-token', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      errorResponse(res, 'FCM token is required', 400);
      return;
    }

    // Update user's FCM token
    await pool.query(
      'UPDATE public.users SET fcm_token = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [fcmToken, userId]
    );

    successResponse(res, null, 'FCM token registered successfully');
  } catch (error) {
    console.error('Register FCM token error:', error);
    errorResponse(res, 'Failed to register FCM token');
  }
});

// Remove FCM token (on logout)
router.delete('/remove-token', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    await pool.query(
      'UPDATE public.users SET fcm_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    successResponse(res, null, 'FCM token removed successfully');
  } catch (error) {
    console.error('Remove FCM token error:', error);
    errorResponse(res, 'Failed to remove FCM token');
  }
});

// TEST ENDPOINT: Send test notification to yourself
router.post('/test-notification', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    // Get user's FCM token
    const result = await pool.query(
      'SELECT fcm_token, display_name FROM public.users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].fcm_token) {
      errorResponse(res, 'No FCM token found. Make sure you allowed notifications.', 404);
      return;
    }

    const { fcm_token, display_name } = result.rows[0];

    // Import firebase service
    const { sendNotificationToDevice } = await import('../services/firebase.service');

    // Send test notification
    await sendNotificationToDevice(
      fcm_token,
      {
        title: '🎉 Test Notification',
        body: `Halo ${display_name}! Notifikasi push sudah berfungsi!`,
      },
      {
        type: 'test',
        link: '/',
      }
    );

    successResponse(res, null, 'Test notification sent! Check your browser.');
  } catch (error) {
    console.error('Test notification error:', error);
    errorResponse(res, 'Failed to send test notification');
  }
});

export default router;
