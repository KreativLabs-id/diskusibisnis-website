import { body } from 'express-validator';

export const registerValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').notEmpty().withMessage('Display name is required'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const questionValidation = [
  body('title').isLength({ min: 10, max: 200 }).withMessage('Title must be between 10-200 characters'),
  body('content').isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
];

export const answerValidation = [
  body('content').isLength({ min: 20 }).withMessage('Answer must be at least 20 characters'),
  body('questionId').notEmpty().withMessage('Question ID is required'),
];

export const commentValidation = [
  body('content').isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1-500 characters'),
];

export const communityValidation = [
  body('name').isLength({ min: 3, max: 100 }).withMessage('Name must be between 3-100 characters'),
  body('description').isLength({ min: 10, max: 500 }).withMessage('Description must be between 10-500 characters'),
  body('category').notEmpty().withMessage('Category is required'),
];

export const voteValidation = [
  body('voteType').isIn(['upvote', 'downvote']).withMessage('Vote type must be upvote or downvote'),
];
