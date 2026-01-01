import { Router } from 'express';
import { body } from 'express-validator';
import {
    // Public
    getActiveAnnouncements,
    dismissAnnouncement,
    // Admin
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleAnnouncementStatus
} from '../controllers/announcement.controller';
import { validate } from '../utils/validator.utils';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

// ============================================
// PUBLIC ROUTES (for mobile/web apps)
// ============================================

// Get active announcements to display
router.get('/active', optionalAuth, getActiveAnnouncements);

// Dismiss an announcement
router.post('/:announcementId/dismiss', optionalAuth, dismissAnnouncement);

// ============================================
// ADMIN ROUTES
// ============================================

// All admin routes require authentication and admin role
router.use('/admin', requireAuth, requireAdmin);

// List all announcements (with filtering)
router.get('/admin', getAllAnnouncements);

// Get single announcement
router.get('/admin/:id', getAnnouncementById);

// Create new announcement
router.post(
    '/admin',
    [
        body('title').isString().notEmpty().withMessage('Title is required'),
        body('message').isString().notEmpty().withMessage('Message is required'),
        body('type').optional().isIn(['info', 'warning', 'success', 'error', 'promo']),
        body('linkUrl').optional().isString(),
        body('linkText').optional().isString(),
        body('startDate').optional().isISO8601(),
        body('endDate').optional().isISO8601(),
        body('isActive').optional().isBoolean(),
        body('isDismissible').optional().isBoolean(),
        body('priority').optional().isInt({ min: 0 }),
        body('showOn').optional().isIn(['all', 'home', 'questions', 'communities']),
        validate
    ],
    createAnnouncement
);

// Update announcement
router.put(
    '/admin/:id',
    [
        body('title').optional().isString().notEmpty(),
        body('message').optional().isString().notEmpty(),
        body('type').optional().isIn(['info', 'warning', 'success', 'error', 'promo']),
        body('linkUrl').optional().isString(),
        body('linkText').optional().isString(),
        body('startDate').optional().isISO8601(),
        body('endDate').optional().isISO8601(),
        body('isActive').optional().isBoolean(),
        body('isDismissible').optional().isBoolean(),
        body('priority').optional().isInt({ min: 0 }),
        body('showOn').optional().isIn(['all', 'home', 'questions', 'communities']),
        validate
    ],
    updateAnnouncement
);

// Delete announcement
router.delete('/admin/:id', deleteAnnouncement);

// Toggle announcement status
router.post('/admin/:id/toggle', toggleAnnouncementStatus);

export default router;
