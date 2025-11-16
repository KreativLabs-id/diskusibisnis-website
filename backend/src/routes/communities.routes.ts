import { Router } from 'express';
import { body } from 'express-validator';
import {
  getCommunities,
  createCommunity,
  getCommunityBySlug,
  joinCommunity,
  leaveCommunity,
  getCommunityQuestions,
  getCommunityMembers,
  promoteMemberToAdmin,
  demoteAdminToMember,
  updateCommunityAbout
} from '../controllers/communities.controller';
import { validate } from '../utils/validator.utils';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

// Get all communities
router.get('/', optionalAuth, getCommunities);

// Create community
router.post(
  '/',
  requireAuth,
  [
    body('name').isLength({ min: 3, max: 100 }).withMessage('Name must be between 3-100 characters'),
    body('description').isLength({ min: 10, max: 500 }).withMessage('Description must be between 10-500 characters'),
    body('category').notEmpty().withMessage('Category is required'),
    validate
  ],
  createCommunity
);

// Get community by slug
router.get('/:slug', getCommunityBySlug);

// Join community
router.post('/:slug/join', requireAuth, joinCommunity);

// Leave community
router.post('/:slug/leave', requireAuth, leaveCommunity);

// Get community questions
router.get('/:slug/questions', getCommunityQuestions);

// Get community members
router.get('/:slug/members', getCommunityMembers);

// Promote member to admin
router.post('/:slug/members/:userId/promote', requireAuth, promoteMemberToAdmin);

// Demote admin to member
router.post('/:slug/members/:userId/demote', requireAuth, demoteAdminToMember);

// Update community about information
router.put('/:slug/about', requireAuth, updateCommunityAbout);

export default router;
