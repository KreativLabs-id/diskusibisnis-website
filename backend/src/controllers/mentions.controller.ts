import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';

// Search users by username (for autocomplete)
export const searchUsers = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search term required (minimum 1 character)' 
      });
    }

    const result = await pool.query(
      `SELECT * FROM search_users_by_username($1, $2)`,
      [q, 10]
    );

    return res.status(200).json({
      success: true,
      users: result.rows
    });
  } catch (error: any) {
    console.error('Error searching users:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search users'
    });
  }
};

// Create mentions from content
export const createMentions = async (
  mentionerId: string,
  contentType: 'question' | 'answer' | 'comment',
  contentId: string,
  content: string
) => {
  try {
    // Extract @username or @"display name" mentions from content
    // Match: @word or @"name with spaces"
    const mentionRegex = /@"([^"]+)"|@([\w\s]+?)(?=\s|$|[^\w\s])/g;
    const matches = content.matchAll(mentionRegex);
    const displayNames = [...new Set([...matches].map(m => m[1] || m[2]?.trim()))]; // Unique names

    if (displayNames.length === 0) {
      return { success: true, mentionsCreated: 0 };
    }

    // Get user IDs for mentioned display names (case insensitive)
    const usersResult = await pool.query(
      `SELECT id, display_name FROM users WHERE LOWER(display_name) = ANY($1::text[])`,
      [displayNames.map(name => name.toLowerCase())]
    );

    const mentionedUsers = usersResult.rows;

    // Insert mentions (avoid self-mentions)
    let mentionsCreated = 0;
    for (const user of mentionedUsers) {
      if (user.id !== mentionerId) {
        await pool.query(
          `INSERT INTO mentions (mentioner_id, mentioned_user_id, content_type, content_id)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [mentionerId, user.id, contentType, contentId]
        );
        mentionsCreated++;
      }
    }

    return { success: true, mentionsCreated };
  } catch (error: any) {
    console.error('Error creating mentions:', error);
    return { success: false, error: error.message };
  }
};

// Get mentions for a user
export const getUserMentions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    const result = await pool.query(
      `SELECT 
        m.*,
        u.display_name as mentioner_name,
        u.username as mentioner_username,
        u.avatar_url as mentioner_avatar,
        CASE 
          WHEN m.content_type = 'question' THEN q.title
          WHEN m.content_type = 'answer' THEN q2.title
          WHEN m.content_type = 'comment' THEN 
            COALESCE(q3.title, q4.title)
        END as content_title
      FROM mentions m
      JOIN users u ON m.mentioner_id = u.id
      LEFT JOIN questions q ON m.content_type = 'question' AND m.content_id = q.id
      LEFT JOIN answers a ON m.content_type = 'answer' AND m.content_id = a.id
      LEFT JOIN questions q2 ON a.question_id = q2.id
      LEFT JOIN comments c ON m.content_type = 'comment' AND m.content_id = c.id
      LEFT JOIN questions q3 ON c.question_id = q3.id
      LEFT JOIN answers a2 ON c.answer_id = a2.id
      LEFT JOIN questions q4 ON a2.question_id = q4.id
      WHERE m.mentioned_user_id = $1
      ORDER BY m.created_at DESC
      LIMIT 50`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      mentions: result.rows
    });
  } catch (error: any) {
    console.error('Error getting mentions:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get mentions'
    });
  }
};

// Check username availability
export const checkUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    if (!username || username.length < 3 || username.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Username must be between 3 and 50 characters'
      });
    }

    // Check if username contains only alphanumeric and underscore
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({
        success: false,
        available: false,
        error: 'Username can only contain letters, numbers, and underscores'
      });
    }

    const result = await pool.query(
      `SELECT id FROM users WHERE username = $1`,
      [username.toLowerCase()]
    );

    return res.status(200).json({
      success: true,
      available: result.rows.length === 0
    });
  } catch (error: any) {
    console.error('Error checking username:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check username'
    });
  }
};
