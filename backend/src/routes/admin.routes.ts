import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAdminStats,
  getAllUsers,
  updateUser,
  deleteUser,
  banUser,
  unbanUser,
  verifyUser,
  unverifyUser,
  sendNotificationToUser,
  broadcastNotification,
  getAllQuestions,
  updateQuestion,
  deleteQuestion,
  getAllCommunities,
  banCommunity,
  unbanCommunity
} from '../controllers/admin.controller';
import { validate } from '../utils/validator.utils';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(requireAuth, requireAdmin);

// Admin statistics
router.get('/stats', getAdminStats);

// User management
router.get('/users', getAllUsers);
router.put(
  '/users/:id',
  [
    body('displayName').optional().isString(),
    body('role').optional().isIn(['member', 'admin']),
    body('reputationPoints').optional().isInt(),
    validate
  ],
  updateUser
);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/ban', banUser);
router.post('/users/:id/unban', unbanUser);
router.post('/users/:id/verify', verifyUser);
router.post('/users/:id/unverify', unverifyUser);
router.post('/users/:id/notify', sendNotificationToUser);
router.post('/notifications/broadcast', broadcastNotification);

// Question management
router.get('/questions', getAllQuestions);
router.put(
  '/questions/:id',
  [
    body('title').optional().isString(),
    body('content').optional().isString(),
    body('isClosed').optional().isBoolean(),
    validate
  ],
  updateQuestion
);
router.delete('/questions/:id', deleteQuestion);

// Community management
router.get('/communities', getAllCommunities);
router.post('/communities/:id/ban', banCommunity);
router.post('/communities/:id/unban', unbanCommunity);

export default router;
