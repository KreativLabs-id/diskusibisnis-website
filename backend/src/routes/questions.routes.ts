import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
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

/**
 * Rate limiter for view count endpoint.
 * Allows 1 view increment per IP per question per 5 minutes.
 * keyGenerator combines IP + question ID so it's scoped per resource.
 */
const viewCountLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `view:${req.ip}:${req.params.id}`,
  handler: (_req, res) => {
    // Silently succeed — we just don't increment. No error shown to user.
    res.status(200).json({ success: true, message: 'View already counted' });
  },
  skip: () => false,
});

// Get all questions
router.get('/', optionalAuth, getQuestions);

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

// Increment view count — rate limited: 1 view per IP per question per 5 minutes
router.post('/:id/view', viewCountLimiter, incrementViewCount);

// Close/reopen question
router.post('/:id/close', requireAuth, toggleCloseQuestion);

export default router;
