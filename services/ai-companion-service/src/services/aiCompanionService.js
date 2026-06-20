const { ChatHistory } = require('../models');
const { callAzureOpenAI } = require('../config/azureOpenai');
const { buildUserContext } = require('./contextBuilderService');
const promptEngine = require('./promptEngineService');
const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

class AICompanionService {
  async chat(userId, message, sessionId = null) {
    const activeSessionId = sessionId || uuidv4();

    // Build context
    const healthContext = await buildUserContext(userId);
    const chatHistory = await ChatHistory.findAll({
      where: { user_id: userId, session_id: activeSessionId },
      order: [['created_at', 'ASC']], limit: 20,
      attributes: ['role', 'content'],
    });

    // Save user message
    await ChatHistory.create({
      user_id: userId, session_id: activeSessionId,
      role: 'user', content: message,
    });

    const messages = promptEngine.buildChatPrompt(message, {
      healthSnapshot: healthContext,
      chatHistory: chatHistory.map(m => ({ role: m.role, content: m.content })),
    });

    const aiResponse = await callAzureOpenAI(messages);

    // Add medical disclaimer
    const disclaimer = '\n\n---\n⚕️ *This is general health information, not medical advice. Always consult your doctor before making any health decisions.*';
    const fullResponse = aiResponse.content + disclaimer;

    // Save assistant response
    const savedMessage = await ChatHistory.create({
      user_id: userId, session_id: activeSessionId,
      role: 'assistant', content: fullResponse,
      context_snapshot: healthContext,
      tokens_used: aiResponse.tokensUsed,
      model_used: aiResponse.model,
    });

    return {
      sessionId: activeSessionId,
      message: { id: savedMessage.id, role: 'assistant', content: fullResponse, createdAt: savedMessage.created_at },
      tokensUsed: aiResponse.tokensUsed,
    };
  }

  async getHistory(userId, query = {}) {
    const { page = 1, limit = 20 } = query;
    const sessions = await ChatHistory.findAll({
      where: { user_id: userId },
      attributes: ['session_id', [ChatHistory.sequelize.fn('MIN', ChatHistory.sequelize.col('created_at')), 'started_at'],
        [ChatHistory.sequelize.fn('MAX', ChatHistory.sequelize.col('created_at')), 'last_message_at'],
        [ChatHistory.sequelize.fn('COUNT', ChatHistory.sequelize.col('id')), 'message_count']],
      group: ['session_id'],
      order: [[ChatHistory.sequelize.fn('MAX', ChatHistory.sequelize.col('created_at')), 'DESC']],
      limit: parseInt(limit, 10), offset: (page - 1) * limit, raw: true,
    });
    return sessions;
  }

  async getSessionHistory(userId, sessionId) {
    return ChatHistory.findAll({
      where: { user_id: userId, session_id: sessionId },
      order: [['created_at', 'ASC']],
    });
  }

  async deleteSession(userId, sessionId) {
    await ChatHistory.destroy({ where: { user_id: userId, session_id: sessionId } });
    return { message: 'Chat session deleted.' };
  }

  async explainMedicine(userId, medicineData) {
    const messages = promptEngine.buildMedicineExplainPrompt(medicineData);
    const response = await callAzureOpenAI(messages, { maxTokens: 1500 });
    return { explanation: response.content, tokensUsed: response.tokensUsed };
  }

  async explainLabReport(userId, reportData) {
    const messages = promptEngine.buildLabReportExplainPrompt(reportData);
    const response = await callAzureOpenAI(messages, { maxTokens: 1500 });
    return { explanation: response.content, tokensUsed: response.tokensUsed };
  }

  async explainSymptom(userId, symptomData) {
    const context = await buildUserContext(userId);
    const messages = promptEngine.buildSymptomInsightPrompt(symptomData, {
      medications: context.activeMedications,
    });
    const response = await callAzureOpenAI(messages, { maxTokens: 1200 });
    return { insight: response.content, tokensUsed: response.tokensUsed };
  }

  async generateQuestions(userId) {
    const context = await buildUserContext(userId);
    const messages = promptEngine.buildGenerateQuestionsPrompt({
      conditions: context.user?.chronic_conditions || [],
      medications: context.activeMedications,
      symptoms: context.ongoingSymptoms,
      labHighlights: context.recentLabReports.map(r => r.report_name).join(', '),
    });
    const response = await callAzureOpenAI(messages, { maxTokens: 1000 });
    return { questions: response.content, tokensUsed: response.tokensUsed };
  }

  getSuggestedQuestions() {
    return promptEngine.SUGGESTED_QUESTIONS;
  }
}

module.exports = new AICompanionService();
