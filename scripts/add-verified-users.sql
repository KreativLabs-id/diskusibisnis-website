-- Add verified user functionality
-- Run this in your PostgreSQL database

-- Add is_verified column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Auto-verify all admin users
UPDATE public.users 
SET is_verified = TRUE 
WHERE role = 'admin';

-- Create communities table if not exists
CREATE TABLE IF NOT EXISTS public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    slug VARCHAR(255) NOT NULL UNIQUE,
    is_banned BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_members table if not exists
CREATE TABLE IF NOT EXISTS public.community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- member, moderator, admin
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(community_id, user_id)
);

-- Add community_id to questions table if not exists
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_verified ON public.users(is_verified);
CREATE INDEX IF NOT EXISTS idx_communities_banned ON public.communities(is_banned);
CREATE INDEX IF NOT EXISTS idx_questions_community ON public.questions(community_id);

-- Insert some sample communities
INSERT INTO public.communities (name, description, slug, created_by) 
SELECT 
    'General Discussion',
    'Diskusi umum tentang bisnis dan UMKM',
    'general',
    u.id
FROM public.users u 
WHERE u.role = 'admin' 
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.communities (name, description, slug, created_by) 
SELECT 
    'Marketing & Sales',
    'Tips dan strategi marketing untuk UMKM',
    'marketing-sales',
    u.id
FROM public.users u 
WHERE u.role = 'admin' 
LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.communities (name, description, slug, created_by) 
SELECT 
    'Finance & Accounting',
    'Diskusi tentang keuangan dan akuntansi bisnis',
    'finance-accounting',
    u.id
FROM public.users u 
WHERE u.role = 'admin' 
LIMIT 1
ON CONFLICT (slug) DO NOTHING;
