-- Add images column to questions table
ALTER TABLE public.questions 
ADD COLUMN images JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.questions.images IS 'Array of image URLs uploaded for the question, stored as JSONB';

-- Create index for faster queries on images
CREATE INDEX idx_questions_images ON public.questions USING GIN (images);
