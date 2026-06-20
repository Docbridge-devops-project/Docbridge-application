const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('../config/logger');

function createServiceProxy(routeConfig) {
  return createProxyMiddleware({
    target: routeConfig.target,
    changeOrigin: true,
    pathRewrite: (path) => routeConfig.path + (path === '/' ? '' : path),
    timeout: 30000,
    proxyTimeout: 30000,
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.headers['x-user-id']) {
          proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
        }
        if (req.headers['x-user-email']) {
          proxyReq.setHeader('x-user-email', req.headers['x-user-email']);
        }
        if (req.headers['x-user-role']) {
          proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
        }
        const { fixRequestBody } = require('http-proxy-middleware');
        fixRequestBody(proxyReq, req);
        logger.debug(`Proxying ${req.method} ${req.originalUrl} → ${routeConfig.target}`);
      },
      proxyRes: (proxyRes, req) => {
        logger.debug(`Proxy response: ${req.method} ${req.originalUrl} → ${proxyRes.statusCode}`);
      },
      error: (err, req, res) => {
        logger.error(`Proxy error for ${req.method} ${req.originalUrl}: ${err.message}`);
        if (!res.headersSent) {
          res.status(503).json({
            success: false,
            message: 'Service temporarily unavailable. Please try again later.',
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  });
}

module.exports = createServiceProxy;
