/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
/* eslint-disable no-console */

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, display_name, username FROM users LIMIT 10');
    
    console.log('\n📋 Users in database:');
    console.log('=' .repeat(60));
    
    result.rows.forEach(user => {
      console.log(`${user.display_name} (username: ${user.username || 'NULL'})`);
    });
    
    console.log('=' .repeat(60));
    console.log(`Total: ${result.rows.length} users\n`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers();
