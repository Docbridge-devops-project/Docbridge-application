'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lab_reports', {
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
      report_name: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      report_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      lab_name: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      report_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      ordered_by_doctor: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      results: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
      },
      flagged_values: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      overall_interpretation: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      overall_interpretation_simplified: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ai_explanation: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      file_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      raw_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'final',
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

    await queryInterface.addIndex('lab_reports', ['user_id'], { name: 'idx_lab_reports_user_id' });
    await queryInterface.addIndex('lab_reports', ['report_date'], { name: 'idx_lab_reports_report_date' });
    await queryInterface.addIndex('lab_reports', ['report_type'], { name: 'idx_lab_reports_report_type' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('lab_reports');
  },
};
