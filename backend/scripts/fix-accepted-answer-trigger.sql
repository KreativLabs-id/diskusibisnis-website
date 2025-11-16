-- Fix accepted answer notification trigger
-- Drop old trigger and function (CASCADE to drop dependent triggers)
DROP TRIGGER IF EXISTS trigger_accepted_answer_notification ON answers;
DROP TRIGGER IF EXISTS accepted_answer_notification ON answers;
DROP FUNCTION IF EXISTS create_accepted_answer_notification() CASCADE;

-- Create new function that matches the current notifications table structure
CREATE OR REPLACE FUNCTION create_accepted_answer_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create notification when answer is being accepted (not unaccepted)
    IF NEW.is_accepted = TRUE AND (OLD.is_accepted IS NULL OR OLD.is_accepted = FALSE) THEN
        -- Insert notification for answer author when their answer is accepted
        INSERT INTO notifications (user_id, type, title, message, link)
        SELECT 
            NEW.author_id,
            'accepted_answer',
            'Jawaban Anda diterima!',
            'Jawaban Anda pada pertanyaan "' || q.title || '" telah diterima sebagai jawaban terbaik',
            '/questions/' || q.id
        FROM questions q 
        WHERE q.id = NEW.question_id 
          AND NEW.author_id != q.author_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_accepted_answer_notification
    AFTER UPDATE ON answers
    FOR EACH ROW
    WHEN (NEW.is_accepted IS DISTINCT FROM OLD.is_accepted)
    EXECUTE FUNCTION create_accepted_answer_notification();

-- Verify trigger is created
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_accepted_answer_notification';
