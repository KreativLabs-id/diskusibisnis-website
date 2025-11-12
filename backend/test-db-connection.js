const { Pool } = require('pg');
require('dotenv').config();

console.log('Testing Database Connection...');
console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testConnection() {
    try {
        console.log('\n🔄 Attempting to connect...');
        const client = await pool.connect();
        console.log('✅ Successfully connected to database!');
        
        // Test simple query
        console.log('\n🔄 Testing query...');
        const result = await client.query('SELECT NOW() as current_time, version()');
        console.log('✅ Query successful!');
        console.log('   Server time:', result.rows[0].current_time);
        console.log('   PostgreSQL version:', result.rows[0].version.split(',')[0]);
        
        // Test tables exist
        console.log('\n🔄 Checking tables...');
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        console.log('✅ Tables found:', tablesResult.rows.length);
        tablesResult.rows.forEach(row => {
            console.log('   -', row.table_name);
        });
        
        client.release();
        await pool.end();
        
        console.log('\n✅ All tests passed! Database connection is working.\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Database connection failed!');
        console.error('Error:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

testConnection();
