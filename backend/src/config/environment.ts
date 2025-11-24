import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || '',
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
