/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable no-console */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting mentions system migration...\n');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'add-mentions-system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute SQL
    console.log('📝 Executing migration...');
    await client.query(sql);
    
    console.log('✅ Migration completed successfully!\n');
    console.log('Created:');
    console.log('  - mentions table');
    console.log('  - username column in users table');
    console.log('  - Mention notification triggers');
    console.log('  - search_users_by_username function');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
