import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  debug: {
    cors: process.env.DEBUG_CORS === 'true',
    db: process.env.DEBUG_DB === 'true',
    cache: process.env.DEBUG_CACHE === 'true',
  },
  
  database: {
    url: process.env.DATABASE_URL || '',
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    min: parseInt(process.env.DB_POOL_MIN || '0'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '10000'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '10000'),
    queryTimeoutMillis: parseInt(process.env.DB_QUERY_TIMEOUT_MS || '15000'),
    maxUses: parseInt(process.env.DB_MAX_USES || '7500'),
    maxLifetimeSeconds: parseInt(process.env.DB_MAX_LIFETIME_SECONDS || '300'),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN 
      ? (process.env.CORS_ORIGIN === '*' 
          ? '*' 
          : process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()))
      : (process.env.NODE_ENV === 'production' 
          ? [] // Empty array in production will be handled in app.ts
          : ['http://localhost:3000', 'http://localhost:3001']),
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
};

export default config;
