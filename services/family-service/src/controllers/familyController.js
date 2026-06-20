const familyService = require('../services/familyService');
const { successResponse, errorResponse } = require('../utils/responseUtils');

async function list(req, res) { try { return successResponse(res, await familyService.list(req.user.userId), 'Family members retrieved.'); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function getById(req, res) { try { return successResponse(res, await familyService.getById(req.user.userId, req.params.id)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function create(req, res) { try { return successResponse(res, await familyService.create(req.user.userId, req.validatedBody), 'Family member added.', 201); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function update(req, res) { try { return successResponse(res, await familyService.update(req.user.userId, req.params.id, req.validatedBody)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function remove(req, res) { try { return successResponse(res, await familyService.delete(req.user.userId, req.params.id)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }

module.exports = { list, getById, create, update, remove };
