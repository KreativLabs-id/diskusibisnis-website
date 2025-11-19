import { Pool } from 'pg';
import config from './environment';

// Log the database URL (masked) for debugging
const dbUrl = config.database.url;
const maskedUrl = dbUrl ? dbUrl.replace(/:[^:@]*@/, ':****@') : 'undefined';
console.log(`Attempting to connect to database: ${maskedUrl}`);

// Check if DATABASE_URL is from a cloud provider that requires SSL
const isCloudDatabase = dbUrl?.includes('supabase') ||
  dbUrl?.includes('neon') ||
  dbUrl?.includes('railway') ||
  dbUrl?.includes('render');

const forceSsl = process.env.DB_SSL === 'true';
const useSsl = isCloudDatabase || forceSsl;

console.log(`Cloud database detected: ${isCloudDatabase}, Force SSL: ${forceSsl}`);

const pool = new Pool({
  connectionString: config.database.url,
  ssl: useSsl ? {
    rejectUnauthorized: false
  } : false,
  connectionTimeoutMillis: 10000, // 10 seconds timeout
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;
