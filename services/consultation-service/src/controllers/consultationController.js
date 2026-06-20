const consultationService = require('../services/consultationService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');
const logger = require('../config/logger');

async function list(req, res) {
  try {
    const result = await consultationService.list(req.user.userId, req.query);
    return paginatedResponse(res, result.consultations, result.total, result.page, result.limit, 'Consultations retrieved.');
  } catch (error) {
    logger.error('List consultations error:', { message: error.message });
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

async function getById(req, res) {
  try {
    const consultation = await consultationService.getById(req.user.userId, req.params.id);
    return successResponse(res, consultation, 'Consultation retrieved.');
  } catch (error) {
    logger.error('Get consultation error:', { message: error.message });
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

async function create(req, res) {
  try {
    const consultation = await consultationService.create(req.user.userId, req.validatedBody);
    return successResponse(res, consultation, 'Consultation recorded successfully.', 201);
  } catch (error) {
    logger.error('Create consultation error:', { message: error.message });
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

async function update(req, res) {
  try {
    const consultation = await consultationService.update(req.user.userId, req.params.id, req.validatedBody);
    return successResponse(res, consultation, 'Consultation updated.');
  } catch (error) {
    logger.error('Update consultation error:', { message: error.message });
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

async function remove(req, res) {
  try {
    const result = await consultationService.delete(req.user.userId, req.params.id);
    return successResponse(res, result, 'Consultation deleted.');
  } catch (error) {
    logger.error('Delete consultation error:', { message: error.message });
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

async function aiExplain(req, res) {
  try {
    const result = await consultationService.aiExplain(req.user.userId, req.params.id);
    return successResponse(res, result, 'AI explanation generated.');
  } catch (error) {
    logger.error('AI explain error:', { message: error.message });
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

async function getStats(req, res) {
  try {
    const stats = await consultationService.getStats(req.user.userId);
    return successResponse(res, stats, 'Consultation stats retrieved.');
  } catch (error) {
    logger.error('Get stats error:', { message: error.message });
    return errorResponse(res, error.message, error.statusCode || 500);
  }
}

module.exports = { list, getById, create, update, remove, aiExplain, getStats };
