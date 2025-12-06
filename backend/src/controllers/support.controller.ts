import { Request, Response } from 'express';
import pool from '../config/database';
import { sendSupportEmail } from '../utils/email.service';
import { AuthRequest } from '../types';

// Create support ticket (public - no auth required)
export const createTicket = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, category } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, subjek, dan pesan wajib diisi'
      });
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;

    const result = await pool.query(
      `INSERT INTO support_tickets (ticket_number, name, email, subject, message, category, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'open', NOW())
       RETURNING *`,
      [ticketNumber, name, email, subject, message, category || 'general']
    );

    // Send confirmation email to user
    await sendTicketConfirmationEmail(email, name, ticketNumber, subject);

    res.status(201).json({
      success: true,
      message: 'Tiket berhasil dikirim! Kami akan segera menghubungi Anda.',
      data: { ticketNumber }
    });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengirim tiket'
    });
  }
};

// Get user's tickets by email (public)
export const getMyTickets = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email wajib diisi'
      });
    }

    const result = await pool.query(
      `SELECT id, ticket_number, subject, category, status, created_at, updated_at 
       FROM support_tickets 
       WHERE email = $1 
       ORDER BY created_at DESC`,
      [email]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('Get my tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data tiket'
    });
  }
};

// Get single ticket by ticket number (public - for user to view their ticket)
export const getTicketByNumber = async (req: Request, res: Response) => {
  try {
    const { ticketNumber } = req.params;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email wajib diisi untuk verifikasi'
      });
    }

    const ticketResult = await pool.query(
      `SELECT * FROM support_tickets WHERE ticket_number = $1 AND email = $2`,
      [ticketNumber, email]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak ditemukan atau email tidak cocok'
      });
    }

    const ticket = ticketResult.rows[0];

    // Get replies
    const repliesResult = await pool.query(
      `SELECT id, sender_name, message, is_admin, created_at FROM support_replies WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [ticket.id]
    );

    res.json({
      success: true,
      data: { ...ticket, replies: repliesResult.rows }
    });
  } catch (error: any) {
    console.error('Get ticket by number error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data tiket'
    });
  }
};

// User reply to ticket (public - verified by email)
export const userReplyToTicket = async (req: Request, res: Response) => {
  try {
    const { ticketNumber } = req.params;
    const { email, message, name } = req.body;

    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Email dan pesan wajib diisi'
      });
    }

    // Verify ticket belongs to this email
    const ticketResult = await pool.query(
      `SELECT * FROM support_tickets WHERE ticket_number = $1 AND email = $2`,
      [ticketNumber, email]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak ditemukan atau email tidak cocok'
      });
    }

    const ticket = ticketResult.rows[0];

    // Check if ticket is closed
    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Tiket sudah ditutup, tidak bisa membalas'
      });
    }

    // Insert user reply (using name from ticket or provided name)
    const userName = name || ticket.name;
    await pool.query(
      `INSERT INTO support_replies (ticket_id, admin_id, sender_name, message, is_admin, created_at)
       VALUES ($1, NULL, $2, $3, false, NOW())`,
      [ticket.id, userName, message]
    );

    // Update ticket status to 'open' if it was 'replied' or 'resolved'
    if (ticket.status === 'replied' || ticket.status === 'resolved') {
      await pool.query(
        `UPDATE support_tickets SET status = 'open', updated_at = NOW() WHERE id = $1`,
        [ticket.id]
      );
    }

    // Send notification email to admin
    await sendUserReplyNotificationEmail(ticket.ticket_number, ticket.subject, userName, message);

    res.json({
      success: true,
      message: 'Balasan berhasil dikirim'
    });
  } catch (error: any) {
    console.error('User reply ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengirim balasan'
    });
  }
};

// Get all tickets (admin only)
export const getAllTickets = async (req: Request, res: Response) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `SELECT * FROM support_tickets WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (category && category !== 'all') {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = `SELECT COUNT(*) FROM support_tickets WHERE 1=1`;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (status && status !== 'all') {
      countQuery += ` AND status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }
    if (category && category !== 'all') {
      countQuery += ` AND category = $${countParamIndex}`;
      countParams.push(category);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        tickets: result.rows,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data tiket'
    });
  }
};


// Get single ticket with replies
export const getTicketById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ticketResult = await pool.query(
      `SELECT * FROM support_tickets WHERE id = $1`,
      [id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak ditemukan'
      });
    }

    const ticket = ticketResult.rows[0];

    // Get replies
    const repliesResult = await pool.query(
      `SELECT * FROM support_replies WHERE ticket_id = $1 ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      data: { ...ticket, replies: repliesResult.rows }
    });
  } catch (error: any) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data tiket'
    });
  }
};

