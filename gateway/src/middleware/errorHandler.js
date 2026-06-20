const logger = require('../config/logger');
const env = require('../config/environment');

function errorHandler(err, req, res, _next) {
  logger.error('Unhandled gateway error', {
    message: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method,
  });

  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable. Please try again later.',
      timestamp: new Date().toISOString(),
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again.'
      : err.message,
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;
