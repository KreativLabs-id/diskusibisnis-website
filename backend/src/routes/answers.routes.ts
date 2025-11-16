import { Router } from 'express';
import { body } from 'express-validator';
import {
  createAnswer,
  getAnswerById,
  updateAnswer,
  deleteAnswer,
  acceptAnswer
} from '../controllers/answers.controller';
import { validate } from '../utils/validator.utils';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Create answer
router.post(
  '/',
  requireAuth,
  [
    body('content').isLength({ min: 20 }).withMessage('Answer must be at least 20 characters'),
    body('questionId').notEmpty().withMessage('Question ID is required'),
    validate
  ],
  createAnswer
);

// Get answer by ID
router.get('/:id', getAnswerById);

// Update answer
router.put(
  '/:id',
  requireAuth,
  [
    body('content').isLength({ min: 20 }).withMessage('Answer must be at least 20 characters'),
    validate
  ],
  updateAnswer
);

// Delete answer
router.delete('/:id', requireAuth, deleteAnswer);

// Accept answer
router.post('/:id/accept', requireAuth, acceptAnswer);

export default router;
