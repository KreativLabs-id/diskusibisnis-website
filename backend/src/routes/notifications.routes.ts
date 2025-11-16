import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../controllers/notifications.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Get user notifications
router.get('/', requireAuth, getNotifications);

// Mark notification as read
router.post('/:id/read', requireAuth, markNotificationAsRead);

// Mark all notifications as read
router.post('/read-all', requireAuth, markAllNotificationsAsRead);

export default router;
