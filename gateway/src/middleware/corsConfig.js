const cors = require('cors');
const env = require('../config/environment');

function configureCors() {
  const origins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

  return cors({
    origin: (origin, callback) => {
      const isLocalhost = origin && (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      );
      if (!origin || isLocalhost || origins.includes('*') || origins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400,
  });
}

module.exports = configureCors;
