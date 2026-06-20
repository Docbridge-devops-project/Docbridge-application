const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MedicineReminder = sequelize.define('MedicineReminder', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  prescription_id: { type: DataTypes.UUID, allowNull: true },
  family_member_id: { type: DataTypes.UUID, allowNull: true },
  medicine_name: { type: DataTypes.STRING(200), allowNull: false },
  dosage: { type: DataTypes.STRING(100), allowNull: false },
  reminder_times: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: false },
  days_of_week: { type: DataTypes.ARRAY(DataTypes.INTEGER), defaultValue: [1,2,3,4,5,6,7] },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  notification_method: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'in_app' },
  last_triggered_at: { type: DataTypes.DATE, allowNull: true },
  snooze_minutes: { type: DataTypes.INTEGER, defaultValue: 10 },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'medicine_reminders', timestamps: true, underscored: true });

module.exports = MedicineReminder;
