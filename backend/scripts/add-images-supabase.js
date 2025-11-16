// Add images column using Supabase client
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addImagesColumn() {
  try {
    console.log('🔍 Checking and adding images column...');
    
    // Try to add the column (will fail if already exists, but that's ok)
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          -- Add column if not exists
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'questions' 
            AND column_name = 'images'
          ) THEN
            ALTER TABLE public.questions ADD COLUMN images JSONB DEFAULT NULL;
            COMMENT ON COLUMN public.questions.images IS 'Array of image URLs uploaded for the question, stored as JSONB';
            CREATE INDEX idx_questions_images ON public.questions USING GIN (images);
            RAISE NOTICE 'Column images added successfully';
          ELSE
            RAISE NOTICE 'Column images already exists';
          END IF;
        END $$;
      `
    });

    if (error) {
      console.log('⚠️  RPC method not available, trying direct query...');
      console.log('Please run this SQL manually in Supabase SQL Editor:');
      console.log(`
-- Add images column if not exists
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.questions.images IS 'Array of image URLs uploaded for the question, stored as JSONB';

-- Create index
CREATE INDEX IF NOT EXISTS idx_questions_images ON public.questions USING GIN (images);
      `);
    } else {
      console.log('✅ Success!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:');
    console.log(`
-- Add images column if not exists
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.questions.images IS 'Array of image URLs uploaded for the question, stored as JSONB';

-- Create index
CREATE INDEX IF NOT EXISTS idx_questions_images ON public.questions USING GIN (images);
    `);
  }
}

addImagesColumn();
