import { Router } from 'express';
import { body } from 'express-validator';
import {
  getQuestions,
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  incrementViewCount,
  toggleCloseQuestion
} from '../controllers/questions.controller';
import { validate } from '../utils/validator.utils';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

// Get all questions
router.get('/', getQuestions);

// Create question
router.post(
  '/',
  requireAuth,
  [
    body('title').isLength({ min: 10, max: 200 }).withMessage('Title must be between 10-200 characters'),
    body('content').isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
    validate
  ],
  createQuestion
);

// Get question by ID
router.get('/:id', optionalAuth, getQuestionById);

// Update question
router.put(
  '/:id',
  requireAuth,
  [
    body('title').isLength({ min: 10, max: 200 }).withMessage('Title must be between 10-200 characters'),
    body('content').isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
    validate
  ],
  updateQuestion
);

// Delete question
router.delete('/:id', requireAuth, deleteQuestion);

// Increment view count
router.post('/:id/view', incrementViewCount);

// Close/reopen question
router.post('/:id/close', requireAuth, toggleCloseQuestion);

export default router;
