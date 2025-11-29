const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runCleanup() {
  const client = await pool.connect();
  
  try {
    console.log('Starting notification cleanup...\n');

    // 1. Count before cleanup
    const beforeCount = await client.query(`
      SELECT type, COUNT(*) as count FROM notifications GROUP BY type ORDER BY type
    `);
    console.log('Before cleanup:');
    beforeCount.rows.forEach(row => console.log(`  ${row.type}: ${row.count}`));
    console.log('');

    // 2. Delete duplicate vote notifications (keep the newest)
    const voteResult = await client.query(`
      DELETE FROM notifications n1
      WHERE n1.type = 'vote'
      AND n1.id NOT IN (
        SELECT DISTINCT ON (user_id, message, link) id
        FROM notifications
        WHERE type = 'vote'
        ORDER BY user_id, message, link, created_at DESC
      )
    `);
    console.log(`Deleted ${voteResult.rowCount} duplicate vote notifications`);

    // 3. Delete duplicate mention notifications (keep the newest)
    const mentionResult = await client.query(`
      DELETE FROM notifications n1
      WHERE n1.type = 'mention'
      AND n1.id NOT IN (
        SELECT DISTINCT ON (user_id, message, link) id
        FROM notifications
        WHERE type = 'mention'
        ORDER BY user_id, message, link, created_at DESC
      )
    `);
    console.log(`Deleted ${mentionResult.rowCount} duplicate mention notifications`);

    // 4. Delete old format mention notifications
    const oldFormatResult = await client.query(`
      DELETE FROM notifications
      WHERE type = 'mention'
      AND (message LIKE 'in "%' OR message LIKE 'in ''%' OR title = 'Mention')
    `);
    console.log(`Deleted ${oldFormatResult.rowCount} old format mention notifications`);

    // 5. Count after cleanup
    const afterCount = await client.query(`
      SELECT type, COUNT(*) as count FROM notifications GROUP BY type ORDER BY type
    `);
    console.log('\nAfter cleanup:');
    afterCount.rows.forEach(row => console.log(`  ${row.type}: ${row.count}`));

    console.log('\nCleanup completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runCleanup();
