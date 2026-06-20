const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChatHistory = sequelize.define('ChatHistory', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.UUID, allowNull: false },
  session_id: { type: DataTypes.UUID, allowNull: false, defaultValue: DataTypes.UUIDV4 },
  role: { type: DataTypes.STRING(20), allowNull: false, validate: { isIn: [['user', 'assistant', 'system']] } },
  content: { type: DataTypes.TEXT, allowNull: false },
  context_snapshot: { type: DataTypes.JSONB, allowNull: true },
  tokens_used: { type: DataTypes.INTEGER, allowNull: true },
  model_used: { type: DataTypes.STRING(50), defaultValue: 'gpt-4' },
  feedback: { type: DataTypes.STRING(20), allowNull: true },
  is_flagged: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { tableName: 'chat_history', timestamps: true, updatedAt: false, underscored: true });

module.exports = ChatHistory;
