require('dotenv').config();

const env = {
  PORT: parseInt(process.env.PORT, 10) || 3003,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT, 10) || 5432,
  DB_NAME: process.env.DB_NAME || 'docbridge_db',
  DB_USER: process.env.DB_USER || 'docbridge_user',
  DB_PASSWORD: process.env.DB_PASSWORD || 'DocBridge@2024Secure',
  DB_SSL: process.env.DB_SSL === 'true',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_replace_in_production',
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
};

module.exports = env;
