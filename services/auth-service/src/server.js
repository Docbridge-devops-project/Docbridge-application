const env = require('./config/environment');
const logger = require('./config/logger');
const { connectWithRetry } = require('./config/database');

async function startServer() {
  try {
    await connectWithRetry();

    // Load models to register associations
    require('./models');

    const app = require('./app');
    const server = app.listen(env.PORT, '0.0.0.0', () => {
      logger.info('============================================');
      logger.info('  DocBridge Auth Service');
      logger.info(`  Port:        ${env.PORT}`);
      logger.info(`  Environment: ${env.NODE_ENV}`);
      logger.info(`  Database:    ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
      logger.info('============================================');
    });

    function gracefulShutdown(signal) {
      logger.info(`${signal} received. Shutting down auth-service gracefully...`);
      server.close(async () => {
        try {
          const { sequelize } = require('./config/database');
          await sequelize.close();
          logger.info('Database connection closed.');
        } catch (e) {
          logger.error('Error closing database:', e.message);
        }
        process.exit(0);
      });
      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start auth-service:', error.message);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
