const prescriptionService = require('../services/prescriptionService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');
const logger = require('../config/logger');

async function list(req, res) {
  try {
    const r = await prescriptionService.list(req.user.userId, req.query);
    return paginatedResponse(res, r.prescriptions, r.total, r.page, r.limit, 'Prescriptions retrieved.');
  } catch (e) { logger.error('List prescriptions error:', { message: e.message }); return errorResponse(res, e.message, e.statusCode || 500); }
}
async function getActive(req, res) {
  try {
    const data = await prescriptionService.getActive(req.user.userId);
    return successResponse(res, data, 'Active prescriptions retrieved.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}
async function getById(req, res) {
  try {
    const data = await prescriptionService.getById(req.user.userId, req.params.id);
    return successResponse(res, data, 'Prescription retrieved.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}
async function create(req, res) {
  try {
    const data = await prescriptionService.create(req.user.userId, req.validatedBody);
    return successResponse(res, data, 'Prescription added.', 201);
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}
async function update(req, res) {
  try {
    const data = await prescriptionService.update(req.user.userId, req.params.id, req.validatedBody);
    return successResponse(res, data, 'Prescription updated.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}
async function remove(req, res) {
  try {
    const data = await prescriptionService.delete(req.user.userId, req.params.id);
    return successResponse(res, data, 'Prescription deleted.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}
async function aiExplain(req, res) {
  try {
    const data = await prescriptionService.aiExplain(req.user.userId, req.params.id);
    return successResponse(res, data, 'AI explanation generated.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}
async function getSideEffects(req, res) {
  try {
    const data = await prescriptionService.getSideEffects(req.user.userId, req.params.id);
    return successResponse(res, data, 'Side effects retrieved.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}
async function createSideEffect(req, res) {
  try {
    const data = await prescriptionService.createSideEffect(req.user.userId, req.params.id, req.validatedBody);
    return successResponse(res, data, 'Side effect logged.', 201);
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}
async function updateSideEffect(req, res) {
  try {
    const data = await prescriptionService.updateSideEffect(req.user.userId, req.params.id, req.params.sideEffectId, req.validatedBody);
    return successResponse(res, data, 'Side effect updated.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}
async function deleteSideEffect(req, res) {
  try {
    const data = await prescriptionService.deleteSideEffect(req.user.userId, req.params.id, req.params.sideEffectId);
    return successResponse(res, data, 'Side effect deleted.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}

module.exports = { list, getActive, getById, create, update, remove, aiExplain, getSideEffects, createSideEffect, updateSideEffect, deleteSideEffect };
