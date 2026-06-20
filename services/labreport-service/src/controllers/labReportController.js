const labReportService = require('../services/labReportService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');

async function list(req, res) { try { const r = await labReportService.list(req.user.userId, req.query); return paginatedResponse(res, r.reports, r.total, r.page, r.limit); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function getById(req, res) { try { return successResponse(res, await labReportService.getById(req.user.userId, req.params.id)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function create(req, res) { try { return successResponse(res, await labReportService.create(req.user.userId, req.validatedBody), 'Lab report added.', 201); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function update(req, res) { try { return successResponse(res, await labReportService.update(req.user.userId, req.params.id, req.validatedBody)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function remove(req, res) { try { return successResponse(res, await labReportService.delete(req.user.userId, req.params.id)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function getFlagged(req, res) { try { return successResponse(res, await labReportService.getFlagged(req.user.userId), 'Flagged reports.'); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function aiExplain(req, res) { try { return successResponse(res, await labReportService.aiExplain(req.user.userId, req.params.id)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function getTrends(req, res) { try { return successResponse(res, await labReportService.getTrends(req.user.userId, req.params.testName)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }

module.exports = { list, getById, create, update, remove, getFlagged, aiExplain, getTrends };
