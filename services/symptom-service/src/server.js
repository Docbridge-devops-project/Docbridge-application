const env = require('./config/environment');
const logger = require('./config/logger');
const { connectWithRetry } = require('./config/database');

async function startServer() {
  try {
    await connectWithRetry();
    require('./models');

    const app = require('./app');
    const server = app.listen(env.PORT, '0.0.0.0', () => {
      logger.info('============================================');
      logger.info('  DocBridge Symptom Service');
      logger.info(`  Port:        ${env.PORT}`);
      logger.info(`  Environment: ${env.NODE_ENV}`);
      logger.info(`  Database:    ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
      logger.info('============================================');
    });

    function gracefulShutdown(signal) {
      logger.info(`${signal} received. Shutting down symptom-service gracefully...`);
      server.close(async () => {
        try {
          const { sequelize } = require('./config/database');
          await sequelize.close();
        } catch (e) { /* ignore */ }
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start symptom-service:', error.message);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => { const logger = require('./config/logger'); logger.error('Unhandled Rejection:', reason); });
process.on('uncaughtException', (error) => { const logger = require('./config/logger'); logger.error('Uncaught Exception:', error); process.exit(1); });

startServer();
