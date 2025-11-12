import { Router } from 'express';
import * as answerController from '../controllers/answer.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// @route   POST /api/answers
// @desc    Create new answer
// @access  Private (Member)
router.post('/', authenticateToken, answerController.createAnswer);

// @route   PUT /api/answers/:id
// @desc    Update answer
// @access  Private (Author only)
router.put('/:id', authenticateToken, answerController.updateAnswer);

// @route   DELETE /api/answers/:id
// @desc    Delete answer
// @access  Private (Author or Admin)
router.delete('/:id', authenticateToken, answerController.deleteAnswer);

// @route   POST /api/answers/:id/accept
// @desc    Accept answer as best answer
// @access  Private (Question Author only)
router.post('/:id/accept', authenticateToken, answerController.acceptAnswer);

export default router;
