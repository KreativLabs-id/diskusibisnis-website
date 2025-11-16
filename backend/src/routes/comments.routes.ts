import { Router } from 'express';
import { body } from 'express-validator';
import {
  createComment,
  getCommentById,
  updateComment,
  deleteComment
} from '../controllers/comments.controller';
import { validate } from '../utils/validator.utils';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Create comment
router.post(
  '/',
  requireAuth,
  [
    body('content').isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1-500 characters'),
    body('commentableType').isIn(['question', 'answer']).withMessage('Invalid commentable type'),
    body('commentableId').notEmpty().withMessage('Commentable ID is required'),
    validate
  ],
  createComment
);

// Get comment by ID
router.get('/:id', getCommentById);

// Update comment
router.put(
  '/:id',
  requireAuth,
  [
    body('content').isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1-500 characters'),
    validate
  ],
  updateComment
);

// Delete comment
router.delete('/:id', requireAuth, deleteComment);

export default router;
