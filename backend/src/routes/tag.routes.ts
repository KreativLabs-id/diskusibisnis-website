import { Router } from 'express';
import * as tagController from '../controllers/tag.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// @route   GET /api/tags
// @desc    Get all tags
// @access  Public
router.get('/', tagController.getAllTags);

// @route   GET /api/tags/:slug
// @desc    Get tag by slug with questions
// @access  Public
router.get('/:slug', tagController.getTagBySlug);

// @route   POST /api/tags
// @desc    Create new tag
// @access  Private (Admin only)
router.post('/', authenticateToken, requireAdmin, tagController.createTag);

// @route   PUT /api/tags/:id
// @desc    Update tag
// @access  Private (Admin only)
router.put('/:id', authenticateToken, requireAdmin, tagController.updateTag);

// @route   DELETE /api/tags/:id
// @desc    Delete tag
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, tagController.deleteTag);

export default router;
