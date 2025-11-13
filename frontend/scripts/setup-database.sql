-- ============================================
-- DISKUSIBISNIS - Complete Database Setup
-- Run this script to setup your database completely
-- Includes: Core tables, Communities, Bookmarks, Enhanced Reputation System
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    reputation_points INTEGER DEFAULT 0,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('guest', 'member', 'admin')),
    is_banned BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_reputation ON users(reputation_points DESC);

-- ============================================
-- COMMUNITIES SYSTEM
-- ============================================

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    avatar_url TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    members_count INTEGER DEFAULT 0,
    questions_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community members table
CREATE TABLE IF NOT EXISTS community_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(community_id, user_id)
);

-- ============================================
-- TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_tags_usage ON tags(usage_count DESC);

-- ============================================
-- QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
    view_count INTEGER DEFAULT 0,
    upvotes_count INTEGER DEFAULT 0,
    downvotes_count INTEGER DEFAULT 0,
    answers_count INTEGER DEFAULT 0,
    has_accepted_answer BOOLEAN DEFAULT FALSE,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_author ON questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_community ON questions(community_id);
CREATE INDEX IF NOT EXISTS idx_questions_created ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_upvotes ON questions(upvotes_count DESC);
CREATE INDEX IF NOT EXISTS idx_questions_views ON questions(view_count DESC);

