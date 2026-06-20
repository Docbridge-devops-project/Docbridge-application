'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('prescriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      consultation_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'consultations', key: 'id' },
        onDelete: 'SET NULL',
      },
      family_member_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'family_members', key: 'id' },
        onDelete: 'SET NULL',
      },
      medicine_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      generic_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      dosage: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      frequency: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      duration_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      purpose: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      purpose_simplified: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      refill_needed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      refill_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      prescribing_doctor: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      pharmacy_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ai_explanation: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      side_effect_warnings: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
      },
      food_interactions: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
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

    await queryInterface.addIndex('prescriptions', ['user_id'], { name: 'idx_prescriptions_user_id' });
    await queryInterface.addIndex('prescriptions', ['is_active'], { name: 'idx_prescriptions_is_active' });
    await queryInterface.addIndex('prescriptions', ['consultation_id'], { name: 'idx_prescriptions_consultation_id' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('prescriptions');
  },
};
