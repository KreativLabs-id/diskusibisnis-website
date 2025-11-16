-- ========================================
-- Migration: Add images column to questions table
-- ========================================
-- This script adds support for image uploads in questions

-- 1. Add images column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'questions' 
    AND column_name = 'images'
  ) THEN
    ALTER TABLE public.questions ADD COLUMN images JSONB DEFAULT NULL;
    RAISE NOTICE 'Column images added successfully';
  ELSE
    RAISE NOTICE 'Column images already exists';
  END IF;
END $$;

-- 2. Add comment to describe the column
COMMENT ON COLUMN public.questions.images IS 'Array of image URLs uploaded for the question, stored as JSONB';

-- 3. Create GIN index for better JSONB query performance
CREATE INDEX IF NOT EXISTS idx_questions_images ON public.questions USING GIN (images);

-- 4. Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'questions' 
AND column_name = 'images';

-- 5. Check if index was created
SELECT 
  indexname, 
  indexdef 
FROM pg_indexes 
WHERE tablename = 'questions' 
AND indexname = 'idx_questions_images';
