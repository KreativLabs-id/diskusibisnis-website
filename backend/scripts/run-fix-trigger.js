const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Check if DATABASE_URL is from a cloud provider that requires SSL
const isCloudDatabase = process.env.DATABASE_URL?.includes('supabase') || 
                        process.env.DATABASE_URL?.includes('neon') ||
                        process.env.DATABASE_URL?.includes('railway') ||
                        process.env.DATABASE_URL?.includes('render');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isCloudDatabase ? {
    rejectUnauthorized: false
  } : false
});

async function runSqlFile() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Fixing accepted answer notification trigger...\n');
    
    const sqlFile = path.join(__dirname, 'fix-accepted-answer-trigger.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await client.query(sql);
    
    console.log('✅ Trigger fixed successfully!');
    console.log('\nChanges made:');
    console.log('- Dropped old trigger and function');
    console.log('- Created new function without "data" column');
    console.log('- Created trigger for accepted answer notifications');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runSqlFile().catch(console.error);
