const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running Google Auth migration...\n');

    // Add google_id column
    await client.query(`
      ALTER TABLE public.users 
      ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE
    `);
    console.log('✓ Added google_id column');

    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users(google_id)
    `);
    console.log('✓ Created index on google_id');

    // Check if password_hash has NOT NULL constraint and remove it
    const constraintCheck = await client.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password_hash'
    `);
    
    if (constraintCheck.rows[0]?.is_nullable === 'NO') {
      await client.query(`
        ALTER TABLE public.users 
        ALTER COLUMN password_hash DROP NOT NULL
      `);
      console.log('✓ Made password_hash nullable');
    } else {
      console.log('✓ password_hash already nullable');
    }

    console.log('\n✅ Google Auth migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
