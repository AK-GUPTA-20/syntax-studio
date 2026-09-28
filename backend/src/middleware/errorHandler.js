import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`💥 [Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.message || 'Internal Server Error';
  const errorDetails = config.nodeEnv === 'development' ? err.stack : undefined;

  return ApiResponse.error(res, message, errorDetails, statusCode);
};

export const notFoundHandler = (req, res) => {
  return ApiResponse.error(res, `Route ${req.method} ${req.originalUrl} not found`, null, 404);
};
