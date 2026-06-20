const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const configureCors = require('./middleware/corsConfig');
const authenticate = require('./middleware/authenticate');
const { generalLimiter, authLimiter, aiLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const idempotency = require('./middleware/idempotency');
const createServiceProxy = require('./proxy/serviceProxy');
const routesConfig = require('./config/routes.config');
const logger = require('./config/logger');

const app = express();

// Health check — no auth required (registered before rate limiting and other middleware)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

app.get('/healthz', (req, res) => res.status(200).json({
  status: 'ok', service: 'api-gateway', probe: 'liveness'
}));

app.get('/ready', (req, res) => res.status(200).json({
  status: 'ready', service: 'api-gateway', probe: 'readiness'
}));

// Security and parsing middleware
app.use(helmet());
app.use(configureCors());
app.use(express.json({ limit: '100kb' }));
app.use(hpp());
app.use(requestLogger);
app.use(generalLimiter);
app.use(idempotency);

app.get('/test-error', (req, res) => {
  throw new Error('This is a deliberate error for testing stack traces.');
});

// Auth rate limiter for login/register
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// AI rate limiter
app.use('/api/v1/ai', aiLimiter);

// Authentication middleware — runs before proxy
app.use(authenticate);

// Set up proxy routes for each service
routesConfig.forEach((route) => {
  logger.info(`Registering proxy: ${route.path} → ${route.target}`);
  app.use(route.path, createServiceProxy(route));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
