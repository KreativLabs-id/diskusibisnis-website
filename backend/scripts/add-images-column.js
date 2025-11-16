const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addImagesColumn() {
  try {
    console.log('🚀 Starting database migration: Adding images column to questions table...');
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if column already exists
      const checkResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'questions' 
        AND column_name = 'images'
      `);
      
      if (checkResult.rows.length > 0) {
        console.log('✅ Column "images" already exists in questions table');
        await client.query('ROLLBACK');
        return;
      }
      
      // Add images column
      await client.query(`
        ALTER TABLE public.questions 
        ADD COLUMN images JSONB DEFAULT NULL
      `);
      console.log('✅ Added "images" column to questions table');
      
      // Add comment
      await client.query(`
        COMMENT ON COLUMN public.questions.images IS 'Array of image URLs uploaded for the question, stored as JSONB'
      `);
      console.log('✅ Added column comment');
      
      // Create GIN index for JSONB
      await client.query(`
        CREATE INDEX idx_questions_images ON public.questions USING GIN (images)
      `);
      console.log('✅ Created GIN index on images column');
      
      await client.query('COMMIT');
      console.log('✨ Migration completed successfully!');
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

addImagesColumn();
