const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Symptom = sequelize.define('Symptom', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  family_member_id: { type: DataTypes.UUID, allowNull: true },
  symptom_name: { type: DataTypes.STRING(200), allowNull: false },
  severity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 10 } },
  onset_date: { type: DataTypes.DATEONLY, allowNull: false },
  onset_time: { type: DataTypes.TIME, allowNull: true },
  duration_hours: { type: DataTypes.INTEGER, allowNull: true },
  is_ongoing: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  resolved_date: { type: DataTypes.DATEONLY, allowNull: true },
  body_location: { type: DataTypes.STRING(100), allowNull: true },
  triggers: { type: DataTypes.TEXT, allowNull: true },
  relieved_by: { type: DataTypes.TEXT, allowNull: true },
  associated_symptoms: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  ai_insight: { type: DataTypes.TEXT, allowNull: true },
  related_consultation_id: { type: DataTypes.UUID, allowNull: true },
}, { tableName: 'symptoms', timestamps: true, underscored: true });

module.exports = Symptom;
