const { Prescription, SideEffectLog } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

class PrescriptionService {
  async list(userId, query = {}) {
    const { page = 1, limit = 10, isActive, familyMemberId, search } = query;
    const offset = (page - 1) * limit;
    const where = { user_id: userId };
    if (isActive !== undefined) where.is_active = isActive === 'true';
    if (familyMemberId) where.family_member_id = familyMemberId;
    if (search) {
      where[Op.or] = [
        { medicine_name: { [Op.iLike]: `%${search}%` } },
        { generic_name: { [Op.iLike]: `%${search}%` } },
        { prescribing_doctor: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const { count, rows } = await Prescription.findAndCountAll({
      where, order: [['start_date', 'DESC']], limit: parseInt(limit, 10), offset,
      include: [{ model: SideEffectLog, as: 'sideEffects' }],
    });
    return { total: count, prescriptions: rows, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  }

  async getActive(userId) {
    return Prescription.findAll({
      where: { user_id: userId, is_active: true },
      order: [['start_date', 'DESC']],
      include: [{ model: SideEffectLog, as: 'sideEffects' }],
    });
  }

  async getById(userId, id) {
    const p = await Prescription.findOne({
      where: { id, user_id: userId },
      include: [{ model: SideEffectLog, as: 'sideEffects' }],
    });
    if (!p) { const e = new Error('Prescription not found.'); e.statusCode = 404; throw e; }
    return p;
  }

  async create(userId, data) {
    const p = await Prescription.create({
      user_id: userId,
      consultation_id: data.consultationId || null,
      family_member_id: data.familyMemberId || null,
      medicine_name: data.medicineName,
      generic_name: data.genericName,
      dosage: data.dosage,
      frequency: data.frequency,
      duration_days: data.durationDays,
      start_date: data.startDate,
      end_date: data.endDate || null,
      instructions: data.instructions,
      purpose: data.purpose,
      purpose_simplified: data.purposeSimplified,
      is_active: data.isActive !== undefined ? data.isActive : true,
      refill_needed: data.refillNeeded || false,
      refill_date: data.refillDate || null,
      prescribing_doctor: data.prescribingDoctor,
      pharmacy_notes: data.pharmacyNotes,
      side_effect_warnings: data.sideEffectWarnings || [],
      food_interactions: data.foodInteractions || [],
    });
    logger.info(`Prescription created: ${p.id}`);
    return p;
  }

  async update(userId, id, data) {
    const p = await this.getById(userId, id);
    const fields = {};
    if (data.medicineName !== undefined) fields.medicine_name = data.medicineName;
    if (data.genericName !== undefined) fields.generic_name = data.genericName;
    if (data.dosage !== undefined) fields.dosage = data.dosage;
    if (data.frequency !== undefined) fields.frequency = data.frequency;
    if (data.durationDays !== undefined) fields.duration_days = data.durationDays;
    if (data.startDate !== undefined) fields.start_date = data.startDate;
    if (data.endDate !== undefined) fields.end_date = data.endDate;
    if (data.instructions !== undefined) fields.instructions = data.instructions;
    if (data.purpose !== undefined) fields.purpose = data.purpose;
    if (data.purposeSimplified !== undefined) fields.purpose_simplified = data.purposeSimplified;
    if (data.isActive !== undefined) fields.is_active = data.isActive;
    if (data.refillNeeded !== undefined) fields.refill_needed = data.refillNeeded;
    if (data.refillDate !== undefined) fields.refill_date = data.refillDate;
    if (data.prescribingDoctor !== undefined) fields.prescribing_doctor = data.prescribingDoctor;
    if (data.pharmacyNotes !== undefined) fields.pharmacy_notes = data.pharmacyNotes;
    if (data.sideEffectWarnings !== undefined) fields.side_effect_warnings = data.sideEffectWarnings;
    if (data.foodInteractions !== undefined) fields.food_interactions = data.foodInteractions;
    if (data.consultationId !== undefined) fields.consultation_id = data.consultationId;
    if (data.familyMemberId !== undefined) fields.family_member_id = data.familyMemberId;
    await p.update(fields);
    return p;
  }

  async delete(userId, id) {
    const p = await this.getById(userId, id);
    await p.destroy();
    return { message: 'Prescription deleted.' };
  }

  async aiExplain(userId, id) {
    const p = await this.getById(userId, id);
    const explanation = p.ai_explanation || 'AI explanation will be generated when the AI Companion service is configured.';
    if (!p.ai_explanation) await p.update({ ai_explanation: explanation });
    return { prescription: p, explanation };
  }

  async getSideEffects(userId, prescriptionId) {
    await this.getById(userId, prescriptionId);
    return SideEffectLog.findAll({ where: { user_id: userId, prescription_id: prescriptionId }, order: [['onset_date', 'DESC']] });
  }

  async createSideEffect(userId, prescriptionId, data) {
    await this.getById(userId, prescriptionId);
    return SideEffectLog.create({
      user_id: userId, prescription_id: prescriptionId,
      effect_description: data.effectDescription, severity: data.severity,
      onset_date: data.onsetDate, resolved_date: data.resolvedDate || null,
      is_resolved: data.isResolved || false, action_taken: data.actionTaken,
      doctor_notified: data.doctorNotified || false,
    });
  }

  async updateSideEffect(userId, prescriptionId, sideEffectId, data) {
    await this.getById(userId, prescriptionId);
    const se = await SideEffectLog.findOne({ where: { id: sideEffectId, user_id: userId, prescription_id: prescriptionId } });
    if (!se) { const e = new Error('Side effect not found.'); e.statusCode = 404; throw e; }
    const fields = {};
    if (data.effectDescription !== undefined) fields.effect_description = data.effectDescription;
    if (data.severity !== undefined) fields.severity = data.severity;
    if (data.onsetDate !== undefined) fields.onset_date = data.onsetDate;
    if (data.resolvedDate !== undefined) fields.resolved_date = data.resolvedDate;
    if (data.isResolved !== undefined) fields.is_resolved = data.isResolved;
    if (data.actionTaken !== undefined) fields.action_taken = data.actionTaken;
    if (data.doctorNotified !== undefined) fields.doctor_notified = data.doctorNotified;
    await se.update(fields);
    return se;
  }

  async deleteSideEffect(userId, prescriptionId, sideEffectId) {
    await this.getById(userId, prescriptionId);
    const se = await SideEffectLog.findOne({ where: { id: sideEffectId, user_id: userId, prescription_id: prescriptionId } });
    if (!se) { const e = new Error('Side effect not found.'); e.statusCode = 404; throw e; }
    await se.destroy();
    return { message: 'Side effect log deleted.' };
  }
}

module.exports = new PrescriptionService();
