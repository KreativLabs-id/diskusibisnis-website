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

// SSL certificate validation
// In production, set DB_SSL_REJECT_UNAUTHORIZED=true for proper certificate validation
// This protects against man-in-the-middle attacks
const rejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true';

if (useSsl && !rejectUnauthorized) {
  console.log('⚠️ SSL certificate validation is disabled. For production, set DB_SSL_REJECT_UNAUTHORIZED=true');
}

console.log(`Cloud database detected: ${isCloudDatabase}, Force SSL: ${forceSsl}, Reject unauthorized: ${rejectUnauthorized}`);

const pool = new Pool({
  connectionString: config.database.url,
  ssl: useSsl ? {
    rejectUnauthorized: rejectUnauthorized
  } : false,
  connectionTimeoutMillis: 60000, // 60 seconds timeout for initial connection (increased for slow networks)
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  max: 20, // Maximum number of clients in the pool (increased for production)
  allowExitOnIdle: false, // Don't exit when all clients are idle
  // Add query timeout
  query_timeout: 30000, // 30 seconds for queries
  // Keep connection alive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000, // 10 seconds
});

pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  console.error('❌ Database pool error:', err.message);
  // Don't exit the process, let the application handle reconnection
});

export default pool;

