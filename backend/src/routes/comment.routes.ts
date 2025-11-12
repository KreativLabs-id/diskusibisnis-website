import { Router } from 'express';
import * as commentController from '../controllers/comment.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// @route   POST /api/comments
// @desc    Create new comment
// @access  Private (Member)
router.post('/', authenticateToken, commentController.createComment);

// @route   PUT /api/comments/:id
// @desc    Update comment
// @access  Private (Author only)
router.put('/:id', authenticateToken, commentController.updateComment);

// @route   DELETE /api/comments/:id
// @desc    Delete comment
// @access  Private (Author or Admin)
router.delete('/:id', authenticateToken, commentController.deleteComment);

export default router;
