// Check if images column exists
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkColumn() {
  try {
    console.log('🔍 Checking images column...');
    
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'questions' 
      AND column_name = 'images'
    `);

    if (result.rows.length > 0) {
      console.log('✅ Column "images" exists:', result.rows[0]);
      
      // Check a sample question
      const questionResult = await pool.query(`
        SELECT id, title, images 
        FROM public.questions 
        LIMIT 1
      `);
      
      if (questionResult.rows.length > 0) {
        console.log('\n📄 Sample question:', questionResult.rows[0]);
      }
    } else {
      console.log('❌ Column "images" does NOT exist');
      console.log('📝 Adding column now...\n');
      
      // Add the column
      await pool.query(`
        ALTER TABLE public.questions 
        ADD COLUMN images JSONB DEFAULT NULL
      `);
      console.log('✅ Column added');
      
      await pool.query(`
        COMMENT ON COLUMN public.questions.images IS 'Array of image URLs uploaded for the question, stored as JSONB'
      `);
      console.log('✅ Comment added');
      
      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_questions_images ON public.questions USING GIN (images)
      `);
      console.log('✅ Index created');
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkColumn();
