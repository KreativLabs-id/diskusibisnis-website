require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function checkDatabase() {
    try {
        // Test connection
        console.log('Testing database connection...');
        const timeResult = await pool.query('SELECT NOW()');
        console.log('✅ Database connected:', timeResult.rows[0].now);

        // Check if users table exists
        const tableResult = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
        `);

        if (tableResult.rows.length === 0) {
            console.log('❌ Users table does not exist!');
            console.log('Run the schema.sql file to create tables');
        } else {
            console.log('✅ Users table exists');
            
            // Check table structure
            const columnsResult = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'users'
                ORDER BY ordinal_position
            `);
            
            console.log('\nUsers table structure:');
            columnsResult.rows.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type}`);
            });
        }

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await pool.end();
    }
}

checkDatabase();
