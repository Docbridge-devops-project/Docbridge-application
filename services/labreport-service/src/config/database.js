const { Sequelize } = require('sequelize');
const env = require('./environment');
const logger = require('./logger');

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: { max: 10, min: 2, acquire: 30000, idle: 10000 },
  dialectOptions: env.DB_SSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
});

async function connectWithRetry(retries = 5, delay = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      logger.info(`Connected to PostgreSQL at ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
      return;
    } catch (error) {
      logger.error(`Database connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) throw new Error(`Failed to connect after ${retries} attempts`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

module.exports = { sequelize, connectWithRetry };
