const reminderService = require('../services/reminderService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseUtils');

async function listMedicine(req, res) { try { const r = await reminderService.listMedicineReminders(req.user.userId, req.query); return paginatedResponse(res, r.reminders, r.total, r.page, r.limit); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function getMedicine(req, res) { try { return successResponse(res, await reminderService.getMedicineReminder(req.user.userId, req.params.id)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function createMedicine(req, res) { try { return successResponse(res, await reminderService.createMedicineReminder(req.user.userId, req.validatedBody), 'Reminder created.', 201); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function updateMedicine(req, res) { try { return successResponse(res, await reminderService.updateMedicineReminder(req.user.userId, req.params.id, req.validatedBody)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function deleteMedicine(req, res) { try { return successResponse(res, await reminderService.deleteMedicineReminder(req.user.userId, req.params.id)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function listFollowup(req, res) { try { const r = await reminderService.listFollowupReminders(req.user.userId, req.query); return paginatedResponse(res, r.reminders, r.total, r.page, r.limit); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function getFollowup(req, res) { try { return successResponse(res, await reminderService.getFollowupReminder(req.user.userId, req.params.id)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function createFollowup(req, res) { try { return successResponse(res, await reminderService.createFollowupReminder(req.user.userId, req.validatedBody), 'Reminder created.', 201); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function updateFollowup(req, res) { try { return successResponse(res, await reminderService.updateFollowupReminder(req.user.userId, req.params.id, req.validatedBody)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function deleteFollowup(req, res) { try { return successResponse(res, await reminderService.deleteFollowupReminder(req.user.userId, req.params.id)); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function completeFollowup(req, res) { try { return successResponse(res, await reminderService.completeFollowup(req.user.userId, req.params.id), 'Marked as completed.'); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }
async function getUpcoming(req, res) { try { return successResponse(res, await reminderService.getUpcoming(req.user.userId), 'Upcoming reminders.'); } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); } }

module.exports = { listMedicine, getMedicine, createMedicine, updateMedicine, deleteMedicine, listFollowup, getFollowup, createFollowup, updateFollowup, deleteFollowup, completeFollowup, getUpcoming };
