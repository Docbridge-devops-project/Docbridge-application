require('dotenv').config();

const env = {
  PORT: parseInt(process.env.PORT, 10) || 3007,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 5432,
  DB_NAME: process.env.DB_NAME || 'docbridge_db',
  DB_USER: process.env.DB_USER || 'docbridge_user',
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_SSL: process.env.DB_SSL === 'true',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_replace_in_production',
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || '',
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  OPENROUTER_SITE_URL: process.env.OPENROUTER_SITE_URL || '',
  OPENROUTER_APP_NAME: process.env.OPENROUTER_APP_NAME || 'DocBridge AI Companion',
  OPENROUTER_TIMEOUT_MS: parseInt(process.env.OPENROUTER_TIMEOUT_MS, 10) || 30000,
};

module.exports = env;
