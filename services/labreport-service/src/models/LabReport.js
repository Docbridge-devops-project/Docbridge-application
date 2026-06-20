const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LabReport = sequelize.define('LabReport', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  consultation_id: { type: DataTypes.UUID, allowNull: true },
  family_member_id: { type: DataTypes.UUID, allowNull: true },
  report_name: { type: DataTypes.STRING(300), allowNull: false },
  report_type: { type: DataTypes.STRING(100), allowNull: false },
  lab_name: { type: DataTypes.STRING(200), allowNull: true },
  report_date: { type: DataTypes.DATEONLY, allowNull: false },
  ordered_by_doctor: { type: DataTypes.STRING(200), allowNull: true },
  results: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  flagged_values: { type: DataTypes.JSONB, defaultValue: [] },
  overall_interpretation: { type: DataTypes.TEXT, allowNull: true },
  overall_interpretation_simplified: { type: DataTypes.TEXT, allowNull: true },
  ai_explanation: { type: DataTypes.TEXT, allowNull: true },
  file_url: { type: DataTypes.TEXT, allowNull: true },
  raw_text: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'final' },
}, { tableName: 'lab_reports', timestamps: true, underscored: true });

module.exports = LabReport;
