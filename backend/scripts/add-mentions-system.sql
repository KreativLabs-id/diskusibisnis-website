-- ============================================
-- MENTIONS SYSTEM - Add @username tagging
-- ============================================
-- Features:
-- ✅ Store mentions in questions, answers, comments
-- ✅ Automatic notification when tagged
-- ✅ Track mention context
-- ============================================

-- Create mentions table
CREATE TABLE IF NOT EXISTS mentions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentioner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('question', 'answer', 'comment')),
    content_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_mentions_mentioned_user ON mentions(mentioned_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mentions_content ON mentions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_mentions_mentioner ON mentions(mentioner_id);

-- Add username column to users for easy mention lookup (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
        
        -- Generate usernames from display_name for existing users
        UPDATE users SET username = LOWER(REGEXP_REPLACE(display_name, '[^a-zA-Z0-9]', '', 'g'));
        
        -- Make username NOT NULL after populating
        ALTER TABLE users ALTER COLUMN username SET NOT NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Function to create mention notification
CREATE OR REPLACE FUNCTION notify_user_mention()
RETURNS TRIGGER AS $$
DECLARE
    mentioner_name VARCHAR(100);
    content_title TEXT;
    notification_link TEXT;
BEGIN
    -- Get mentioner's display name
    SELECT display_name INTO mentioner_name
    FROM users
    WHERE id = NEW.mentioner_id;

    -- Build notification based on content type
    IF NEW.content_type = 'question' THEN
        SELECT title INTO content_title
        FROM questions
        WHERE id = NEW.content_id;
        
        notification_link := '/questions/' || NEW.content_id;
        
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (
            NEW.mentioned_user_id,
            'mention',
            mentioner_name || ' mentioned you in a question',
            'in "' || content_title || '"',
            notification_link
        );
        
    ELSIF NEW.content_type = 'answer' THEN
        SELECT q.title, a.id INTO content_title, notification_link
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        WHERE a.id = NEW.content_id;
        
        notification_link := '/questions/' || notification_link;
        
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (
            NEW.mentioned_user_id,
            'mention',
            mentioner_name || ' mentioned you in an answer',
            'in "' || content_title || '"',
            notification_link
        );
        
    ELSIF NEW.content_type = 'comment' THEN
        -- Get comment context (could be on question or answer)
        SELECT 
            CASE 
                WHEN c.question_id IS NOT NULL THEN q.title
                ELSE q2.title
            END,
            CASE 
                WHEN c.question_id IS NOT NULL THEN '/questions/' || c.question_id::TEXT
                ELSE '/questions/' || a.question_id::TEXT
            END
        INTO content_title, notification_link
        FROM comments c
        LEFT JOIN questions q ON c.question_id = q.id
        LEFT JOIN answers a ON c.answer_id = a.id
        LEFT JOIN questions q2 ON a.question_id = q2.id
        WHERE c.id = NEW.content_id;
        
        INSERT INTO notifications (user_id, type, title, message, link)
        VALUES (
            NEW.mentioned_user_id,
            'mention',
            mentioner_name || ' mentioned you in a comment',
            'in "' || content_title || '"',
            notification_link
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for mention notifications
DROP TRIGGER IF EXISTS trigger_mention_notification ON mentions;
CREATE TRIGGER trigger_mention_notification
    AFTER INSERT ON mentions
    FOR EACH ROW
    EXECUTE FUNCTION notify_user_mention();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to search users by display name (for autocomplete)
CREATE OR REPLACE FUNCTION search_users_by_username(search_term TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    username VARCHAR(50),
    display_name VARCHAR(100),
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.username, u.display_name, u.avatar_url
    FROM users u
    WHERE u.display_name ILIKE '%' || search_term || '%'
       OR (u.username IS NOT NULL AND u.username ILIKE search_term || '%')
    ORDER BY 
        CASE 
            WHEN u.display_name ILIKE search_term || '%' THEN 1
            WHEN u.display_name ILIKE '%' || search_term || '%' THEN 2
            ELSE 3
        END,
        u.reputation_points DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE QUERIES
-- ============================================

-- Get mentions for a user (with context)
-- SELECT m.*, u.display_name as mentioner_name, u.avatar_url as mentioner_avatar
-- FROM mentions m
-- JOIN users u ON m.mentioner_id = u.id
-- WHERE m.mentioned_user_id = 'USER_ID'
-- ORDER BY m.created_at DESC;

-- Search users for mention autocomplete
-- SELECT * FROM search_users_by_username('john', 5);
