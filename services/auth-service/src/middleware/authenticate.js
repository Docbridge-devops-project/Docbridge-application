const jwt = require('jsonwebtoken');
const env = require('../config/environment');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  
  if (req.headers['x-user-id']) {
    req.user = {
      userId: req.headers['x-user-id'],
      email: req.headers['x-user-email'],
      role: req.headers['x-user-role'],
    };
    return next();
  }

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
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = authenticate;
