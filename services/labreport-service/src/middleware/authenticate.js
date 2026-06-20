const jwt = require('jsonwebtoken');
const env = require('../config/environment');

function authenticate(req, res, next) {
  if (req.headers['x-user-id']) {
    req.user = {
      userId: req.headers['x-user-id'],
      email: req.headers['x-user-email'],
      role: req.headers['x-user-role'],
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided.', timestamp: new Date().toISOString() });
  }

  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], env.JWT_ACCESS_SECRET);
    req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Token expired. Please login again.' : 'Invalid token.';
    return res.status(401).json({ success: false, message, timestamp: new Date().toISOString() });
  }
}

module.exports = authenticate;
