'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('symptoms', {
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
      symptom_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      severity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      onset_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      onset_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      duration_hours: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_ongoing: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      resolved_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      body_location: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      triggers: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      relieved_by: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      associated_symptoms: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ai_insight: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      related_consultation_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'consultations', key: 'id' },
        onDelete: 'SET NULL',
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

    await queryInterface.addIndex('symptoms', ['user_id'], { name: 'idx_symptoms_user_id' });
    await queryInterface.addIndex('symptoms', ['onset_date'], { name: 'idx_symptoms_onset_date' });
    await queryInterface.addIndex('symptoms', ['is_ongoing'], { name: 'idx_symptoms_is_ongoing' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('symptoms');
  },
};
