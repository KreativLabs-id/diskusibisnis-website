-- Add indexes to improve query performance
-- Run this SQL script on your PostgreSQL database

-- Index for questions queries
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_views_count ON public.questions(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_questions_community_id ON public.questions(community_id);
CREATE INDEX IF NOT EXISTS idx_questions_author_id ON public.questions(author_id);

-- Index for answers
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_is_accepted ON public.answers(is_accepted) WHERE is_accepted = true;
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON public.answers(author_id);

-- Index for votes
CREATE INDEX IF NOT EXISTS idx_votes_question_id ON public.votes(question_id);
CREATE INDEX IF NOT EXISTS idx_votes_answer_id ON public.votes(answer_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_vote_type ON public.votes(vote_type);
CREATE INDEX IF NOT EXISTS idx_votes_question_type ON public.votes(question_id, vote_type);

-- Index for question_tags
CREATE INDEX IF NOT EXISTS idx_question_tags_question_id ON public.question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag_id ON public.question_tags(tag_id);

-- Index for tags
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);

-- Index for users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_verified ON public.users(is_verified);

-- Index for communities
CREATE INDEX IF NOT EXISTS idx_communities_slug ON public.communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_is_popular ON public.communities(is_popular);

-- Index for community_members
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community_id ON public.community_members(community_id);

-- Index for comments
CREATE INDEX IF NOT EXISTS idx_comments_commentable_id ON public.comments(commentable_id);
CREATE INDEX IF NOT EXISTS idx_comments_commentable_type ON public.comments(commentable_type);

-- Index for bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_question_id ON public.bookmarks(question_id);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Composite indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_community_created ON public.questions(community_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_question_vote_type ON public.votes(question_id, vote_type);
CREATE INDEX IF NOT EXISTS idx_answers_question_accepted ON public.answers(question_id, is_accepted);

ANALYZE public.questions;
ANALYZE public.answers;
ANALYZE public.votes;
ANALYZE public.users;
ANALYZE public.tags;
ANALYZE public.question_tags;
