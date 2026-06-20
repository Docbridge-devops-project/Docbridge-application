const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FollowupReminder = sequelize.define('FollowupReminder', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  consultation_id: { type: DataTypes.UUID, allowNull: true },
  family_member_id: { type: DataTypes.UUID, allowNull: true },
  title: { type: DataTypes.STRING(300), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  reminder_date: { type: DataTypes.DATEONLY, allowNull: false },
  reminder_time: { type: DataTypes.TIME, allowNull: true },
  reminder_type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'followup' },
  is_completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  notification_method: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'in_app' },
  completed_at: { type: DataTypes.DATE, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'followup_reminders', timestamps: true, underscored: true });

module.exports = FollowupReminder;
