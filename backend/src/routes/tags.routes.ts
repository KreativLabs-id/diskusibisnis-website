import { Router } from 'express';
import { getTags, getTagBySlug } from '../controllers/tags.controller';

const router = Router();

// Get all tags
router.get('/', getTags);

// Get tag by slug
router.get('/:slug', getTagBySlug);

export default router;
