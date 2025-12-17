/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
// Run cleanup orphan notifications migration
// Usage: node scripts/run-cleanup-orphan-notifications.js

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting cleanup orphan notifications migration...\n');
    
    const sqlPath = path.join(__dirname, 'cleanup-orphan-notifications.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Run the entire SQL file as one transaction
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    
    console.log('✅ All functions and triggers created successfully');
    
    // Verify triggers were created
    const result = await client.query(`
      SELECT 
        trigger_name, 
        event_manipulation, 
        event_object_table
      FROM information_schema.triggers 
      WHERE trigger_name LIKE 'cleanup_%_notifications_trigger'
      ORDER BY trigger_name
    `);
    
    console.log('\n✅ Active cleanup triggers:');
    result.rows.forEach(row => {
      console.log(`   - ${row.trigger_name} (${row.event_manipulation} on ${row.event_object_table})`);
    });
    
    // Count remaining notifications
    const countResult = await client.query('SELECT COUNT(*) as count FROM notifications');
    console.log(`\n📊 ${countResult.rows[0].count} notifications in database`);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('   Notifications will now be automatically cleaned up when content is deleted.\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
