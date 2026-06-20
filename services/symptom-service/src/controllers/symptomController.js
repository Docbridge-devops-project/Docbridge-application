const symptomService = require('../services/symptomService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');

async function list(req, res) { try { const r = await symptomService.list(req.user.userId, req.query); return paginatedResponse(res, r.symptoms, r.total, r.page, r.limit); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function getById(req, res) { try { return successResponse(res, await symptomService.getById(req.user.userId, req.params.id)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function create(req, res) { try { return successResponse(res, await symptomService.create(req.user.userId, req.validatedBody), 'Symptom logged.', 201); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function update(req, res) { try { return successResponse(res, await symptomService.update(req.user.userId, req.params.id, req.validatedBody)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function remove(req, res) { try { return successResponse(res, await symptomService.delete(req.user.userId, req.params.id)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function getOngoing(req, res) { try { return successResponse(res, await symptomService.getOngoing(req.user.userId)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function getTrends(req, res) { try { return successResponse(res, await symptomService.getTrends(req.user.userId)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function aiInsight(req, res) { try { return successResponse(res, await symptomService.aiInsight(req.user.userId, req.params.id)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }

module.exports = { list, getById, create, update, remove, getOngoing, getTrends, aiInsight };
