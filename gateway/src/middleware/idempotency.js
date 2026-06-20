const NodeCache = require('node-cache');
// Cache keys for 5 minutes
const idempotencyCache = new NodeCache({ stdTTL: 300 });

function idempotency(req, res, next) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return next();
  }
  
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    // If no key is provided, we just let it through (or we could enforce it)
    return next();
  }

  // Combine user ID and key to ensure uniqueness per user
  const userId = req.headers['x-user-id'] || req.user?.userId || 'anonymous';
  const cacheKey = `${userId}:${idempotencyKey}`;

  if (idempotencyCache.has(cacheKey)) {
    const cachedResponse = idempotencyCache.get(cacheKey);
    return res.status(409).json({
      success: false,
      message: 'Duplicate request detected.',
      cached_status: 'conflict'
    });
  }

  // Mark as processing
  idempotencyCache.set(cacheKey, 'processing');
  
  next();
}

module.exports = idempotency;
