import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'development' ? 100 : 15, // limit each IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Contact form rate limit exceeded. Please try again later or reach out directly by email.'
  }
});
