import express from 'express';
import { searchUsers, getUserMentions, checkUsername } from '../controllers/mentions.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = express.Router();

// Search users for mention autocomplete
router.get('/search', searchUsers);

// Check username availability
router.get('/check/:username', checkUsername);

// Get mentions for current user
router.get('/my-mentions', requireAuth, getUserMentions);

export default router;
