import { Router } from 'express';
import authRoutes from './auth.routes';
import questionsRoutes from './questions.routes';
import answersRoutes from './answers.routes';
import communitiesRoutes from './communities.routes';
import commentsRoutes from './comments.routes';
import votesRoutes from './votes.routes';
import tagsRoutes from './tags.routes';
import usersRoutes from './users.routes';
import bookmarksRoutes from './bookmarks.routes';
import notificationsRoutes from './notifications.routes';
import adminRoutes from './admin.routes';
import mentionsRoutes from './mentions.routes';
import supportRoutes from './support.routes';
import newsletterRoutes from './newsletter.routes';

const router = Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/questions', questionsRoutes);
router.use('/answers', answersRoutes);
router.use('/communities', communitiesRoutes);
router.use('/comments', commentsRoutes);
router.use('/votes', votesRoutes);
router.use('/tags', tagsRoutes);
router.use('/users', usersRoutes);
router.use('/bookmarks', bookmarksRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/admin', adminRoutes);
router.use('/mentions', mentionsRoutes);
router.use('/support', supportRoutes);
router.use('/admin/newsletter', newsletterRoutes);

export default router;

