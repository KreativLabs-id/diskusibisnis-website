-- ============================================
-- PRODUCTION MIGRATION: Update votes table structure
-- Run this ONLY ONCE on production database
-- ============================================

-- Step 1: Add new columns if they don't exist
ALTER TABLE IF EXISTS public.votes 
ADD COLUMN IF NOT EXISTS question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS answer_id UUID REFERENCES public.answers(id) ON DELETE CASCADE;

-- Step 2: Migrate data from old columns to new columns (if old columns exist)
DO $$ 
BEGIN
    -- Check if old columns exist and migrate data
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'votes' AND column_name = 'votable_id') THEN
        
        -- Migrate question votes
        UPDATE public.votes 
        SET question_id = votable_id::UUID
        WHERE votable_type = 'question' AND question_id IS NULL;
        
        -- Migrate answer votes
        UPDATE public.votes 
        SET answer_id = votable_id::UUID
        WHERE votable_type = 'answer' AND answer_id IS NULL;
        
        RAISE NOTICE 'Data migration completed';
    END IF;
END $$;

-- Step 3: Drop old triggers that reference old columns
DROP TRIGGER IF EXISTS update_vote_count ON public.votes;
DROP TRIGGER IF EXISTS vote_reputation_trigger ON public.votes;
DROP FUNCTION IF EXISTS update_vote_count() CASCADE;
DROP FUNCTION IF EXISTS update_vote_reputation_old() CASCADE;

-- Step 4: Create new reputation trigger function
CREATE OR REPLACE FUNCTION update_vote_reputation()
RETURNS TRIGGER AS $$
DECLARE
    content_author_id UUID;
    vote_value INTEGER;
BEGIN
    -- Determine vote value
    IF NEW.vote_type = 'upvote' THEN
        vote_value := 1;
    ELSIF NEW.vote_type = 'downvote' THEN
        vote_value := -1;
    ELSE
        vote_value := 0;
    END IF;

    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        -- Get author of the content being voted on
        IF NEW.question_id IS NOT NULL THEN
            SELECT author_id INTO content_author_id 
            FROM public.questions WHERE id = NEW.question_id;
            
            -- Update reputation: +5 for question upvote, -2 for downvote
            IF content_author_id IS NOT NULL THEN
                IF NEW.vote_type = 'upvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 5)
                    WHERE id = content_author_id;
                ELSIF NEW.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points - 2)
                    WHERE id = content_author_id;
                END IF;
            END IF;
        ELSIF NEW.answer_id IS NOT NULL THEN
            SELECT author_id INTO content_author_id 
            FROM public.answers WHERE id = NEW.answer_id;
            
            -- Update reputation: +10 for answer upvote, -2 for downvote
            IF content_author_id IS NOT NULL THEN
                IF NEW.vote_type = 'upvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 10)
                    WHERE id = content_author_id;
                ELSIF NEW.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points - 2)
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
                    SET reputation_points = GREATEST(0, reputation_points + 2)
                    WHERE id = content_author_id;
                END IF;
                
                -- Apply new vote
                IF NEW.vote_type = 'upvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 5)
                    WHERE id = content_author_id;
                ELSIF NEW.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points - 2)
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
                    SET reputation_points = GREATEST(0, reputation_points - 10)
                    WHERE id = content_author_id;
                ELSIF OLD.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 2)
                    WHERE id = content_author_id;
                END IF;
                
                -- Apply new vote
                IF NEW.vote_type = 'upvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 10)
                    WHERE id = content_author_id;
                ELSIF NEW.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points - 2)
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
                    SET reputation_points = GREATEST(0, reputation_points + 2)
                    WHERE id = content_author_id;
                END IF;
            END IF;
        ELSIF OLD.answer_id IS NOT NULL THEN
            SELECT author_id INTO content_author_id 
            FROM public.answers WHERE id = OLD.answer_id;
            
            IF content_author_id IS NOT NULL THEN
                IF OLD.vote_type = 'upvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points - 10)
                    WHERE id = content_author_id;
                ELSIF OLD.vote_type = 'downvote' THEN
                    UPDATE public.users 
                    SET reputation_points = GREATEST(0, reputation_points + 2)
                    WHERE id = content_author_id;
                END IF;
            END IF;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create triggers for the new function
CREATE TRIGGER vote_reputation_insert
    AFTER INSERT ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION update_vote_reputation();

CREATE TRIGGER vote_reputation_update
    AFTER UPDATE ON public.votes
    FOR EACH ROW
    WHEN (OLD.vote_type IS DISTINCT FROM NEW.vote_type)
    EXECUTE FUNCTION update_vote_reputation();

CREATE TRIGGER vote_reputation_delete
    AFTER DELETE ON public.votes
    FOR EACH ROW
    EXECUTE FUNCTION update_vote_reputation();

-- Step 6: Drop old columns (OPTIONAL - only after verifying everything works)
-- UNCOMMENT THESE LINES AFTER TESTING:
-- ALTER TABLE IF EXISTS public.votes DROP COLUMN IF EXISTS votable_id;
-- ALTER TABLE IF EXISTS public.votes DROP COLUMN IF EXISTS votable_type;

-- Step 7: Verification
DO $$ 
DECLARE
    vote_count INTEGER;
    question_col_exists BOOLEAN;
    answer_col_exists BOOLEAN;
BEGIN
    -- Check if new columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'votes' AND column_name = 'question_id'
    ) INTO question_col_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'votes' AND column_name = 'answer_id'
    ) INTO answer_col_exists;
    
    -- Count votes
    SELECT COUNT(*) INTO vote_count FROM public.votes;
    
    -- Print results
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE 'question_id column exists: %', question_col_exists;
    RAISE NOTICE 'answer_id column exists: %', answer_col_exists;
    RAISE NOTICE 'Total votes in database: %', vote_count;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  NEXT STEPS:';
    RAISE NOTICE '1. Test your application thoroughly';
    RAISE NOTICE '2. If everything works, run the DROP COLUMN statements (lines 182-183)';
END $$;
