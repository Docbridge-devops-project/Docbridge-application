const { MedicineReminder, FollowupReminder } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

class ReminderService {
  
  async listMedicineReminders(userId, query = {}) {
    const { page = 1, limit = 10, isActive } = query;
    const where = { user_id: userId };
    if (isActive !== undefined) where.is_active = isActive === 'true';
    const { count, rows } = await MedicineReminder.findAndCountAll({
      where, order: [['created_at', 'DESC']], limit: parseInt(limit, 10), offset: (page - 1) * limit,
    });
    return { total: count, reminders: rows, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  }

  async getMedicineReminder(userId, id) {
    const r = await MedicineReminder.findOne({ where: { id, user_id: userId } });
    if (!r) { const e = new Error('Medicine reminder not found.'); e.statusCode = 404; throw e; }
    return r;
  }

  async createMedicineReminder(userId, data) {
    return MedicineReminder.create({
      user_id: userId, prescription_id: data.prescriptionId || null,
      family_member_id: data.familyMemberId || null,
      medicine_name: data.medicineName, dosage: data.dosage,
      reminder_times: data.reminderTimes, days_of_week: data.daysOfWeek || [1,2,3,4,5,6,7],
      start_date: data.startDate, end_date: data.endDate || null,
      is_active: true, notification_method: data.notificationMethod || 'in_app',
      snooze_minutes: data.snoozeMinutes || 10, notes: data.notes,
    });
  }

  async updateMedicineReminder(userId, id, data) {
    const r = await this.getMedicineReminder(userId, id);
    const fields = {};
    if (data.medicineName !== undefined) fields.medicine_name = data.medicineName;
    if (data.dosage !== undefined) fields.dosage = data.dosage;
    if (data.reminderTimes !== undefined) fields.reminder_times = data.reminderTimes;
    if (data.daysOfWeek !== undefined) fields.days_of_week = data.daysOfWeek;
    if (data.startDate !== undefined) fields.start_date = data.startDate;
    if (data.endDate !== undefined) fields.end_date = data.endDate;
    if (data.isActive !== undefined) fields.is_active = data.isActive;
    if (data.notificationMethod !== undefined) fields.notification_method = data.notificationMethod;
    if (data.snoozeMinutes !== undefined) fields.snooze_minutes = data.snoozeMinutes;
    if (data.notes !== undefined) fields.notes = data.notes;
    await r.update(fields);
    return r;
  }

  async deleteMedicineReminder(userId, id) {
    const r = await this.getMedicineReminder(userId, id);
    await r.destroy();
    return { message: 'Medicine reminder deleted.' };
  }

  
  async listFollowupReminders(userId, query = {}) {
    const { page = 1, limit = 10, isCompleted } = query;
    const where = { user_id: userId, is_active: true };
    if (isCompleted !== undefined) where.is_completed = isCompleted === 'true';
    const { count, rows } = await FollowupReminder.findAndCountAll({
      where, order: [['reminder_date', 'ASC']], limit: parseInt(limit, 10), offset: (page - 1) * limit,
    });
    return { total: count, reminders: rows, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  }

  async getFollowupReminder(userId, id) {
    const r = await FollowupReminder.findOne({ where: { id, user_id: userId } });
    if (!r) { const e = new Error('Follow-up reminder not found.'); e.statusCode = 404; throw e; }
    return r;
  }

  async createFollowupReminder(userId, data) {
    return FollowupReminder.create({
      user_id: userId, consultation_id: data.consultationId || null,
      family_member_id: data.familyMemberId || null,
      title: data.title, description: data.description,
      reminder_date: data.reminderDate, reminder_time: data.reminderTime || null,
      reminder_type: data.reminderType || 'followup',
      notification_method: data.notificationMethod || 'in_app', notes: data.notes,
    });
  }

  async updateFollowupReminder(userId, id, data) {
    const r = await this.getFollowupReminder(userId, id);
    const fields = {};
    if (data.title !== undefined) fields.title = data.title;
    if (data.description !== undefined) fields.description = data.description;
    if (data.reminderDate !== undefined) fields.reminder_date = data.reminderDate;
    if (data.reminderTime !== undefined) fields.reminder_time = data.reminderTime;
    if (data.reminderType !== undefined) fields.reminder_type = data.reminderType;
    if (data.isActive !== undefined) fields.is_active = data.isActive;
    if (data.notificationMethod !== undefined) fields.notification_method = data.notificationMethod;
    if (data.notes !== undefined) fields.notes = data.notes;
    await r.update(fields);
    return r;
  }

  async deleteFollowupReminder(userId, id) {
    const r = await this.getFollowupReminder(userId, id);
    await r.destroy();
    return { message: 'Follow-up reminder deleted.' };
  }

  async completeFollowup(userId, id) {
    const r = await this.getFollowupReminder(userId, id);
    await r.update({ is_completed: true, completed_at: new Date() });
    return r;
  }

  async getUpcoming(userId) {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const medicineReminders = await MedicineReminder.findAll({
      where: { user_id: userId, is_active: true, start_date: { [Op.lte]: nextWeek }, [Op.or]: [{ end_date: null }, { end_date: { [Op.gte]: today } }] },
      order: [['created_at', 'DESC']], limit: 10,
    });

    const followupReminders = await FollowupReminder.findAll({
      where: { user_id: userId, is_active: true, is_completed: false, reminder_date: { [Op.gte]: today, [Op.lte]: nextWeek } },
      order: [['reminder_date', 'ASC']], limit: 10,
    });

    return { medicineReminders, followupReminders };
  }
}

module.exports = new ReminderService();
