require('dotenv').config();

const env = {
  PORT: parseInt(process.env.PORT, 10) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_replace_in_production',
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  CONSULTATION_SERVICE_URL: process.env.CONSULTATION_SERVICE_URL || 'http://localhost:3002',
  PRESCRIPTION_SERVICE_URL: process.env.PRESCRIPTION_SERVICE_URL || 'http://localhost:3003',
  REMINDER_SERVICE_URL: process.env.REMINDER_SERVICE_URL || 'http://localhost:3004',
  LABREPORT_SERVICE_URL: process.env.LABREPORT_SERVICE_URL || 'http://localhost:3005',
  SYMPTOM_SERVICE_URL: process.env.SYMPTOM_SERVICE_URL || 'http://localhost:3006',
  AI_COMPANION_SERVICE_URL: process.env.AI_COMPANION_SERVICE_URL || 'http://localhost:3007',
  HEALTH_SUMMARY_SERVICE_URL: process.env.HEALTH_SUMMARY_SERVICE_URL || 'http://localhost:3008',
  FAMILY_SERVICE_URL: process.env.FAMILY_SERVICE_URL || 'http://localhost:3009',
};

module.exports = env;
