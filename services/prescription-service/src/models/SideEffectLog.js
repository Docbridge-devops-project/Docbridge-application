const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SideEffectLog = sequelize.define('SideEffectLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  prescription_id: { type: DataTypes.UUID, allowNull: false },
  effect_description: { type: DataTypes.TEXT, allowNull: false },
  severity: { type: DataTypes.STRING(20), allowNull: false, validate: { isIn: [['mild', 'moderate', 'severe']] } },
  onset_date: { type: DataTypes.DATEONLY, allowNull: false },
  resolved_date: { type: DataTypes.DATEONLY, allowNull: true },
  is_resolved: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  action_taken: { type: DataTypes.TEXT, allowNull: true },
  doctor_notified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'side_effects_log', timestamps: true, underscored: true });

module.exports = SideEffectLog;
