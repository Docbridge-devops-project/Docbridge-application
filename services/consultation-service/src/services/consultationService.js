const { Consultation } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

class ConsultationService {
  async list(userId, query = {}) {
    const { page = 1, limit = 10, status, familyMemberId, search } = query;
    const offset = (page - 1) * limit;
    const where = { user_id: userId };

    if (status) where.status = status;
    if (familyMemberId) where.family_member_id = familyMemberId;
    if (search) {
      where[Op.or] = [
        { doctor_name: { [Op.iLike]: `%${search}%` } },
        { chief_complaint: { [Op.iLike]: `%${search}%` } },
        { diagnosis: { [Op.iLike]: `%${search}%` } },
        { hospital_clinic: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Consultation.findAndCountAll({
      where,
      order: [['consultation_date', 'DESC'], ['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    });

    return { total: count, consultations: rows, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  }

  async getById(userId, id) {
    const consultation = await Consultation.findOne({ where: { id, user_id: userId } });
    if (!consultation) {
      const error = new Error('Consultation not found.');
      error.statusCode = 404;
      throw error;
    }
    return consultation;
  }

  async create(userId, data) {
    const consultation = await Consultation.create({
      user_id: userId,
      family_member_id: data.familyMemberId || null,
      doctor_name: data.doctorName,
      doctor_specialty: data.doctorSpecialty,
      hospital_clinic: data.hospitalClinic,
      consultation_date: data.consultationDate,
      consultation_time: data.consultationTime || null,
      chief_complaint: data.chiefComplaint,
      diagnosis: data.diagnosis,
      diagnosis_simplified: data.diagnosisSimplified,
      doctor_notes: data.doctorNotes,
      follow_up_date: data.followUpDate || null,
      follow_up_notes: data.followUpNotes,
      status: data.status || 'completed',
      is_teleconsultation: data.isTeleconsultation || false,
      attachments: data.attachments || [],
    });
    logger.info(`Consultation created: ${consultation.id} for user: ${userId}`);
    return consultation;
  }

  async update(userId, id, data) {
    const consultation = await this.getById(userId, id);
    const updateFields = {};
    if (data.familyMemberId !== undefined) updateFields.family_member_id = data.familyMemberId;
    if (data.doctorName !== undefined) updateFields.doctor_name = data.doctorName;
    if (data.doctorSpecialty !== undefined) updateFields.doctor_specialty = data.doctorSpecialty;
    if (data.hospitalClinic !== undefined) updateFields.hospital_clinic = data.hospitalClinic;
    if (data.consultationDate !== undefined) updateFields.consultation_date = data.consultationDate;
    if (data.consultationTime !== undefined) updateFields.consultation_time = data.consultationTime;
    if (data.chiefComplaint !== undefined) updateFields.chief_complaint = data.chiefComplaint;
    if (data.diagnosis !== undefined) updateFields.diagnosis = data.diagnosis;
    if (data.diagnosisSimplified !== undefined) updateFields.diagnosis_simplified = data.diagnosisSimplified;
    if (data.doctorNotes !== undefined) updateFields.doctor_notes = data.doctorNotes;
    if (data.followUpDate !== undefined) updateFields.follow_up_date = data.followUpDate;
    if (data.followUpNotes !== undefined) updateFields.follow_up_notes = data.followUpNotes;
    if (data.status !== undefined) updateFields.status = data.status;
    if (data.isTeleconsultation !== undefined) updateFields.is_teleconsultation = data.isTeleconsultation;
    if (data.attachments !== undefined) updateFields.attachments = data.attachments;

    await consultation.update(updateFields);
    logger.info(`Consultation updated: ${id}`);
    return consultation;
  }

  async delete(userId, id) {
    const consultation = await this.getById(userId, id);
    await consultation.destroy();
    logger.info(`Consultation deleted: ${id}`);
    return { message: 'Consultation deleted successfully.' };
  }

  async aiExplain(userId, id) {
    const consultation = await this.getById(userId, id);
    
    const explanation = consultation.ai_explanation || 'AI explanation will be generated when the AI Companion service is configured with Azure OpenAI credentials.';
    if (!consultation.ai_explanation) {
      await consultation.update({ ai_explanation: explanation });
    }
    return { consultation, explanation };
  }

  async getStats(userId) {
    const total = await Consultation.count({ where: { user_id: userId } });
    const completed = await Consultation.count({ where: { user_id: userId, status: 'completed' } });
    const scheduled = await Consultation.count({ where: { user_id: userId, status: 'scheduled' } });
    const cancelled = await Consultation.count({ where: { user_id: userId, status: 'cancelled' } });

    const lastVisit = await Consultation.findOne({
      where: { user_id: userId },
      attributes: ['consultation_date'],
      order: [['consultation_date', 'DESC']],
    });

    const nextFollowUp = await Consultation.findOne({
      where: {
        user_id: userId,
        follow_up_date: { [Op.gte]: new Date() },
      },
      attributes: ['follow_up_date'],
      order: [['follow_up_date', 'ASC']],
    });

    return {
      total,
      completed,
      scheduled,
      cancelled,
      lastVisitDate: lastVisit ? lastVisit.consultation_date : null,
      nextFollowUpDate: nextFollowUp ? nextFollowUp.follow_up_date : null,
    };
  }
}

module.exports = new ConsultationService();
