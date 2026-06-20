const healthSummaryService = require('../services/healthSummaryService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');

async function getDashboard(req, res) {
  try {
    const data = await healthSummaryService.getDashboard(req.user.userId, req.headers.authorization);
    const { serviceStatus, ...rest } = data;
    const isDegraded = Object.values(serviceStatus || {}).includes('degraded');
    
    return res.status(200).json({
      success: true,
      message: 'Dashboard data retrieved.',
      data: rest,
      ...(serviceStatus && { serviceStatus }),
      ...(isDegraded && { warning: 'Some data may be incomplete due to service unavailability.' })
    });
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}

async function getTimeline(req, res) {
  try {
    const data = await healthSummaryService.getTimeline(req.user.userId, req.query, req.headers.authorization);
    return paginatedResponse(res, data.events, data.total, data.page, data.limit, 'Timeline retrieved.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}

module.exports = { getDashboard, getTimeline };
