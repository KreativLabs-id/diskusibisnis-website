/**
 * Run SQL Script Utility
 * 
 * Usage:
 *   node scripts/run-sql.js                    - Run setup-database.sql (default)
 *   node scripts/run-sql.js <filename.sql>     - Run specific SQL file
 * 
 * Examples:
 *   node scripts/run-sql.js setup-database.sql
 *   node scripts/run-sql.js fix-votes-trigger.sql
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runSQLFile(filePath) {
  try {
    const fullPath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }
    
    const sql = fs.readFileSync(fullPath, 'utf8');
    const fileName = path.basename(fullPath);
    
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  SQL Script Runner                                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('📄 File:', fileName);
    console.log('🗄️  Database:', process.env.DATABASE_URL?.split('@')[1]?.split('?')[0] || 'Connected');
    console.log('');
    console.log('⏳ Executing SQL script...');
    console.log('');
    
    await pool.query(sql);
    
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ SQL Script Executed Successfully!                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    
  } catch (error) {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ❌ Error Occurred                                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.message.includes('File not found')) {
      console.error('💡 Make sure the SQL file exists in the scripts folder');
    } else if (error.message.includes('connect')) {
      console.error('💡 Check your DATABASE_URL in .env.local');
    } else {
      console.error('💡 Check the SQL syntax or database permissions');
    }
    console.error('');
    
    throw error;
  } finally {
    await pool.end();
  }
}

// Get filename from command line args or use default
const sqlFile = process.argv[2] || 'setup-database.sql';

runSQLFile(sqlFile)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
