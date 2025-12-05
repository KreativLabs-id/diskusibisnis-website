const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkAdmin() {
  try {
    const result = await pool.query(`
      SELECT id, email, display_name, role, created_at 
      FROM users 
      WHERE role = 'admin'
      ORDER BY created_at
    `);
    
    console.log('Admin users:');
    console.log(result.rows);
    
    if (result.rows.length === 0) {
      console.log('\nNo admin users found.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkAdmin();
