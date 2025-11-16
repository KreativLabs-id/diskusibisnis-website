// Simple migration runner without pool
const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    // Check if column exists
    console.log('🔍 Checking if images column exists...');
    const checkResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'questions' 
      AND column_name = 'images'
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ Column "images" already exists');
      return;
    }

    console.log('📝 Adding images column...');
    await client.query(`
      ALTER TABLE public.questions 
      ADD COLUMN images JSONB DEFAULT NULL
    `);
    console.log('✅ Column added');

    console.log('📝 Adding comment...');
    await client.query(`
      COMMENT ON COLUMN public.questions.images IS 'Array of image URLs uploaded for the question, stored as JSONB'
    `);
    console.log('✅ Comment added');

    console.log('📝 Creating GIN index...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_images ON public.questions USING GIN (images)
    `);
    console.log('✅ Index created');

    console.log('✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
