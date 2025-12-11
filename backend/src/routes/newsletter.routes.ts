import { Router } from 'express';
import { body } from 'express-validator';
import {
    getNewsletterStats,
    getNewsletterHistory,
    sendNewsletter,
    sendTestNewsletter
} from '../controllers/newsletter.controller';
import { validate } from '../utils/validator.utils';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

// All newsletter routes require authentication and admin role
router.use(requireAuth, requireAdmin);

// Get newsletter statistics
router.get('/stats', getNewsletterStats);

// Get newsletter history
router.get('/history', getNewsletterHistory);

// Send newsletter to all users
router.post(
    '/send',
    [
        body('subject').notEmpty().withMessage('Subject wajib diisi'),
        body('content').notEmpty().withMessage('Konten wajib diisi'),
        body('previewHtml').optional().isString(),
        validate
    ],
    sendNewsletter
);

// Send test newsletter
router.post(
    '/test',
    [
        body('email').isEmail().withMessage('Email tidak valid'),
        body('subject').notEmpty().withMessage('Subject wajib diisi'),
        body('content').notEmpty().withMessage('Konten wajib diisi'),
        body('previewHtml').optional().isString(),
        validate
    ],
    sendTestNewsletter
);

export default router;
