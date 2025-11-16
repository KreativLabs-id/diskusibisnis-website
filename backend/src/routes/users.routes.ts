import { Router } from 'express';
import {
  getUsers,
  getUserById,
  getUserByUsername,
  getUserQuestions,
  getUserAnswers,
  getUserActivities,
  getUserRank,
  updateUserProfile,
  deleteUserAvatar
} from '../controllers/users.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Get all users
router.get('/', getUsers);

// Get user by username (must come before /:id to avoid matching username as id)
router.get('/username/:username', getUserByUsername);

// Get user activities (must come before /:id)
router.get('/:id/activities', getUserActivities);

// Get user rank (must come before /:id)
router.get('/:id/rank', getUserRank);

// Get user questions (must come before /:id)
router.get('/:id/questions', getUserQuestions);

// Get user answers (must come before /:id)
router.get('/:id/answers', getUserAnswers);

// Delete user avatar (must come before /:id)
router.delete('/:id/avatar', authenticateToken, deleteUserAvatar);

// Update user profile (must come before /:id)
router.put('/:id', authenticateToken, updateUserProfile);

// Get user by ID (must come last among /:id routes)
router.get('/:id', getUserById);

export default router;
