-- Quick check and add images column
DO $$
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'questions' 
        AND column_name = 'images'
    ) THEN
        -- Add column
        ALTER TABLE public.questions 
        ADD COLUMN images JSONB DEFAULT NULL;
        
        -- Add comment
        COMMENT ON COLUMN public.questions.images IS 'Array of image URLs uploaded for the question, stored as JSONB';
        
        -- Create index
        CREATE INDEX idx_questions_images ON public.questions USING GIN (images);
        
        RAISE NOTICE 'Successfully added images column';
    ELSE
        RAISE NOTICE 'Images column already exists';
    END IF;
END $$;
