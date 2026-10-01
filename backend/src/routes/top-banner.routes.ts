import { Router } from 'express';
import {
    getActiveTopBanner,
    getAllTopBanners,
    getTopBannerById,
    createTopBanner,
    updateTopBanner,
    deleteTopBanner,
    toggleTopBannerStatus
} from '../controllers/top-banner.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Get active top banner to display on website
router.get('/active', optionalAuth, getActiveTopBanner);

// ============================================
// ADMIN ROUTES
// ============================================

// All admin routes require authentication and admin role
router.use('/admin', requireAuth, requireAdmin);

// List all top banners
router.get('/admin', getAllTopBanners);

// Get single top banner
router.get('/admin/:id', getTopBannerById);

// Create new top banner
router.post('/admin', createTopBanner);

// Update top banner
router.put('/admin/:id', updateTopBanner);

// Delete top banner
router.delete('/admin/:id', deleteTopBanner);

// Toggle active status
router.post('/admin/:id/toggle', toggleTopBannerStatus);

export default router;
