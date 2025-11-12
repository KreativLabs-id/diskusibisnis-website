import { Router } from 'express';
import * as questionController from '../controllers/question.controller';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// @route   GET /api/questions
// @desc    Get all questions (with filters)
// @access  Public
router.get('/', optionalAuth, questionController.getAllQuestions);

// @route   GET /api/questions/:id
// @desc    Get question by ID
// @access  Public
router.get('/:id', optionalAuth, questionController.getQuestionById);

// @route   POST /api/questions
// @desc    Create new question
// @access  Private (Member)
router.post('/', authenticateToken, questionController.createQuestion);

// @route   PUT /api/questions/:id
// @desc    Update question
// @access  Private (Author only)
router.put('/:id', authenticateToken, questionController.updateQuestion);

// @route   DELETE /api/questions/:id
// @desc    Delete question
// @access  Private (Author or Admin)
router.delete('/:id', authenticateToken, questionController.deleteQuestion);

// @route   POST /api/questions/:id/close
// @desc    Close question
// @access  Private (Author or Admin)
router.post('/:id/close', authenticateToken, questionController.closeQuestion);

export default router;