-- ============================================
-- QUESTION_TAGS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS question_tags (
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_question_tags_question ON question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag ON question_tags(tag_id);

-- ============================================
-- ANSWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    upvotes_count INTEGER DEFAULT 0,
    downvotes_count INTEGER DEFAULT 0,
    is_accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author ON answers(author_id);
CREATE INDEX IF NOT EXISTS idx_answers_accepted ON answers(is_accepted);
CREATE INDEX IF NOT EXISTS idx_answers_created ON answers(created_at DESC);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commentable_type VARCHAR(20) NOT NULL CHECK (commentable_type IN ('question', 'answer')),
    commentable_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_commentable ON comments(commentable_type, commentable_id);

-- ============================================
-- VOTES TABLE (Enhanced Structure)
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES answers(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, question_id),
    UNIQUE(user_id, answer_id),
    CHECK ((question_id IS NOT NULL AND answer_id IS NULL) OR (question_id IS NULL AND answer_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_question ON votes(question_id);
CREATE INDEX IF NOT EXISTS idx_votes_answer ON votes(answer_id);

-- ============================================
-- BOOKMARKS SYSTEM
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_question_id ON bookmarks(question_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);

-- ============================================
-- CREATE INDEXES FOR COMMUNITIES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_communities_category ON communities(category);
CREATE INDEX IF NOT EXISTS idx_communities_popular ON communities(is_popular);
CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_communities_updated_at ON communities;
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tags_updated_at ON tags;
CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_answers_updated_at ON answers;
CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENHANCED REPUTATION SYSTEM
-- ============================================

-- Enhanced reputation function for answer acceptance
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
    -- When answer is accepted: +15 points to answer author
    IF TG_OP = 'UPDATE' AND NEW.is_accepted = TRUE AND OLD.is_accepted = FALSE THEN
        UPDATE users SET reputation_points = reputation_points + 15 
        WHERE id = NEW.author_id;
        
        -- Also give +2 points to question author for accepting answer
        UPDATE users SET reputation_points = reputation_points + 2 
        WHERE id = (SELECT author_id FROM questions WHERE id = NEW.question_id);
    END IF;
    
    -- When answer is unaccepted: -15 points from answer author
    IF TG_OP = 'UPDATE' AND NEW.is_accepted = FALSE AND OLD.is_accepted = TRUE THEN
        UPDATE users SET reputation_points = reputation_points - 15 
        WHERE id = NEW.author_id;
        
        -- Also remove +2 points from question author
        UPDATE users SET reputation_points = reputation_points - 2 
        WHERE id = (SELECT author_id FROM questions WHERE id = NEW.question_id);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Vote reputation function
CREATE OR REPLACE FUNCTION update_vote_reputation()
RETURNS TRIGGER AS $$
BEGIN
    -- When upvote is added
    IF TG_OP = 'INSERT' AND NEW.vote_type = 'upvote' THEN
        IF NEW.question_id IS NOT NULL THEN
            -- +5 points for question upvote
            UPDATE users SET reputation_points = reputation_points + 5 
            WHERE id = (SELECT author_id FROM questions WHERE id = NEW.question_id);
        ELSIF NEW.answer_id IS NOT NULL THEN
            -- +10 points for answer upvote
            UPDATE users SET reputation_points = reputation_points + 10 
            WHERE id = (SELECT author_id FROM answers WHERE id = NEW.answer_id);
        END IF;
    END IF;
    
    -- When downvote is added
    IF TG_OP = 'INSERT' AND NEW.vote_type = 'downvote' THEN
        IF NEW.question_id IS NOT NULL THEN
            -- -2 points for question downvote
            UPDATE users SET reputation_points = reputation_points - 2 
            WHERE id = (SELECT author_id FROM questions WHERE id = NEW.question_id);
        ELSIF NEW.answer_id IS NOT NULL THEN
            -- -2 points for answer downvote
            UPDATE users SET reputation_points = reputation_points - 2 
            WHERE id = (SELECT author_id FROM answers WHERE id = NEW.answer_id);
        END IF;
    END IF;
    
    -- When vote is removed
    IF TG_OP = 'DELETE' THEN
        IF OLD.vote_type = 'upvote' THEN
            IF OLD.question_id IS NOT NULL THEN
                -- Remove +5 points for question upvote
                UPDATE users SET reputation_points = reputation_points - 5 
                WHERE id = (SELECT author_id FROM questions WHERE id = OLD.question_id);
            ELSIF OLD.answer_id IS NOT NULL THEN
                -- Remove +10 points for answer upvote
                UPDATE users SET reputation_points = reputation_points - 10 
                WHERE id = (SELECT author_id FROM answers WHERE id = OLD.answer_id);
            END IF;
        ELSIF OLD.vote_type = 'downvote' THEN
            IF OLD.question_id IS NOT NULL THEN
                -- Remove -2 points for question downvote
                UPDATE users SET reputation_points = reputation_points + 2 
                WHERE id = (SELECT author_id FROM questions WHERE id = OLD.question_id);
            ELSIF OLD.answer_id IS NOT NULL THEN
                -- Remove -2 points for answer downvote
                UPDATE users SET reputation_points = reputation_points + 2 
                WHERE id = (SELECT author_id FROM answers WHERE id = OLD.answer_id);
            END IF;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Question/answer creation reputation function
CREATE OR REPLACE FUNCTION update_content_reputation()
RETURNS TRIGGER AS $$
BEGIN
    -- When question is created: +1 point
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'questions' THEN
        UPDATE users SET reputation_points = reputation_points + 1 
        WHERE id = NEW.author_id;
    END IF;
    
    -- When answer is created: +2 points
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'answers' THEN
        UPDATE users SET reputation_points = reputation_points + 2 
        WHERE id = NEW.author_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure reputation points never go below 0
CREATE OR REPLACE FUNCTION ensure_positive_reputation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reputation_points < 0 THEN
        NEW.reputation_points = 0;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- FUNCTION: Update tag usage count
-- ============================================
CREATE OR REPLACE FUNCTION update_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- ============================================
-- FUNCTION: Update community counts
-- ============================================
CREATE OR REPLACE FUNCTION update_community_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update members count
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'community_members' THEN
        UPDATE communities SET members_count = members_count + 1 
        WHERE id = NEW.community_id;
    ELSIF TG_OP = 'DELETE' AND TG_TABLE_NAME = 'community_members' THEN
        UPDATE communities SET members_count = members_count - 1 
        WHERE id = OLD.community_id;
    END IF;
    
    -- Update questions count
    IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'questions' AND NEW.community_id IS NOT NULL THEN
        UPDATE communities SET questions_count = questions_count + 1 
        WHERE id = NEW.community_id;
    ELSIF TG_OP = 'DELETE' AND TG_TABLE_NAME = 'questions' AND OLD.community_id IS NOT NULL THEN
        UPDATE communities SET questions_count = questions_count - 1 
        WHERE id = OLD.community_id;
    ELSIF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'questions' THEN
        -- Handle community change
        IF OLD.community_id IS NOT NULL AND NEW.community_id IS NULL THEN
            UPDATE communities SET questions_count = questions_count - 1 
            WHERE id = OLD.community_id;
        ELSIF OLD.community_id IS NULL AND NEW.community_id IS NOT NULL THEN
            UPDATE communities SET questions_count = questions_count + 1 
            WHERE id = NEW.community_id;
        ELSIF OLD.community_id IS NOT NULL AND NEW.community_id IS NOT NULL AND OLD.community_id != NEW.community_id THEN
            UPDATE communities SET questions_count = questions_count - 1 
            WHERE id = OLD.community_id;
            UPDATE communities SET questions_count = questions_count + 1 
            WHERE id = NEW.community_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- ============================================
-- CREATE ALL TRIGGERS
-- ============================================

-- Reputation triggers
DROP TRIGGER IF EXISTS answer_accepted_reputation ON answers;
CREATE TRIGGER answer_accepted_reputation AFTER UPDATE ON answers
    FOR EACH ROW EXECUTE FUNCTION update_user_reputation();

DROP TRIGGER IF EXISTS vote_reputation ON votes;
CREATE TRIGGER vote_reputation AFTER INSERT OR DELETE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_vote_reputation();

DROP TRIGGER IF EXISTS question_creation_reputation ON questions;
CREATE TRIGGER question_creation_reputation AFTER INSERT ON questions
    FOR EACH ROW EXECUTE FUNCTION update_content_reputation();

DROP TRIGGER IF EXISTS answer_creation_reputation ON answers;
CREATE TRIGGER answer_creation_reputation AFTER INSERT ON answers
    FOR EACH ROW EXECUTE FUNCTION update_content_reputation();

DROP TRIGGER IF EXISTS ensure_positive_reputation ON users;
CREATE TRIGGER ensure_positive_reputation BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION ensure_positive_reputation();

-- Tag usage trigger
DROP TRIGGER IF EXISTS tag_usage_counter ON question_tags;
CREATE TRIGGER tag_usage_counter AFTER INSERT OR DELETE ON question_tags
    FOR EACH ROW EXECUTE FUNCTION update_tag_usage();

-- Community counts triggers
DROP TRIGGER IF EXISTS community_members_count ON community_members;
CREATE TRIGGER community_members_count AFTER INSERT OR DELETE ON community_members
    FOR EACH ROW EXECUTE FUNCTION update_community_counts();

DROP TRIGGER IF EXISTS community_questions_count ON questions;
CREATE TRIGGER community_questions_count AFTER INSERT OR UPDATE OR DELETE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_community_counts();

-- ============================================
-- SEED DATA: Default Tags
-- ============================================
INSERT INTO tags (name, slug, description) VALUES
    ('Pajak', 'pajak', 'Pertanyaan seputar perpajakan UMKM'),
    ('Marketing', 'marketing', 'Strategi pemasaran dan promosi bisnis'),
    ('Legalitas', 'legalitas', 'Aspek hukum dan perizinan usaha'),
    ('Keuangan', 'keuangan', 'Pengelolaan keuangan dan akuntansi'),
    ('SDM', 'sdm', 'Manajemen sumber daya manusia'),
    ('Operasional', 'operasional', 'Operasional dan manajemen bisnis harian'),
    ('Digital', 'digital', 'Transformasi digital dan teknologi'),
    ('Modal', 'modal', 'Permodalan dan pendanaan usaha'),
    ('Ekspor', 'ekspor', 'Ekspor dan perdagangan internasional'),
    ('Teknologi', 'teknologi', 'Teknologi dan inovasi untuk UMKM')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: Sample Communities
-- ============================================
INSERT INTO communities (name, slug, description, category, location, is_popular, members_count, questions_count) VALUES
    ('UMKM Jakarta', 'umkm-jakarta', 'Komunitas pelaku UMKM di Jakarta dan sekitarnya', 'Regional', 'Jakarta', true, 150, 45),
    ('Digital Marketing UMKM', 'digital-marketing-umkm', 'Berbagi tips dan strategi digital marketing untuk UMKM', 'Marketing', NULL, true, 230, 78),
    ('Kuliner Nusantara', 'kuliner-nusantara', 'Komunitas pelaku usaha kuliner tradisional dan modern', 'Industri', NULL, false, 89, 23),
    ('Ekspor Import Indonesia', 'ekspor-import-indonesia', 'Forum diskusi untuk pelaku ekspor import', 'Perdagangan', NULL, false, 67, 18),
    ('Fintech untuk UMKM', 'fintech-untuk-umkm', 'Diskusi seputar teknologi finansial untuk UMKM', 'Teknologi', NULL, false, 112, 34)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DISKUSIBISNIS DATABASE SETUP COMPLETED!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '- Users, Communities, Community Members';
    RAISE NOTICE '- Tags, Questions, Question Tags';
    RAISE NOTICE '- Answers, Comments, Votes';
    RAISE NOTICE '- Bookmarks, Notifications';
    RAISE NOTICE '';
    RAISE NOTICE 'Features enabled:';
    RAISE NOTICE '- Enhanced reputation system';
    RAISE NOTICE '- Automatic vote counting';
    RAISE NOTICE '- Community member/question counting';
    RAISE NOTICE '- Tag usage tracking';
    RAISE NOTICE '- Automatic timestamps';
    RAISE NOTICE '';
    RAISE NOTICE 'Seed data added:';
    RAISE NOTICE '- 10 default tags';
    RAISE NOTICE '- 5 sample communities';
    RAISE NOTICE '';
    RAISE NOTICE 'Your database is ready to use!';
    RAISE NOTICE '============================================';
END $$;
