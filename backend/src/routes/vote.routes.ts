import { Router } from 'express';
import * as voteController from '../controllers/vote.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// @route   POST /api/votes
// @desc    Cast a vote (upvote/downvote)
// @access  Private (Member)
router.post('/', authenticateToken, voteController.castVote);

// @route   DELETE /api/votes/:id
// @desc    Remove vote
// @access  Private (Voter only)
router.delete('/:id', authenticateToken, voteController.removeVote);

export default router;
