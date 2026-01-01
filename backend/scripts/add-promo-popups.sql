-- ============================================
-- PROMO POPUPS - Database Schema
-- ============================================
-- This table stores promotional popups that can be shown
-- when users open the mobile/web app
-- 
-- Run this script in your database:
-- node scripts/run-sql.js add-promo-popups.sql
-- ============================================

-- Create promo_popups table
CREATE TABLE IF NOT EXISTS promo_popups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,                              -- Optional: URL to redirect when clicked
    link_type VARCHAR(50) DEFAULT 'external',   -- external, question, community, url
    description TEXT,
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,                         -- NULL = no end date
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,                 -- Higher = show first
    target_audience VARCHAR(50) DEFAULT 'all',  -- all, new_users, returning_users
    show_once_per_user BOOLEAN DEFAULT FALSE,   -- If true, show only once per user
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_promo_popups_active ON promo_popups(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_popups_dates ON promo_popups(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_promo_popups_priority ON promo_popups(priority DESC);

-- Table to track which users have seen which popups (for show_once_per_user)
CREATE TABLE IF NOT EXISTS promo_popup_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    popup_id UUID NOT NULL REFERENCES promo_popups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255),                     -- For non-logged in users
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    clicked BOOLEAN DEFAULT FALSE,
    UNIQUE(popup_id, user_id),
    UNIQUE(popup_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_popup_views_popup ON promo_popup_views(popup_id);
CREATE INDEX IF NOT EXISTS idx_popup_views_user ON promo_popup_views(user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_promo_popups_updated_at ON promo_popups;
CREATE TRIGGER update_promo_popups_updated_at 
BEFORE UPDATE ON promo_popups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- INSERT INTO promo_popups (title, image_url, link_url, description, start_date, end_date, priority) VALUES
-- (
--     'Promo Tahun Baru 2026',
--     'https://example.com/promo-tahun-baru.jpg',
--     '/communities/umkm-jakarta',
--     'Selamat Tahun Baru! Gabung komunitas UMKM Jakarta sekarang!',
--     '2026-01-01 00:00:00',
--     '2026-01-07 23:59:59',
--     10
-- );

DO $$
BEGIN
    RAISE NOTICE '✅ Promo Popups table created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Table: promo_popups';
    RAISE NOTICE '   - id, title, image_url, link_url, link_type';
    RAISE NOTICE '   - description, start_date, end_date';
    RAISE NOTICE '   - is_active, priority, target_audience';
    RAISE NOTICE '   - show_once_per_user, created_by';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Table: promo_popup_views';
    RAISE NOTICE '   - Tracks which users have seen which popups';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready to use!';
END $$;

-- ============================================
-- ANNOUNCEMENTS TABLE
-- ============================================
-- System-wide announcements/notes/warnings
-- Displayed as banners in the app
-- ============================================

CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'promo')),
    link_url TEXT,                              -- Optional: URL to redirect when clicked
    link_text VARCHAR(100),                     -- Text for the link button (e.g., "Learn More")
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,                         -- NULL = no end date
    is_active BOOLEAN DEFAULT TRUE,
    is_dismissible BOOLEAN DEFAULT TRUE,        -- Can user dismiss/close the banner?
    priority INTEGER DEFAULT 0,                 -- Higher = show first
    show_on VARCHAR(50) DEFAULT 'all',          -- all, home, questions, communities
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);

-- Table to track dismissed announcements
CREATE TABLE IF NOT EXISTS announcement_dismissals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(255),                     -- For non-logged in users
    dismissed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(announcement_id, user_id),
    UNIQUE(announcement_id, device_id)
);

CREATE INDEX IF NOT EXISTS idx_dismissals_announcement ON announcement_dismissals(announcement_id);
CREATE INDEX IF NOT EXISTS idx_dismissals_user ON announcement_dismissals(user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at 
BEFORE UPDATE ON announcements
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Announcements table created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Table: announcements';
    RAISE NOTICE '   - id, title, message, type (info/warning/success/error/promo)';
    RAISE NOTICE '   - link_url, link_text, start_date, end_date';
    RAISE NOTICE '   - is_active, is_dismissible, priority, show_on';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Table: announcement_dismissals';
    RAISE NOTICE '   - Tracks which users have dismissed which announcements';
END $$;
