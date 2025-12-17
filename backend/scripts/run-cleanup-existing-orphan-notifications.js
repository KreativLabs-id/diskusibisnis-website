/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
// Run cleanup for existing orphan notifications
// Usage: node scripts/run-cleanup-existing-orphan-notifications.js

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runCleanup() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting cleanup of existing orphan notifications...\n');
    
    // Count before cleanup
    const beforeCount = await client.query('SELECT COUNT(*) as count FROM notifications');
    console.log(`📊 Notifications before cleanup: ${beforeCount.rows[0].count}`);
    
    // 1. Delete notifications for deleted questions
    const result1 = await client.query(`
      DELETE FROM notifications n
      WHERE n.link LIKE '/questions/%'
      AND NOT EXISTS (
          SELECT 1 FROM questions q 
          WHERE n.link = '/questions/' || q.id::TEXT
          OR n.link LIKE '/questions/' || q.id::TEXT || '/%'
      )
    `);
    console.log(`🗑️  Deleted ${result1.rowCount} notifications pointing to deleted questions`);
    
    // 2. Delete EXTRA answer notifications - keep only the most recent ones matching actual answer count
    // For each question, keep only (answer_count * 2) most recent answer notifications
    const result2 = await client.query(`
      WITH question_answer_counts AS (
        SELECT q.id as question_id, COUNT(a.id) as answer_count
        FROM questions q
        LEFT JOIN answers a ON a.question_id = q.id
        GROUP BY q.id
      ),
      ranked_notifs AS (
        SELECT n.id, 
               n.link,
               qac.answer_count,
               ROW_NUMBER() OVER (PARTITION BY n.link ORDER BY n.created_at DESC) as rn
        FROM notifications n
        JOIN question_answer_counts qac ON n.link = '/questions/' || qac.question_id::TEXT
        WHERE n.type = 'answer'
      )
      DELETE FROM notifications
      WHERE id IN (
        SELECT id FROM ranked_notifs 
        WHERE rn > (answer_count * 2)
      )
    `);
    console.log(`🗑️  Deleted ${result2.rowCount} extra/orphan answer notifications`);
    
    // 3. Delete accepted_answer notifications for answers that no longer exist or are not accepted
    const result3 = await client.query(`
      DELETE FROM notifications n
      WHERE n.type = 'accepted_answer'
      AND n.link LIKE '/questions/%'
      AND NOT EXISTS (
          SELECT 1 FROM questions q
          JOIN answers a ON a.question_id = q.id AND a.is_accepted = true
          WHERE n.link = '/questions/' || q.id::TEXT
          AND n.user_id = a.author_id
      )
    `);
    console.log(`🗑️  Deleted ${result3.rowCount} orphan accepted_answer notifications`);

    // 4. Delete extra vote notifications - keep only 1 per question per user
    const result4 = await client.query(`
      WITH ranked_vote_notifs AS (
        SELECT n.id,
               ROW_NUMBER() OVER (PARTITION BY n.user_id, n.link ORDER BY n.created_at DESC) as rn
        FROM notifications n
        WHERE n.type = 'vote'
      )
      DELETE FROM notifications
      WHERE id IN (
        SELECT id FROM ranked_vote_notifs WHERE rn > 1
      )
    `);
    console.log(`🗑️  Deleted ${result4.rowCount} duplicate vote notifications`);

    // 5. Delete extra mention notifications - keep only 1 per question per user
    const result5 = await client.query(`
      WITH ranked_mention_notifs AS (
        SELECT n.id,
               ROW_NUMBER() OVER (PARTITION BY n.user_id, n.link ORDER BY n.created_at DESC) as rn
        FROM notifications n
        WHERE n.type = 'mention'
      )
      DELETE FROM notifications
      WHERE id IN (
        SELECT id FROM ranked_mention_notifs WHERE rn > 1
      )
    `);
    console.log(`🗑️  Deleted ${result5.rowCount} duplicate mention notifications`);
    
    // Count after cleanup
    const afterCount = await client.query('SELECT COUNT(*) as count FROM notifications');
    console.log(`\n📊 Notifications after cleanup: ${afterCount.rows[0].count}`);
    
    const deleted = parseInt(beforeCount.rows[0].count) - parseInt(afterCount.rows[0].count);
    console.log(`✅ Total deleted: ${deleted} orphan/duplicate notifications`);
    
    console.log('\n🎉 Cleanup completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runCleanup()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
