import { Router } from 'express';
import { body } from 'express-validator';
import { createOrUpdateVote } from '../controllers/votes.controller';
import { validate } from '../utils/validator.utils';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Create or update vote
router.post(
  '/',
  requireAuth,
  [
    body('targetType').isIn(['question', 'answer']).withMessage('Target type must be question or answer'),
    body('targetId').notEmpty().withMessage('Target ID is required'),
    body('voteType').isIn(['upvote', 'downvote']).withMessage('Vote type must be upvote or downvote'),
    validate
  ],
  createOrUpdateVote
);

export default router;
