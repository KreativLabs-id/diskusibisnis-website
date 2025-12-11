import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import config from './config/environment';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app: Application = express();

// Security middleware
app.use(helmet());

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;

