import { Pool } from 'pg';
import config from './environment';

// Check if DATABASE_URL is from a cloud provider that requires SSL
const isCloudDatabase = config.database.url?.includes('supabase') || 
                        config.database.url?.includes('neon') ||
                        config.database.url?.includes('railway') ||
                        config.database.url?.includes('render');

const pool = new Pool({
  connectionString: config.database.url,
  ssl: isCloudDatabase ? {
    rejectUnauthorized: false
  } : false
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
