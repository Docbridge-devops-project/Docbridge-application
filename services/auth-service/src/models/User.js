const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  last_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: { isIn: [['male', 'female', 'other', 'prefer_not_to_say']] },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  avatar_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'patient',
    validate: { isIn: [['patient', 'caregiver', 'admin']] },
  },
  blood_group: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  height_cm: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  weight_kg: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
  },
  known_allergies: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
  },
  chronic_conditions: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
  },
  emergency_contact_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  emergency_contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  is_email_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password_hash')) {
        user.password_hash = await bcrypt.hash(user.password_hash, 12);
      }
    },
  },
});

User.prototype.validatePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password_hash);
};

User.prototype.toSafeJSON = function () {
  const values = this.get({ plain: true });
  delete values.password_hash;
  return values;
};

User.findByEmail = function (email) {
  return User.findOne({ where: { email: email.toLowerCase() } });
};

module.exports = User;
