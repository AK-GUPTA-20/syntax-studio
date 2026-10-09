import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';
import { safeLogger, sanitizeLogData } from '../utils/logSanitizer.js';

export const errorHandler = (err, req, res, next) => {
  // Redact sensitive details from logged error
  const sanitizedErr = {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  };

  safeLogger.error(`💥 [Error] ${req.method} ${req.originalUrl}:`, sanitizeLogData(sanitizedErr));

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  
  // In production, mask unhandled 500 server error details
  let message = err.message || 'Internal Server Error';
  if (statusCode === 500 && config.nodeEnv === 'production') {
    message = 'An unexpected server error occurred. Please try again later.';
  }

  const errorDetails = config.nodeEnv === 'development' ? err.stack : undefined;

  return ApiResponse.error(res, message, errorDetails, statusCode);
};

export const notFoundHandler = (req, res) => {
  return ApiResponse.error(res, `Route ${req.method} ${req.originalUrl} not found`, null, 404);
};
