const app = require('./app');
const env = require('./config/environment');
const logger = require('./config/logger');

const server = app.listen(env.PORT, () => {
  logger.info('============================================');
  logger.info('  DocBridge API Gateway');
  logger.info(`  Port:        ${env.PORT}`);
  logger.info(`  Environment: ${env.NODE_ENV}`);
  logger.info(`  CORS Origin: ${env.CORS_ORIGIN}`);
  logger.info('============================================');
});

function gracefulShutdown(signal) {
  logger.info(`${signal} received. Shutting down API Gateway gracefully...`);
  server.close(() => {
    logger.info('API Gateway closed.');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});



