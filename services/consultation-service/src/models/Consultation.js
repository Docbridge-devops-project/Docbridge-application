const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Consultation = sequelize.define('Consultation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  family_member_id: { type: DataTypes.UUID, allowNull: true },
  doctor_name: { type: DataTypes.STRING(200), allowNull: true },
  doctor_specialty: { type: DataTypes.STRING(100), allowNull: true },
  hospital_clinic: { type: DataTypes.STRING(200), allowNull: true },
  consultation_date: { type: DataTypes.DATEONLY, allowNull: false },
  consultation_time: { type: DataTypes.TIME, allowNull: true },
  chief_complaint: { type: DataTypes.TEXT, allowNull: true },
  diagnosis: { type: DataTypes.TEXT, allowNull: true },
  diagnosis_simplified: { type: DataTypes.TEXT, allowNull: true },
  doctor_notes: { type: DataTypes.TEXT, allowNull: true },
  follow_up_date: { type: DataTypes.DATEONLY, allowNull: true },
  follow_up_notes: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'completed', validate: { isIn: [['scheduled', 'completed', 'cancelled', 'missed']] } },
  is_teleconsultation: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  attachments: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
  ai_explanation: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'consultations',
  timestamps: true,
  underscored: true,
});

module.exports = Consultation;
