const aiService = require('../services/aiCompanionService');
const { successResponse, errorResponse } = require('../utils/responseUtils');
const logger = require('../config/logger');

async function chat(req, res) {
  try {
    const { message, sessionId } = req.validatedBody;
    const result = await aiService.chat(req.user.userId, message, sessionId);
    return successResponse(res, result, 'Response generated.');
  } catch (e) {
    logger.error('Chat error:', { message: e.message });
    const fallbackResult = {
      sessionId: req.validatedBody.sessionId || 'error-session',
      message: {
        id: 'fallback-' + Date.now(),
        role: 'assistant',
        content: 'I am having trouble connecting right now. Please try again in a moment.\n\n---\n⚕️ *This is general health information, not medical advice. Always consult your doctor before making any health decisions.*',
        createdAt: new Date().toISOString()
      },
      tokensUsed: 0
    };
    return successResponse(res, fallbackResult, 'Response generated with fallback.', 200);
  }
}

async function getHistory(req, res) {
  try {
    const data = await aiService.getHistory(req.user.userId, req.query);
    return successResponse(res, data, 'Chat history retrieved.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}

async function getSessionHistory(req, res) {
  try {
    const data = await aiService.getSessionHistory(req.user.userId, req.params.sessionId);
    return successResponse(res, data, 'Session history retrieved.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}

async function deleteSession(req, res) {
  try {
    const data = await aiService.deleteSession(req.user.userId, req.params.sessionId);
    return successResponse(res, data);
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}

async function explainMedicine(req, res) {
  try {
    const data = await aiService.explainMedicine(req.user.userId, req.validatedBody);
    return successResponse(res, data, 'Medicine explanation generated.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}

async function explainLabReport(req, res) {
  try {
    const data = await aiService.explainLabReport(req.user.userId, req.validatedBody);
    return successResponse(res, data, 'Lab report explanation generated.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}

async function explainSymptom(req, res) {
  try {
    const data = await aiService.explainSymptom(req.user.userId, req.validatedBody);
    return successResponse(res, data, 'Symptom insight generated.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}

async function generateQuestions(req, res) {
  try {
    const data = await aiService.generateQuestions(req.user.userId);
    return successResponse(res, data, 'Questions generated.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}

async function getSuggestedQuestions(req, res) {
  try {
    const data = aiService.getSuggestedQuestions();
    return successResponse(res, data, 'Suggested questions.');
  } catch (e) { return errorResponse(res, e.message, e.statusCode || 500); }
}

module.exports = { chat, getHistory, getSessionHistory, deleteSession, explainMedicine, explainLabReport, explainSymptom, generateQuestions, getSuggestedQuestions };
