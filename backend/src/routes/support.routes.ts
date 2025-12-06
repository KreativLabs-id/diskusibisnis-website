import { Router } from 'express';
import { body } from 'express-validator';
import {
  createTicket,
  getMyTickets,
  getTicketByNumber,
  userReplyToTicket,
  getAllTickets,
  getTicketById,
  replyToTicket,
  updateTicketStatus,
  deleteTicket,
  getTicketStats
} from '../controllers/support.controller';
import { validate } from '../utils/validator.utils';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

// Public routes
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Nama wajib diisi'),
    body('email').isEmail().withMessage('Email tidak valid'),
    body('subject').notEmpty().withMessage('Subjek wajib diisi'),
    body('message').notEmpty().withMessage('Pesan wajib diisi'),
    body('category').optional().isString(),
    validate
  ],
  createTicket
);

// Public - user can view their tickets by email
router.get('/my-tickets', getMyTickets);
router.get('/ticket/:ticketNumber', getTicketByNumber);

// Public - user can reply to their ticket (verified by email)
router.post(
  '/ticket/:ticketNumber/reply',
  [
    body('email').isEmail().withMessage('Email tidak valid'),
    body('message').notEmpty().withMessage('Pesan wajib diisi'),
    validate
  ],
  userReplyToTicket
);

// Admin routes - require auth and admin role
router.get('/stats', requireAuth, requireAdmin, getTicketStats);
router.get('/', requireAuth, requireAdmin, getAllTickets);
router.get('/:id', requireAuth, requireAdmin, getTicketById);
router.post('/:id/reply', requireAuth, requireAdmin, replyToTicket);
router.patch('/:id/status', requireAuth, requireAdmin, updateTicketStatus);
router.delete('/:id', requireAuth, requireAdmin, deleteTicket);

export default router;
