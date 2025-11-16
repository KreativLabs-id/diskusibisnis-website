import { Router } from 'express';
import { body } from 'express-validator';
import {
  getBookmarks,
  createBookmark,
  deleteBookmark
} from '../controllers/bookmarks.controller';
import { validate } from '../utils/validator.utils';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Get user bookmarks
router.get('/', requireAuth, getBookmarks);

// Create bookmark
router.post(
  '/',
  requireAuth,
  [
    body('questionId').notEmpty().withMessage('Question ID is required'),
    validate
  ],
  createBookmark
);

// Delete bookmark (accepts questionId from query params)
router.delete(
  '/',
  requireAuth,
  deleteBookmark
);

export default router;
