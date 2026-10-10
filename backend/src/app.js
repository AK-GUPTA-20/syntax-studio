import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { csrfProtection } from './middleware/csrfProtection.js';
import { noSqlInjectionSanitizer } from './middleware/noSqlInjectionSanitizer.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Route imports
import projectRoutes from './routes/projectRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import authRoutes from './routes/authRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';

const app = express();

// Trust reverse proxy (enables correct client IP retrieval for rate limiters behind Cloudflare/Render/Vercel)
app.set('trust proxy', 1);

// Hide server fingerprint
app.disable('x-powered-by');

// Security HTTP headers with Helmet & HSTS & CSP
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'https://ik.imagekit.io'],
      connectSrc: [
        "'self'",
        'https:',
        'https://*.firebaseio.com',
        'https://*.googleapis.com',
        'https://api.resend.com'
      ],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: config.nodeEnv === 'production' ? [] : null,
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny' // Anti-Clickjacking
  },
  noSniff: true, // X-Content-Type-Options: nosniff
  xssFilter: true, // X-XSS-Protection: 0 or 1; mode=block
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}));

import { isOriginAllowed } from './config/corsOrigins.js';

// Robust CORS configuration supporting production Vercel domains, custom origins, and preflights
const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    // In development mode, allow for easier debugging; in production cleanly reject without 500
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // Cache preflight response for 24 hours
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Request logger
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers with bounded payload limits (prevent memory-exhaustion DoS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL Injection & Prototype Pollution Sanitizer
app.use(noSqlInjectionSanitizer);

// CSRF Defense middleware for state-changing endpoints
app.use('/api', csrfProtection);

// Global Rate Limiting
app.use('/api', globalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Syntax Studio Agency Backend',
    version: '1.0.0'
  });
});

// Mount modular REST API routes
app.use('/api/projects', projectRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/verification', verificationRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
