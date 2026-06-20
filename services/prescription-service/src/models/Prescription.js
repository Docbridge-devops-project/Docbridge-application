const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Prescription = sequelize.define('Prescription', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  consultation_id: { type: DataTypes.UUID, allowNull: true },
  family_member_id: { type: DataTypes.UUID, allowNull: true },
  medicine_name: { type: DataTypes.STRING(200), allowNull: false },
  generic_name: { type: DataTypes.STRING(200), allowNull: true },
  dosage: { type: DataTypes.STRING(100), allowNull: false },
  frequency: { type: DataTypes.STRING(100), allowNull: false },
  duration_days: { type: DataTypes.INTEGER, allowNull: true },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: true },
  instructions: { type: DataTypes.TEXT, allowNull: true },
  purpose: { type: DataTypes.TEXT, allowNull: true },
  purpose_simplified: { type: DataTypes.TEXT, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  refill_needed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  refill_date: { type: DataTypes.DATEONLY, allowNull: true },
  prescribing_doctor: { type: DataTypes.STRING(200), allowNull: true },
  pharmacy_notes: { type: DataTypes.TEXT, allowNull: true },
  ai_explanation: { type: DataTypes.TEXT, allowNull: true },
  side_effect_warnings: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },
  food_interactions: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },
}, { tableName: 'prescriptions', timestamps: true, underscored: true });

module.exports = Prescription;
