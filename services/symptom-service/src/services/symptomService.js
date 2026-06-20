const { Symptom } = require('../models');
const { Op, fn, col } = require('sequelize');
const logger = require('../config/logger');

class SymptomService {
  async list(userId, query = {}) {
    const { page = 1, limit = 10, isOngoing, familyMemberId, search } = query;
    const where = { user_id: userId };
    if (isOngoing !== undefined) where.is_ongoing = isOngoing === 'true';
    if (familyMemberId) where.family_member_id = familyMemberId;
    if (search) where.symptom_name = { [Op.iLike]: `%${search}%` };
    const { count, rows } = await Symptom.findAndCountAll({
      where, order: [['onset_date', 'DESC']], limit: parseInt(limit, 10), offset: (page - 1) * limit,
    });
    return { total: count, symptoms: rows, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  }

  async getById(userId, id) {
    const s = await Symptom.findOne({ where: { id, user_id: userId } });
    if (!s) { const e = new Error('Symptom not found.'); e.statusCode = 404; throw e; }
    return s;
  }

  async create(userId, data) {
    return Symptom.create({
      user_id: userId, family_member_id: data.familyMemberId || null,
      symptom_name: data.symptomName, severity: data.severity,
      onset_date: data.onsetDate, onset_time: data.onsetTime || null,
      duration_hours: data.durationHours, is_ongoing: data.isOngoing !== undefined ? data.isOngoing : true,
      resolved_date: data.resolvedDate || null, body_location: data.bodyLocation,
      triggers: data.triggers, relieved_by: data.relievedBy,
      associated_symptoms: data.associatedSymptoms || [],
      notes: data.notes, related_consultation_id: data.relatedConsultationId || null,
    });
  }

  async update(userId, id, data) {
    const s = await this.getById(userId, id);
    const fields = {};
    if (data.symptomName !== undefined) fields.symptom_name = data.symptomName;
    if (data.severity !== undefined) fields.severity = data.severity;
    if (data.onsetDate !== undefined) fields.onset_date = data.onsetDate;
    if (data.onsetTime !== undefined) fields.onset_time = data.onsetTime;
    if (data.durationHours !== undefined) fields.duration_hours = data.durationHours;
    if (data.isOngoing !== undefined) fields.is_ongoing = data.isOngoing;
    if (data.resolvedDate !== undefined) fields.resolved_date = data.resolvedDate;
    if (data.bodyLocation !== undefined) fields.body_location = data.bodyLocation;
    if (data.triggers !== undefined) fields.triggers = data.triggers;
    if (data.relievedBy !== undefined) fields.relieved_by = data.relievedBy;
    if (data.associatedSymptoms !== undefined) fields.associated_symptoms = data.associatedSymptoms;
    if (data.notes !== undefined) fields.notes = data.notes;
    if (data.relatedConsultationId !== undefined) fields.related_consultation_id = data.relatedConsultationId;
    if (data.familyMemberId !== undefined) fields.family_member_id = data.familyMemberId;
    await s.update(fields);
    return s;
  }

  async delete(userId, id) {
    const s = await this.getById(userId, id);
    await s.destroy();
    return { message: 'Symptom deleted.' };
  }

  async getOngoing(userId) {
    return Symptom.findAll({ where: { user_id: userId, is_ongoing: true }, order: [['onset_date', 'DESC']] });
  }

  async getTrends(userId) {
    const symptoms = await Symptom.findAll({
      where: { user_id: userId },
      order: [['onset_date', 'ASC']],
      attributes: ['symptom_name', 'severity', 'onset_date', 'is_ongoing'],
    });

    const grouped = {};
    for (const s of symptoms) {
      const name = s.symptom_name;
      if (!grouped[name]) grouped[name] = [];
      grouped[name].push({ date: s.onset_date, severity: s.severity, isOngoing: s.is_ongoing });
    }
    return grouped;
  }

  async aiInsight(userId, id) {
    const s = await this.getById(userId, id);
    const insight = s.ai_insight || 'AI insight will be generated when the AI Companion service is configured.';
    if (!s.ai_insight) await s.update({ ai_insight: insight });
    return { symptom: s, insight };
  }
}

module.exports = new SymptomService();
