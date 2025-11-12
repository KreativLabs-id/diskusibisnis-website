import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// User Management
router.get('/users', adminController.getAllUsers);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);
router.delete('/users/:id', adminController.deleteUser);

// Content Moderation
router.get('/questions', adminController.getAllQuestionsAdmin);
router.delete('/questions/:id', adminController.deleteQuestionAdmin);
router.delete('/answers/:id', adminController.deleteAnswerAdmin);
router.delete('/comments/:id', adminController.deleteCommentAdmin);

// Analytics
router.get('/stats', adminController.getStats);

export default router;
