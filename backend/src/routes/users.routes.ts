import { Router } from 'express';
import {
  getUsers,
  getUserById,
  getUserQuestions,
  getUserAnswers,
  getUserActivities,
  getUserRank
} from '../controllers/users.controller';

const router = Router();

// Get all users
router.get('/', getUsers);

// Get user activities (must come before /:id)
router.get('/:id/activities', getUserActivities);

// Get user rank (must come before /:id)
router.get('/:id/rank', getUserRank);

// Get user questions (must come before /:id)
router.get('/:id/questions', getUserQuestions);

// Get user answers (must come before /:id)
router.get('/:id/answers', getUserAnswers);

// Get user by ID (must come last among /:id routes)
router.get('/:id', getUserById);

export default router;
