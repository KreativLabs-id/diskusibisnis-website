import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
// @ts-ignore
import xss from 'xss-clean';
import config from './config/environment';
import routes from './routes';
import pool from './config/database';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import {
  blockSuspiciousUserAgents,
  blockSuspiciousPaths,
  detectSQLInjection,
  detectXSS,
  detectPathTraversal,
  securityHeaders
} from './middlewares/security.middleware';
import { auditAuthMiddleware, auditAdminMiddleware } from './middlewares/audit.middleware';
import { validateEnvironment } from './lib/env';
import { csrfTokenGenerator, getCSRFToken } from './middlewares/csrf.middleware';
import { honeypotMiddleware } from './middlewares/honeypot.middleware';
import { helmetConfig } from './config/csp.config';

const app: Application = express();

// Validate environment variables on startup (non-blocking warning in development)
try {
  validateEnvironment();
} catch (error) {
  if (config.nodeEnv === 'production') {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  } else {
    console.warn('⚠️ Environment validation warning:', (error as Error).message);
  }
}

// Trust proxy is required for rate limiting to work correctly behind reverse proxies (like Railway, Heroku, Nginx)
// limiting to the first proxy loopback address
app.set('trust proxy', 1);

// Security middleware - Order matters!
// 1. Add additional security headers
app.use(securityHeaders);

// 2. Helmet for comprehensive security headers (including CSP)
app.use(helmet(helmetConfig));

// 3. Block suspicious user agents (security scanners, bots)
app.use(blockSuspiciousUserAgents);

// 4. Block suspicious paths (path traversal, common attack paths)
app.use(blockSuspiciousPaths);

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Data sanitization against XSS
app.use(xss());

// Cookie parser middleware (required for HttpOnly cookies)
app.use(cookieParser());

// CORS configuration - Handle multiple origins
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = config.cors.origin;
    const isProduction = config.nodeEnv === 'production';

    // Allow requests with no origin (like mobile apps, Postman, curl requests)
    if (!origin) {
      if (!isProduction) {
        console.log('CORS: Request with no origin - allowing');
      }
      return callback(null, true);
    }

    // Log incoming origin for debugging (only in development)
    if (!isProduction) {
      console.log('CORS: Checking origin:', origin);
      console.log('CORS: Allowed origins:', allowedOrigins);
    }

    // Check if origin is allowed
    if (Array.isArray(allowedOrigins)) {
      if (allowedOrigins.includes(origin)) {
        if (!isProduction) {
          console.log('CORS: Origin allowed (array match)');
        }
        callback(null, true);
      } else {
        // In production, reject unauthorized origins
        if (isProduction) {
          console.warn('CORS: Origin blocked in production:', origin);
          // For now, allowing all in production to debug mobile app connection if needed, 
          // usually you should block it. user asked for security, so we should block it.
          // Reverting to block:
          callback(new Error('Not allowed by CORS'));
        } else {
          // In development, allow but log warning
          console.log('CORS: Origin NOT in list, allowing for development');
          callback(null, true);
        }
      }
    } else {
      const isAllowed = origin === allowedOrigins || allowedOrigins === '*';
      if (!isProduction) {
        console.log(`CORS: Origin ${isAllowed ? 'allowed' : 'NOT allowed'} (string match)`);
      }
      if (isAllowed) {
        callback(null, true);
      } else if (isProduction) {
        callback(new Error('Not allowed by CORS'));
      } else {
        callback(null, true);
      }
    }
  },
  credentials: true, // Required for cookies to work cross-origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Device-Id'],
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.nodeEnv === 'development' ? 1000 : config.rateLimit.maxRequests, // Higher limit in dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check in development
    if (config.nodeEnv === 'development') {
      return req.path === '/health';
    }
    return false;
  },
});

app.use('/api/', limiter);

// Health check endpoint - Always return 200 for Railway
app.get('/health', async (_req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    database: 'checking...' as string
  };

  // Try to check database connection without blocking the response
  try {
    await pool.query('SELECT 1');
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    console.log('⚠️ Health check: Database not available');
  }

  // Always return 200 OK for Railway healthcheck
  res.status(200).json(health);
});
// API routes with security middleware
// Apply additional security checks to all API routes
app.use('/api', detectPathTraversal);
app.use('/api', detectSQLInjection);
app.use('/api', detectXSS);

// CSRF token generation for all API requests
app.use('/api', csrfTokenGenerator);

// CSRF token endpoint for frontend to fetch token
app.get('/api/csrf-token', getCSRFToken);

// Honeypot anti-spam for registration and support forms
app.use('/api/auth/register', honeypotMiddleware);
app.use('/api/support', honeypotMiddleware);

// Audit logging for auth-related routes
app.use('/api/auth', auditAuthMiddleware);

// Audit logging for admin routes
app.use('/api/admin', auditAdminMiddleware);

// Main API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;

