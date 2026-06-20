'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('consultations', {
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
      family_member_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'family_members', key: 'id' },
        onDelete: 'SET NULL',
      },
      doctor_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      doctor_specialty: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      hospital_clinic: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      consultation_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      consultation_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      chief_complaint: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      diagnosis: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      diagnosis_simplified: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      doctor_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      follow_up_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      follow_up_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'completed',
      },
      is_teleconsultation: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      attachments: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      ai_explanation: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('consultations', ['user_id'], { name: 'idx_consultations_user_id' });
    await queryInterface.addIndex('consultations', ['consultation_date'], { name: 'idx_consultations_consultation_date' });
    await queryInterface.addIndex('consultations', ['status'], { name: 'idx_consultations_status' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('consultations');
  },
};
