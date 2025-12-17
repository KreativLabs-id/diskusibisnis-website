const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  console.log('🚀 Running reputation system update migration...\n');
  
  try {
    const sqlPath = path.join(__dirname, 'update-reputation-system.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 New Reputation System:');
    console.log('   • Create question: +7');
    console.log('   • Question upvote: +5');
    console.log('   • Question downvote: -3');
    console.log('   • Answer upvote: +3');
    console.log('   • Answer downvote: -1');
    console.log('   • Accepted answer: +10\n');
    console.log('🏆 Badge Tiers:');
    console.log('   • Newbie: 0-249');
    console.log('   • Expert: 250-999');
    console.log('   • Master: 1000-4999');
    console.log('   • Legend: 5000+\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
