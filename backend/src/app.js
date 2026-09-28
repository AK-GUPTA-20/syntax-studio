import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env.js';
import { globalLimiter } from './middleware/rateLimiter.js';
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

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Dev-friendly
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logger
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