// Reply to ticket (admin only)
export const replyToTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const adminId = req.user?.id;
    
    // Get admin name from database
    let adminName = 'Admin';
    if (adminId) {
      const adminResult = await pool.query(`SELECT display_name FROM users WHERE id = $1`, [adminId]);
      if (adminResult.rows.length > 0) {
        adminName = adminResult.rows[0].display_name || 'Admin';
      }
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Pesan balasan wajib diisi'
      });
    }

    // Get ticket
    const ticketResult = await pool.query(
      `SELECT * FROM support_tickets WHERE id = $1`,
      [id]
    );

    if (ticketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak ditemukan'
      });
    }

    const ticket = ticketResult.rows[0];

    // Insert reply
    const replyResult = await pool.query(
      `INSERT INTO support_replies (ticket_id, admin_id, sender_name, message, is_admin, created_at)
       VALUES ($1, $2, $3, $4, true, NOW())
       RETURNING *`,
      [id, adminId, adminName, message]
    );

    // Update ticket status to 'replied'
    await pool.query(
      `UPDATE support_tickets SET status = 'replied', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    // Send email notification to user
    await sendTicketReplyEmail(
      ticket.email,
      ticket.name,
      ticket.ticket_number,
      ticket.subject,
      message
    );

    res.json({
      success: true,
      message: 'Balasan berhasil dikirim',
      data: replyResult.rows[0]
    });
  } catch (error: any) {
    console.error('Reply ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengirim balasan'
    });
  }
};

// Update ticket status
export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'replied', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid'
      });
    }

    const result = await pool.query(
      `UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Status tiket berhasil diperbarui',
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status tiket'
    });
  }
};


// Delete ticket
export const deleteTicket = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete replies first
    await pool.query(`DELETE FROM support_replies WHERE ticket_id = $1`, [id]);

    // Delete ticket
    const result = await pool.query(
      `DELETE FROM support_tickets WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Tiket berhasil dihapus'
    });
  } catch (error: any) {
    console.error('Delete ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus tiket'
    });
  }
};

// Get ticket stats for admin dashboard
export const getTicketStats = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT status, COUNT(*) as count FROM support_tickets GROUP BY status`);
    
    const stats = {
      total: 0,
      open: 0,
      replied: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0
    };

    result.rows.forEach((row: any) => {
      const count = parseInt(row.count);
      stats.total += count;
      if (row.status in stats) {
        (stats as any)[row.status] = count;
      }
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik tiket'
    });
  }
};

// Email helper functions
const sendTicketConfirmationEmail = async (
  email: string,
  name: string,
  ticketNumber: string,
  subject: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #059669; font-size: 24px; font-weight: bold;">DiskusiBisnis</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px;">
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600;">Tiket Anda Telah Diterima</h2>
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 15px; line-height: 1.6;">
                    Halo <strong>${name}</strong>,
                  </p>
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 15px; line-height: 1.6;">
                    Terima kasih telah menghubungi kami. Tiket Anda telah berhasil dibuat.
                  </p>
                  <div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;">Nomor Tiket:</p>
                    <p style="margin: 0; color: #059669; font-size: 20px; font-weight: bold;">${ticketNumber}</p>
                  </div>
                  <p style="margin: 0 0 8px; color: #64748b; font-size: 14px;"><strong>Subjek:</strong> ${subject}</p>
                  <p style="margin: 16px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                    Tim kami akan segera meninjau dan membalas tiket Anda.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">
                    © ${new Date().getFullYear()} DiskusiBisnis. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendSupportEmail({
    to: email,
    subject: `[${ticketNumber}] Tiket Anda Telah Diterima - ${subject}`,
    html
  });
};

const sendTicketReplyEmail = async (
  email: string,
  name: string,
  ticketNumber: string,
  subject: string,
  replyMessage: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #059669; font-size: 24px; font-weight: bold;">DiskusiBisnis</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px;">
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600;">Balasan untuk Tiket Anda</h2>
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 15px; line-height: 1.6;">
                    Halo <strong>${name}</strong>,
                  </p>
                  <p style="margin: 0 0 16px; color: #64748b; font-size: 15px; line-height: 1.6;">
                    Tim support kami telah membalas tiket Anda.
                  </p>
                  <div style="background-color: #f1f5f9; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">Nomor Tiket: <strong>${ticketNumber}</strong></p>
                    <p style="margin: 0; color: #64748b; font-size: 12px;">Subjek: <strong>${subject}</strong></p>
                  </div>
                  <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0 0 8px; color: #059669; font-size: 13px; font-weight: 600;">Balasan dari Tim Support:</p>
                    <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${replyMessage}</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">
                    © ${new Date().getFullYear()} DiskusiBisnis. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendSupportEmail({
    to: email,
    subject: `[${ticketNumber}] Balasan: ${subject}`,
    html
  });
};

// Send notification to admin when user replies
const sendUserReplyNotificationEmail = async (
  ticketNumber: string,
  subject: string,
  userName: string,
  message: string
): Promise<boolean> => {
  const adminEmail = process.env.ADMIN_EMAIL || 'kreativlabsid@gmail.com';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #059669; font-size: 24px; font-weight: bold;">DiskusiBisnis Admin</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px;">
                  <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px; font-weight: 600;">Balasan Baru dari User</h2>
                  <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0 0 8px; color: #92400e; font-size: 12px;">Tiket: <strong>${ticketNumber}</strong></p>
                    <p style="margin: 0; color: #92400e; font-size: 12px;">Subjek: <strong>${subject}</strong></p>
                  </div>
                  <div style="background-color: #f1f5f9; border-left: 4px solid #64748b; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0 0 8px; color: #64748b; font-size: 13px; font-weight: 600;">Balasan dari ${userName}:</p>
                    <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                  </div>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 10px 0;">
                        <a href="${frontendUrl}/admin/support" style="display: inline-block; padding: 12px 24px; background-color: #059669; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
                          Lihat di Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #94a3b8; font-size: 13px; text-align: center;">
                    © ${new Date().getFullYear()} DiskusiBisnis. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendSupportEmail({
    to: adminEmail,
    subject: `[${ticketNumber}] Balasan Baru dari User - ${subject}`,
    html
  });
};
