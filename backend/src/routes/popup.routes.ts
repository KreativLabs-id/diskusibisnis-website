import { Router } from 'express';
import { body } from 'express-validator';
import {
    // Public
    getActivePopup,
    recordPopupView,
    // Admin
    getAllPopups,
    getPopupById,
    createPopup,
    updatePopup,
    deletePopup,
    togglePopupStatus,
    getPopupStats
} from '../controllers/popup.controller';
import { validate } from '../utils/validator.utils';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

// ============================================
// PUBLIC ROUTES (for mobile/web apps)
// ============================================

// Get active popup to display (allows guests with optional auth)
router.get('/active', optionalAuth, getActivePopup);

// Record popup view/dismiss
router.post(
    '/:popupId/view',
    optionalAuth,
    [
        body('clicked').optional().isBoolean(),
        validate
    ],
    recordPopupView
);

// ============================================
// ADMIN ROUTES
// ============================================

// All admin routes require authentication and admin role
router.use('/admin', requireAuth, requireAdmin);

// List all popups (with filtering)
router.get('/admin', getAllPopups);

// Get single popup
router.get('/admin/:id', getPopupById);

// Create new popup
router.post(
    '/admin',
    [
        body('title').isString().notEmpty().withMessage('Title is required'),
        body('imageUrl').isURL().withMessage('Valid image URL is required'),
        body('linkUrl').optional().isString(),
        body('linkType').optional().isIn(['external', 'question', 'community', 'url']),
        body('description').optional().isString(),
        body('startDate').optional().isISO8601(),
        body('endDate').optional().isISO8601(),
        body('isActive').optional().isBoolean(),
        body('priority').optional().isInt({ min: 0 }),
        body('targetAudience').optional().isIn(['all', 'new_users', 'returning_users']),
        body('showOncePerUser').optional().isBoolean(),
        validate
    ],
    createPopup
);

// Update popup
router.put(
    '/admin/:id',
    [
        body('title').optional().isString().notEmpty(),
        body('imageUrl').optional().isURL(),
        body('linkUrl').optional().isString(),
        body('linkType').optional().isIn(['external', 'question', 'community', 'url']),
        body('description').optional().isString(),
        body('startDate').optional().isISO8601(),
        body('endDate').optional().isISO8601(),
        body('isActive').optional().isBoolean(),
        body('priority').optional().isInt({ min: 0 }),
        body('targetAudience').optional().isIn(['all', 'new_users', 'returning_users']),
        body('showOncePerUser').optional().isBoolean(),
        validate
    ],
    updatePopup
);

// Delete popup
router.delete('/admin/:id', deletePopup);

// Toggle popup status
router.post('/admin/:id/toggle', togglePopupStatus);

// Get popup statistics
router.get('/admin/:id/stats', getPopupStats);

export default router;
