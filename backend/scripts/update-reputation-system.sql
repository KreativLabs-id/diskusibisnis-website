-- ============================================
-- UPDATE REPUTATION SYSTEM
-- ============================================
-- New point system:
-- - Question upvote: +5
-- - Question downvote: -3
-- - Answer upvote (regular): +3
-- - Answer downvote: -1
-- - Accepted answer (best answer): +10
-- - Create question: +7 (NEW)
-- ============================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS vote_reputation_insert ON public.votes;
DROP TRIGGER IF EXISTS vote_reputation_update ON public.votes;
DROP TRIGGER IF EXISTS vote_reputation_delete ON public.votes;
DROP FUNCTION IF EXISTS update_vote_reputation();

-- Create new reputation function with updated point values
CREATE OR REPLACE FUNCTION update_vote_reputation()
RETURNS TRIGGER AS $$
DECLARE
    content_author_id UUID;
    vote_value INT;
BEGIN
    -- Determine vote value based on vote type
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        IF NEW.vote_type = 'upvote' THEN
            vote_value := 1;
        ELSE
            vote_value := -1;
        END IF;
    ELSE
        vote_value := 0;
    END IF;

    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        -- Get author of the content being voted on
        IF NEW.question_id IS NOT NULL THEN
            SELECT author_id INTO content_author_id 
            FROM public.questions WHERE id = NEW.question_id;
            
            -- Update reputation: +5 for question upvote, -3 for downvote
            IF content_author_id IS NOT NULL THEN
                IF NEW.vote_type = 'upvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 5)
                    WHERE id = content_author_id;
                ELSIF NEW.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points - 3)
                    WHERE id = content_author_id;
                END IF;
            END IF;
        ELSIF NEW.answer_id IS NOT NULL THEN
            SELECT author_id INTO content_author_id 
            FROM public.answers WHERE id = NEW.answer_id;
            
            -- Update reputation: +3 for answer upvote, -1 for downvote
            IF content_author_id IS NOT NULL THEN
                IF NEW.vote_type = 'upvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 3)
                    WHERE id = content_author_id;
                ELSIF NEW.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points - 1)
                    WHERE id = content_author_id;
                END IF;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle UPDATE (vote type changed)
    IF TG_OP = 'UPDATE' AND OLD.vote_type != NEW.vote_type THEN
        -- Get author of the content
        IF NEW.question_id IS NOT NULL THEN
            SELECT author_id INTO content_author_id 
            FROM public.questions WHERE id = NEW.question_id;
            
            IF content_author_id IS NOT NULL THEN
                -- Reverse old vote
                IF OLD.vote_type = 'upvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points - 5)
                    WHERE id = content_author_id;
                ELSIF OLD.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 3)
                    WHERE id = content_author_id;
                END IF;
                
                -- Apply new vote
                IF NEW.vote_type = 'upvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 5)
                    WHERE id = content_author_id;
                ELSIF NEW.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points - 3)
                    WHERE id = content_author_id;
                END IF;
            END IF;
        ELSIF NEW.answer_id IS NOT NULL THEN
            SELECT author_id INTO content_author_id 
            FROM public.answers WHERE id = NEW.answer_id;
            
            IF content_author_id IS NOT NULL THEN
                -- Reverse old vote
                IF OLD.vote_type = 'upvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points - 3)
                    WHERE id = content_author_id;
                ELSIF OLD.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 1)
                    WHERE id = content_author_id;
                END IF;
                
                -- Apply new vote
                IF NEW.vote_type = 'upvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 3)
                    WHERE id = content_author_id;
                ELSIF NEW.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points - 1)
                    WHERE id = content_author_id;
                END IF;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        -- Get author of the content
        IF OLD.question_id IS NOT NULL THEN
            SELECT author_id INTO content_author_id 
            FROM public.questions WHERE id = OLD.question_id;
            
            -- Reverse the vote
            IF content_author_id IS NOT NULL THEN
                IF OLD.vote_type = 'upvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points - 5)
                    WHERE id = content_author_id;
                ELSIF OLD.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 3)
                    WHERE id = content_author_id;
                END IF;
            END IF;
        ELSIF OLD.answer_id IS NOT NULL THEN
            SELECT author_id INTO content_author_id 
            FROM public.answers WHERE id = OLD.answer_id;
            
            IF content_author_id IS NOT NULL THEN
                IF OLD.vote_type = 'upvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points - 3)
                    WHERE id = content_author_id;
                ELSIF OLD.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 1)
                    WHERE id = content_author_id;
                END IF;
            END IF;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for vote reputation
CREATE TRIGGER vote_reputation_insert
    AFTER INSERT ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION update_vote_reputation();

CREATE TRIGGER vote_reputation_update
    AFTER UPDATE ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION update_vote_reputation();

CREATE TRIGGER vote_reputation_delete
    AFTER DELETE ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION update_vote_reputation();

-- ============================================
-- QUESTION CREATION BONUS (+7 points)
-- ============================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS question_creation_reputation ON public.questions;
DROP FUNCTION IF EXISTS add_question_reputation();

-- Create function for question creation bonus
CREATE OR REPLACE FUNCTION add_question_reputation()
RETURNS TRIGGER AS $$
BEGIN
    -- Add +7 points when user creates a question
    UPDATE public.users 
    SET reputation_points = reputation_points + 7
    WHERE id = NEW.author_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for question creation
CREATE TRIGGER question_creation_reputation
    AFTER INSERT ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION add_question_reputation();

-- ============================================
-- ACCEPTED ANSWER BONUS (+10 points)
-- ============================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS accepted_answer_reputation ON public.answers;
DROP FUNCTION IF EXISTS update_accepted_answer_reputation();

-- Create function for accepted answer bonus
CREATE OR REPLACE FUNCTION update_accepted_answer_reputation()
RETURNS TRIGGER AS $$
BEGIN
    -- When answer is marked as accepted
    IF NEW.is_accepted = true AND (OLD.is_accepted IS NULL OR OLD.is_accepted = false) THEN
        -- Add +10 points to answer author
        UPDATE public.users 
        SET reputation_points = reputation_points + 10
        WHERE id = NEW.author_id;
    END IF;
    
    -- When answer is unmarked as accepted
    IF NEW.is_accepted = false AND OLD.is_accepted = true THEN
        -- Remove +10 points from answer author
        UPDATE public.users 
        SET reputation_points = GREATEST(0, reputation_points - 10)
        WHERE id = NEW.author_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for accepted answer
CREATE TRIGGER accepted_answer_reputation
    AFTER UPDATE ON public.answers
    FOR EACH ROW
    EXECUTE FUNCTION update_accepted_answer_reputation();

-- ============================================
-- Summary of reputation system:
-- ============================================
-- Create question: +7
-- Question upvote: +5
-- Question downvote: -3
-- Answer upvote: +3
-- Answer downvote: -1
-- Accepted answer: +10
-- ============================================
-- Badge tiers:
-- Newbie: 0-249
-- Expert: 250-999
-- Master: 1000-4999
-- Legend: 5000+
-- ============================================
