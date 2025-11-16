import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  body: any;
  params: any;
  query: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  slug?: string;
  author_id: string;
  community_id?: string;
  views_count: number;
  is_closed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Answer {
  id: string;
  content: string;
  question_id: string;
  author_id: string;
  is_accepted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  location?: string;
  avatar_url?: string;
  is_popular: boolean;
  created_at: Date;
}

export interface Comment {
  id: string;
  content: string;
  question_id?: string;
  answer_id?: string;
  author_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Vote {
  id: string;
  user_id: string;
  question_id?: string;
  answer_id?: string;
  vote_type: 'upvote' | 'downvote';
  created_at: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  usage_count: number;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  role: string;
  reputation_points: number;
  is_verified: boolean;
  is_banned: boolean;
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  related_id?: string;
  is_read: boolean;
  created_at: Date;
}

export interface Bookmark {
  id: string;
  user_id: string;
  question_id: string;
  created_at: Date;
}
