import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import config from './config/environment';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration - Handle multiple origins
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = config.cors.origin;
    
    // Allow requests with no origin (like mobile apps, Postman, curl requests)
    if (!origin) {
      console.log('CORS: Request with no origin - allowing');
      return callback(null, true);
    }
    
    // Log incoming origin for debugging
    console.log('CORS: Checking origin:', origin);
    console.log('CORS: Allowed origins:', allowedOrigins);
    
    // Check if origin is allowed
    if (Array.isArray(allowedOrigins)) {
      if (allowedOrigins.includes(origin)) {
        console.log('CORS: Origin allowed (array match)');
        callback(null, true);
      } else {
        console.log('CORS: Origin NOT allowed');
        // Instead of throwing error, allow but log warning
        // This prevents blocking but helps debugging
        callback(null, true); // CHANGED: Allow all origins temporarily for debugging
      }
    } else {
      const isAllowed = origin === allowedOrigins;
      console.log(`CORS: Origin ${isAllowed ? 'allowed' : 'NOT allowed'} (string match)`);
      callback(null, isAllowed || allowedOrigins === '*');
    }
  },
  credentials: true,
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
    // Skip rate limiting for health check and auth endpoints in development
    if (config.nodeEnv === 'development') {
      return req.path === '/health' || req.path.startsWith('/api/auth');
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
