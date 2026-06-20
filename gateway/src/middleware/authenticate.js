const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const logger = require('../config/logger');

const PUBLIC_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh-token',
  '/health',
];

function isPublicPath(path) {
  return PUBLIC_PATHS.some((pp) => path.startsWith(pp));
}

function authenticate(req, res, next) {
  if (isPublicPath(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided. Please log in.',
      timestamp: new Date().toISOString(),
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.headers['x-user-id'] = decoded.userId;
    req.headers['x-user-email'] = decoded.email;
    req.headers['x-user-role'] = decoded.role;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn(`Token expired for request to ${req.path}`);
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
        timestamp: new Date().toISOString(),
      });
    }
    logger.warn(`Invalid token for request to ${req.path}: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = authenticate;
