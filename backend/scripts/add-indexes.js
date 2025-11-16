const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addIndexes() {
  try {
    console.log('🔧 Adding database indexes...');
    
    const sql = fs.readFileSync(path.join(__dirname, 'add-indexes.sql'), 'utf8');
    
    await pool.query(sql);
    
    console.log('✅ Indexes added successfully!');
    console.log('📊 Database performance should be significantly improved.');
    
  } catch (error) {
    console.error('❌ Error adding indexes:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addIndexes();
