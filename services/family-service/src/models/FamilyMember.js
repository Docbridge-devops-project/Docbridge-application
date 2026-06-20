const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FamilyMember = sequelize.define('FamilyMember', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  primary_user_id: { type: DataTypes.UUID, allowNull: false },
  first_name: { type: DataTypes.STRING(100), allowNull: false },
  last_name: { type: DataTypes.STRING(100), allowNull: false },
  relationship: { type: DataTypes.STRING(50), allowNull: false },
  date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
  gender: { type: DataTypes.STRING(20), allowNull: true },
  blood_group: { type: DataTypes.STRING(10), allowNull: true },
  known_allergies: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },
  chronic_conditions: { type: DataTypes.ARRAY(DataTypes.TEXT), allowNull: true },
  avatar_url: { type: DataTypes.TEXT, allowNull: true },
  notes: { type: DataTypes.TEXT, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: 'family_members', timestamps: true, underscored: true });

module.exports = FamilyMember;
