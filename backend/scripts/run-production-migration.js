/**
 * Production Migration Runner
 * 
 * This script runs the production migration to update the votes table structure
 * from the old polymorphic pattern (votable_id/votable_type) to the new direct
 * foreign key pattern (question_id/answer_id).
 * 
 * Usage:
 *   node scripts/run-production-migration.js
 * 
 * Make sure your .env.local has DATABASE_URL set to your PRODUCTION database!
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Connection string from environment
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ ERROR: DATABASE_URL not found in .env.local');
    console.error('\nPlease set DATABASE_URL in your .env.local file.');
    process.exit(1);
}

async function runMigration() {
    const pool = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║     PRODUCTION DATABASE MIGRATION                     ║');
        console.log('╚════════════════════════════════════════════════════════╝\n');
        
        // Parse connection string to hide password
        const url = new URL(connectionString);
        const maskedPassword = '****';
        console.log(`📊 Database: ${url.hostname}`);
        console.log(`👤 User: ${url.username}`);
        console.log(`🔒 Password: ${maskedPassword}`);
        console.log(`📁 Database: ${url.pathname.slice(1)}\n`);
        
        // Warning
        console.log('⚠️  WARNING: This will modify your PRODUCTION database!');
        console.log('   Make sure you have a backup before proceeding.\n');
        
        // Read SQL file
        const sqlFile = path.join(__dirname, 'migration-production.sql');
        
        if (!fs.existsSync(sqlFile)) {
            throw new Error(`SQL file not found: ${sqlFile}`);
        }
        
        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        console.log('📖 Reading migration file...');
        console.log(`   File: ${sqlFile}`);
        console.log(`   Size: ${(sql.length / 1024).toFixed(2)} KB\n`);
        
        console.log('🚀 Executing migration...\n');
        
        // Execute the migration
        const result = await pool.query(sql);
        
        console.log('\n✅ Migration completed successfully!\n');
        
        // Show any notices from the database
        if (result.rows && result.rows.length > 0) {
            console.log('📋 Migration output:');
            result.rows.forEach(row => {
                console.log(row);
            });
        }
        
        console.log('\n╔════════════════════════════════════════════════════════╗');
        console.log('║     NEXT STEPS                                         ║');
        console.log('╚════════════════════════════════════════════════════════╝\n');
        console.log('1. Deploy your application to Vercel (push to git)');
        console.log('2. Test voting functionality thoroughly');
        console.log('3. Verify vote counts are displaying correctly');
        console.log('4. If everything works, uncomment lines 182-183 in');
        console.log('   migration-production.sql to drop old columns\n');
        
    } catch (error) {
        console.error('\n❌ Migration failed!\n');
        console.error('Error details:');
        console.error(error);
        console.error('\nCommon issues:');
        console.error('- Database credentials incorrect');
        console.error('- Network/firewall blocking connection');
        console.error('- SQL syntax error in migration file');
        console.error('- Insufficient database permissions\n');
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// Run the migration
runMigration();
