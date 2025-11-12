import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Check if DATABASE_URL is from a cloud provider that requires SSL
const isCloudDatabase = process.env.DATABASE_URL?.includes('supabase') || 
                        process.env.DATABASE_URL?.includes('neon') ||
                        process.env.DATABASE_URL?.includes('railway') ||
                        process.env.DATABASE_URL?.includes('render');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isCloudDatabase ? {
        rejectUnauthorized: false
    } : false
});

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    // Don't exit process, let the app handle errors gracefully
});

export default pool;
