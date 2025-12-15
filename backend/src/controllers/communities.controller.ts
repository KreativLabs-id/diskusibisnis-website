import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../types';
import { successResponse, errorResponse, notFoundResponse, forbiddenResponse } from '../utils/response.utils';
import { generateUniqueSlug } from '../utils/slug.utils';

/**
 * Get all communities
 * GET /api/communities
 */
export const getCommunities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const category = (req.query.category as string) || '';
    const memberOnly = req.query.member === 'true';

    let currentUserId = null;
    if (memberOnly) {
      if (!req.user) {
        forbiddenResponse(res, 'Authentication required for member filter');
        return;
      }
      currentUserId = req.user.id;
    }

    const offset = (page - 1) * limit;
    const queryParams: any[] = [];
    let paramIndex = 1;

    let query = `
      SELECT 
        c.id, c.name, c.slug, c.description, c.category, c.location,
        c.avatar_url, c.is_popular, c.created_at,
        COUNT(DISTINCT cm.user_id) as member_count,
        COUNT(DISTINCT q.id) as question_count
      FROM public.communities c
      LEFT JOIN public.community_members cm ON c.id = cm.community_id
      LEFT JOIN public.questions q ON c.id = q.community_id
      WHERE 1=1
    `;

    if (memberOnly && currentUserId) {
      query += ` AND EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_id = c.id AND user_id = $${paramIndex}
      )`;
      queryParams.push(currentUserId);
      paramIndex++;
    }

    if (search) {
      query += ` AND (c.name ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (category && category !== 'all') {
      query += ` AND c.category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    query += ` GROUP BY c.id ORDER BY c.is_popular DESC, member_count DESC`;
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM public.communities c
      WHERE 1=1
    `;

    const countParams: any[] = [];
    let countParamIndex = 1;

    if (memberOnly && currentUserId) {
      countQuery += ` AND EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_id = c.id AND user_id = $${countParamIndex}
      )`;
      countParams.push(currentUserId);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (c.name ILIKE $${countParamIndex} OR c.description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (category && category !== 'all') {
      countQuery += ` AND c.category = $${countParamIndex}`;
      countParams.push(category);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    successResponse(res, {
      communities: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get communities error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Create new community
 * POST /api/communities
 */
export const createCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const { name, description, category, location, avatar_url } = req.body;

    // Check if community name already exists
    const existingCommunity = await pool.query(
      'SELECT id FROM public.communities WHERE name = $1',
      [name]
    );

    if (existingCommunity.rows.length > 0) {
      errorResponse(res, 'Community name already exists', 400);
      return;
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(name, 'communities');

    // Create community
    const result = await pool.query(
      `INSERT INTO public.communities (name, slug, description, category, location, avatar_url, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, name, slug, description, category, location, avatar_url, created_at`,
      [name, slug, description, category, location, avatar_url || null, user.id]
    );

    const community = result.rows[0];

    // Add creator as first member (admin)
    await pool.query(
      'INSERT INTO public.community_members (community_id, user_id, role) VALUES ($1, $2, $3)',
      [community.id, user.id, 'admin']
    );

    successResponse(res, { community }, 'Community created successfully', 201);
  } catch (error) {
    console.error('Create community error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get community by slug
 * GET /api/communities/:slug
 */
export const getCommunityBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug;
    const currentUserId = req.user?.id || null;

    console.log(`[getCommunityBySlug] Fetching community: ${slug}, userId: ${currentUserId}, type: ${typeof currentUserId}`);

    // Build query based on whether user is authenticated
    let query: string;
    let params: any[];

    if (currentUserId) {
      query = `
        SELECT 
          c.id, c.name, c.slug, c.description, c.category, c.location, c.created_at, c.created_by,
          c.avatar_url, c.vision, c.mission, c.target_members, c.benefits,
          u.display_name as creator_name,
          COUNT(DISTINCT cm.id) as members_count,
          CASE WHEN user_cm.user_id IS NOT NULL THEN TRUE ELSE FALSE END as is_member,
          user_cm.role as user_role
        FROM public.communities c
        LEFT JOIN public.users u ON c.created_by = u.id
        LEFT JOIN public.community_members cm ON c.id = cm.community_id
        LEFT JOIN public.community_members user_cm ON c.id = user_cm.community_id AND user_cm.user_id = $2
        WHERE c.slug = $1
        GROUP BY c.id, u.display_name, user_cm.user_id, user_cm.role
      `;
      params = [slug, currentUserId];
    } else {
      query = `
        SELECT 
          c.id, c.name, c.slug, c.description, c.category, c.location, c.created_at, c.created_by,
          c.avatar_url, c.vision, c.mission, c.target_members, c.benefits,
          u.display_name as creator_name,
          COUNT(DISTINCT cm.id) as members_count,
          FALSE as is_member,
          NULL as user_role
        FROM public.communities c
        LEFT JOIN public.users u ON c.created_by = u.id
        LEFT JOIN public.community_members cm ON c.id = cm.community_id
        WHERE c.slug = $1
        GROUP BY c.id, u.display_name
      `;
      params = [slug];
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      notFoundResponse(res, 'Community not found');
      return;
    }

    const community = result.rows[0];
    console.log(`[getCommunityBySlug] Result: is_member=${community.is_member}, user_role=${community.user_role}`);

    successResponse(res, { community });
  } catch (error) {
    console.error('Get community error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Join community
 * POST /api/communities/:slug/join
 */
export const joinCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const slug = req.params.slug;

    console.log(`[joinCommunity] User ${user.id} attempting to join ${slug}`);

    // Get community ID
    const communityResult = await pool.query(
      'SELECT id FROM public.communities WHERE slug = $1',
      [slug]
    );

    if (communityResult.rows.length === 0) {
      notFoundResponse(res, 'Community not found');
      return;
    }

    const communityId = communityResult.rows[0].id;

    // Check if already a member
    const existingMember = await pool.query(
      'SELECT id, role FROM public.community_members WHERE community_id = $1 AND user_id = $2',
      [communityId, user.id]
    );

    console.log(`[joinCommunity] Existing membership check: ${existingMember.rows.length > 0 ? 'YES' : 'NO'}`);

    if (existingMember.rows.length > 0) {
      // Already a member - return success (idempotent)
      console.log(`[joinCommunity] User is already a member with role: ${existingMember.rows[0].role}`);
      successResponse(res, { already_member: true }, 'You are already a member of this community');
      return;
    }

    // Add as member
    console.log(`[joinCommunity] Adding user as new member`);
    await pool.query(
      'INSERT INTO public.community_members (community_id, user_id, role) VALUES ($1, $2, $3)',
      [communityId, user.id, 'member']
    );

    successResponse(res, { already_member: false }, 'Successfully joined community');
  } catch (error) {
    console.error('Join community error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Leave community
 * POST /api/communities/:slug/leave
 */
export const leaveCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const slug = req.params.slug;

    // Get community and check creator
    const communityResult = await pool.query(
      'SELECT id, created_by FROM public.communities WHERE slug = $1',
      [slug]
    );

    if (communityResult.rows.length === 0) {
      notFoundResponse(res, 'Community not found');
      return;
    }

    const { id: communityId, created_by } = communityResult.rows[0];

    // Prevent creator from leaving their own community
    if (created_by === user.id) {
      errorResponse(res, 'Pembuat komunitas tidak bisa keluar dari komunitasnya. Hapus komunitas atau transfer kepemilikan terlebih dahulu.', 403);
      return;
    }

    // Check if user is a member
    const membershipResult = await pool.query(
      'SELECT role FROM public.community_members WHERE community_id = $1 AND user_id = $2',
      [communityId, user.id]
    );

    if (membershipResult.rows.length === 0) {
      // Not a member - return success (idempotent)
      successResponse(res, { already_left: true }, 'You are not a member of this community');
      return;
    }

    // Remove membership
    await pool.query(
      'DELETE FROM public.community_members WHERE community_id = $1 AND user_id = $2',
      [communityId, user.id]
    );

    successResponse(res, { already_left: false }, 'Successfully left community');
  } catch (error) {
    console.error('Leave community error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get community questions
 * GET /api/communities/:slug/questions
 */
export const getCommunityQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get community ID
    const communityResult = await pool.query(
      'SELECT id FROM public.communities WHERE slug = $1',
      [slug]
    );

    if (communityResult.rows.length === 0) {
      notFoundResponse(res, 'Community not found');
      return;
    }

    const communityId = communityResult.rows[0].id;

    const result = await pool.query(`
      SELECT 
        q.id, q.title, q.content, q.views_count, q.is_closed, q.created_at,
        u.id as author_id, u.display_name as author_name, u.avatar_url as author_avatar,
        COUNT(DISTINCT a.id) as answers_count,
        COUNT(DISTINCT CASE WHEN v.vote_type = 'upvote' THEN v.id END) as upvotes_count
      FROM public.questions q
      LEFT JOIN public.users u ON q.author_id = u.id
      LEFT JOIN public.answers a ON q.id = a.question_id
      LEFT JOIN public.votes v ON v.question_id = q.id
      WHERE q.community_id = $1
      GROUP BY q.id, u.id
      ORDER BY q.created_at DESC
      LIMIT $2 OFFSET $3
    `, [communityId, limit, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM public.questions WHERE community_id = $1',
      [communityId]
    );

    const total = parseInt(countResult.rows[0].total);

    successResponse(res, {
      questions: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get community questions error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Get community members
 * GET /api/communities/:slug/members
 */
export const getCommunityMembers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Get community ID
    const communityResult = await pool.query(
      'SELECT id FROM public.communities WHERE slug = $1',
      [slug]
    );

    if (communityResult.rows.length === 0) {
      notFoundResponse(res, 'Community not found');
      return;
    }

    const communityId = communityResult.rows[0].id;

    const result = await pool.query(`
      SELECT 
        u.id, u.display_name, u.avatar_url, u.reputation_points,
        cm.role, cm.joined_at
      FROM public.community_members cm
      JOIN public.users u ON cm.user_id = u.id
      WHERE cm.community_id = $1
      ORDER BY cm.joined_at ASC
      LIMIT $2 OFFSET $3
    `, [communityId, limit, offset]);

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM public.community_members WHERE community_id = $1',
      [communityId]
    );

    const total = parseInt(countResult.rows[0].total);

    successResponse(res, {
      members: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get community members error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Promote member to admin
 * POST /api/communities/:slug/members/:userId/promote
 */
export const promoteMemberToAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const { slug, userId } = req.params;

    // Get community and check if requester is admin
    const communityResult = await pool.query(`
      SELECT c.id, c.created_by, cm.role
      FROM public.communities c
      LEFT JOIN public.community_members cm ON c.id = cm.community_id AND cm.user_id = $1
      WHERE c.slug = $2
    `, [user.id, slug]);

    if (communityResult.rows.length === 0) {
      notFoundResponse(res, 'Community not found');
      return;
    }

    const { id: communityId, created_by, role } = communityResult.rows[0];

    // Only creator or admin can promote members
    if (created_by !== user.id && role !== 'admin') {
      forbiddenResponse(res, 'Only admins can promote members');
      return;
    }

    // Check if target user is a member
    const targetMemberResult = await pool.query(
      'SELECT role FROM public.community_members WHERE community_id = $1 AND user_id = $2',
      [communityId, userId]
    );

    if (targetMemberResult.rows.length === 0) {
      errorResponse(res, 'User is not a member of this community', 400);
      return;
    }

    if (targetMemberResult.rows[0].role === 'admin') {
      errorResponse(res, 'User is already an admin', 400);
      return;
    }

    // Promote to admin
    await pool.query(
      'UPDATE public.community_members SET role = $1 WHERE community_id = $2 AND user_id = $3',
      ['admin', communityId, userId]
    );

    successResponse(res, null, 'Member successfully promoted to admin');
  } catch (error) {
    console.error('Promote member error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Demote admin to member
 * POST /api/communities/:slug/members/:userId/demote
 */
export const demoteAdminToMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const { slug, userId } = req.params;

    // Get community and check if requester is creator
    const communityResult = await pool.query(`
      SELECT c.id, c.created_by
      FROM public.communities c
      WHERE c.slug = $1
    `, [slug]);

    if (communityResult.rows.length === 0) {
      notFoundResponse(res, 'Community not found');
      return;
    }

    const { id: communityId, created_by } = communityResult.rows[0];

    // Only creator can demote admins
    if (created_by !== user.id) {
      forbiddenResponse(res, 'Only the community creator can demote admins');
      return;
    }

    // Cannot demote yourself
    if (userId === user.id.toString()) {
      errorResponse(res, 'You cannot demote yourself', 400);
      return;
    }

    // Check if target user is an admin
    const targetMemberResult = await pool.query(
      'SELECT role FROM public.community_members WHERE community_id = $1 AND user_id = $2',
      [communityId, userId]
    );

    if (targetMemberResult.rows.length === 0) {
      errorResponse(res, 'User is not a member of this community', 400);
      return;
    }

    if (targetMemberResult.rows[0].role !== 'admin') {
      errorResponse(res, 'User is not an admin', 400);
      return;
    }

    // Demote to member
    await pool.query(
      'UPDATE public.community_members SET role = $1 WHERE community_id = $2 AND user_id = $3',
      ['member', communityId, userId]
    );

    successResponse(res, null, 'Admin successfully demoted to member');
  } catch (error) {
    console.error('Demote admin error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Update community basic information
 * PUT /api/communities/:slug
 */
export const updateCommunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const { slug } = req.params;
    const { name, description, category, location, avatar_url } = req.body;

    // Get community and check if requester is admin
    const communityResult = await pool.query(`
      SELECT c.id, c.created_by, cm.role
      FROM public.communities c
      LEFT JOIN public.community_members cm ON c.id = cm.community_id AND cm.user_id = $1
      WHERE c.slug = $2
    `, [user.id, slug]);

    if (communityResult.rows.length === 0) {
      notFoundResponse(res, 'Community not found');
      return;
    }

    const { id: communityId, created_by, role } = communityResult.rows[0];

    // Only creator or admin can update community info
    if (created_by !== user.id && role !== 'admin') {
      forbiddenResponse(res, 'Only admins can update community information');
      return;
    }

    // Validate required fields
    if (!name || name.trim().length < 3) {
      errorResponse(res, 'Nama komunitas minimal 3 karakter', 400);
      return;
    }

    if (!description || description.trim().length < 10) {
      errorResponse(res, 'Deskripsi minimal 10 karakter', 400);
      return;
    }

    // Update community
    const updateResult = await pool.query(`
      UPDATE public.communities 
      SET name = $1, description = $2, category = $3, location = $4, avatar_url = COALESCE($5, avatar_url)
      WHERE id = $6
      RETURNING id, name, slug, description, category, location, avatar_url
    `, [name.trim(), description.trim(), category, location || null, avatar_url, communityId]);

    successResponse(res, updateResult.rows[0], 'Community updated successfully');
  } catch (error) {
    console.error('Update community error:', error);
    errorResponse(res, 'Server error');
  }
};

/**
 * Update community about information
 * PUT /api/communities/:slug/about
 */
export const updateCommunityAbout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      forbiddenResponse(res, 'Authentication required');
      return;
    }

    const { slug } = req.params;
    const { vision, mission, target_members, benefits } = req.body;

    // Get community and check if requester is admin
    const communityResult = await pool.query(`
      SELECT c.id, c.created_by, cm.role
      FROM public.communities c
      LEFT JOIN public.community_members cm ON c.id = cm.community_id AND cm.user_id = $1
      WHERE c.slug = $2
    `, [user.id, slug]);

    if (communityResult.rows.length === 0) {
      notFoundResponse(res, 'Community not found');
      return;
    }

    const { id: communityId, created_by, role } = communityResult.rows[0];

    // Only creator or admin can update about info
    if (created_by !== user.id && role !== 'admin') {
      forbiddenResponse(res, 'Only admins can update community information');
      return;
    }

    // Update community about fields
    const updateResult = await pool.query(`
      UPDATE public.communities 
      SET vision = $1, mission = $2, target_members = $3, benefits = $4
      WHERE id = $5
      RETURNING vision, mission, target_members, benefits
    `, [vision, mission, target_members, benefits, communityId]);

    successResponse(res, updateResult.rows[0], 'Community about information updated successfully');
  } catch (error) {
    console.error('Update community about error:', error);
    errorResponse(res, 'Server error');
  }
};
