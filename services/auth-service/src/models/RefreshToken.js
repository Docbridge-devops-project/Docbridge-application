const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  is_revoked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  ip_address: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'refresh_tokens',
  timestamps: true,
  updatedAt: false,
  underscored: true,
});

RefreshToken.findValidToken = function (token) {
  return RefreshToken.findOne({
    where: {
      token,
      is_revoked: false,
      expires_at: { [Op.gt]: new Date() },
    },
  });
};

RefreshToken.prototype.isExpired = function () {
  return new Date() > this.expires_at;
};

module.exports = RefreshToken;
