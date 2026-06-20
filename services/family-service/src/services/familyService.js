const { FamilyMember } = require('../models');
const logger = require('../config/logger');

class FamilyService {
  async list(userId) {
    return FamilyMember.findAll({ where: { primary_user_id: userId, is_active: true }, order: [['created_at', 'ASC']] });
  }

  async getById(userId, id) {
    const fm = await FamilyMember.findOne({ where: { id, primary_user_id: userId } });
    if (!fm) { const e = new Error('Family member not found.'); e.statusCode = 404; throw e; }
    return fm;
  }

  async create(userId, data) {
    return FamilyMember.create({
      primary_user_id: userId, first_name: data.firstName, last_name: data.lastName,
      relationship: data.relationship, date_of_birth: data.dateOfBirth || null,
      gender: data.gender, blood_group: data.bloodGroup,
      known_allergies: data.knownAllergies || [], chronic_conditions: data.chronicConditions || [],
      notes: data.notes,
    });
  }

  async update(userId, id, data) {
    const fm = await this.getById(userId, id);
    const fields = {};
    if (data.firstName !== undefined) fields.first_name = data.firstName;
    if (data.lastName !== undefined) fields.last_name = data.lastName;
    if (data.relationship !== undefined) fields.relationship = data.relationship;
    if (data.dateOfBirth !== undefined) fields.date_of_birth = data.dateOfBirth;
    if (data.gender !== undefined) fields.gender = data.gender;
    if (data.bloodGroup !== undefined) fields.blood_group = data.bloodGroup;
    if (data.knownAllergies !== undefined) fields.known_allergies = data.knownAllergies;
    if (data.chronicConditions !== undefined) fields.chronic_conditions = data.chronicConditions;
    if (data.notes !== undefined) fields.notes = data.notes;
    await fm.update(fields);
    return fm;
  }

  async delete(userId, id) {
    const fm = await this.getById(userId, id);
    await fm.update({ is_active: false });
    return { message: 'Family member removed.' };
  }
}

module.exports = new FamilyService();
