'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: Sequelize.STRING(20),
        allowNull: true,
        validate: {
          isIn: [['male', 'female', 'other', 'prefer_not_to_say']],
        },
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      avatar_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'patient',
      },
      blood_group: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      height_cm: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      weight_kg: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      known_allergies: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
      },
      chronic_conditions: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
      },
      emergency_contact_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      emergency_contact_phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_email_verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('users', ['email'], { name: 'idx_users_email' });
    await queryInterface.addIndex('users', ['role'], { name: 'idx_users_role' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};
