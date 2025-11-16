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

async function testSearch() {
  try {
    console.log('\n🔍 Testing user search...\n');
    
    const searchTerms = ['fah', 'Fah', 'Fahrezi', 'fahrezi', 'kreativ'];
    
    for (const term of searchTerms) {
      const result = await pool.query(
        'SELECT * FROM search_users_by_username($1, $2)',
        [term, 10]
      );
      
      console.log(`Search for "${term}": ${result.rows.length} results`);
      result.rows.forEach(user => {
        console.log(`  - ${user.display_name} (@${user.username})`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

testSearch();
