-- ============================================
-- CLEANUP ORPHAN NOTIFICATIONS
-- Automatically delete notifications when related content is deleted
-- ============================================

-- Function to clean up notifications when a question is deleted
CREATE OR REPLACE FUNCTION cleanup_question_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete all notifications that link to this question
    DELETE FROM notifications 
    WHERE link LIKE '/questions/' || OLD.id::TEXT || '%';
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up notifications when an answer is deleted
CREATE OR REPLACE FUNCTION cleanup_answer_notifications()
RETURNS TRIGGER AS $$
DECLARE
    question_id UUID;
BEGIN
    -- Get the question_id from the deleted answer
    question_id := OLD.question_id;
    
    -- Delete notifications related to this answer
    -- (answer notifications usually link to the question, so we need to check by type and message content)
    DELETE FROM notifications 
    WHERE (
        -- Delete answer-type notifications that mention this answer
        (type = 'answer' AND link = '/questions/' || question_id::TEXT)
        OR
        -- Delete accepted_answer notifications for this answer author
        (type = 'accepted_answer' AND user_id = OLD.author_id AND link = '/questions/' || question_id::TEXT)
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up vote notifications when content is deleted
CREATE OR REPLACE FUNCTION cleanup_vote_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- For question votes
    IF OLD.question_id IS NOT NULL THEN
        DELETE FROM notifications 
        WHERE type = 'vote' 
        AND link = '/questions/' || OLD.question_id::TEXT;
    END IF;
    
    -- For answer votes - get the question_id from the answer
    IF OLD.answer_id IS NOT NULL THEN
        DELETE FROM notifications n
        USING answers a
        WHERE a.id = OLD.answer_id
        AND n.type = 'vote'
        AND n.link = '/questions/' || a.question_id::TEXT
        AND n.user_id = a.author_id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up mention notifications
CREATE OR REPLACE FUNCTION cleanup_mention_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete the notification for this mention
    DELETE FROM notifications 
    WHERE type = 'mention' 
    AND user_id = OLD.mentioned_user_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up comment notifications
CREATE OR REPLACE FUNCTION cleanup_comment_notifications()
RETURNS TRIGGER AS $$
DECLARE
    target_question_id UUID;
BEGIN
    -- Get the question_id based on commentable_type
    IF OLD.commentable_type = 'question' THEN
        target_question_id := OLD.commentable_id;
    ELSIF OLD.commentable_type = 'answer' THEN
        SELECT question_id INTO target_question_id 
        FROM answers 
        WHERE id = OLD.commentable_id;
    END IF;
    
    -- Delete comment notifications for this content
    IF target_question_id IS NOT NULL THEN
        DELETE FROM notifications 
        WHERE type = 'comment' 
        AND link = '/questions/' || target_question_id::TEXT;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE TRIGGERS
-- ============================================

-- Trigger for question deletion
DROP TRIGGER IF EXISTS cleanup_question_notifications_trigger ON questions;
CREATE TRIGGER cleanup_question_notifications_trigger
    BEFORE DELETE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_question_notifications();

-- Trigger for answer deletion
DROP TRIGGER IF EXISTS cleanup_answer_notifications_trigger ON answers;
CREATE TRIGGER cleanup_answer_notifications_trigger
    BEFORE DELETE ON answers
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_answer_notifications();

-- Trigger for vote deletion (when vote is removed)
DROP TRIGGER IF EXISTS cleanup_vote_notifications_trigger ON votes;
CREATE TRIGGER cleanup_vote_notifications_trigger
    BEFORE DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_vote_notifications();

-- Trigger for mention deletion
DROP TRIGGER IF EXISTS cleanup_mention_notifications_trigger ON mentions;
CREATE TRIGGER cleanup_mention_notifications_trigger
    BEFORE DELETE ON mentions
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_mention_notifications();

-- Trigger for comment deletion
DROP TRIGGER IF EXISTS cleanup_comment_notifications_trigger ON comments;
CREATE TRIGGER cleanup_comment_notifications_trigger
    BEFORE DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_comment_notifications();

-- ============================================
-- CLEANUP EXISTING ORPHAN NOTIFICATIONS
-- Run this once to clean up any existing orphan notifications
-- ============================================

-- Delete notifications linking to non-existent questions
DELETE FROM notifications 
WHERE link LIKE '/questions/%' 
AND link ~ '^/questions/[0-9a-f-]+$'
AND NOT EXISTS (
    SELECT 1 FROM questions 
    WHERE id::TEXT = SUBSTRING(link FROM '/questions/([0-9a-f-]+)')
);
