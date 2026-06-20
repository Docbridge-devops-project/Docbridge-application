'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('followup_reminders', {
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
      title: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reminder_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      reminder_time: {
        type: Sequelize.TIME,
        allowNull: true,
      },
      reminder_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'followup',
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      notification_method: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'in_app',
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notes: {
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

    await queryInterface.addIndex('followup_reminders', ['user_id'], { name: 'idx_followup_reminders_user_id' });
    await queryInterface.addIndex('followup_reminders', ['reminder_date'], { name: 'idx_followup_reminders_reminder_date' });
    await queryInterface.addIndex('followup_reminders', ['is_completed'], { name: 'idx_followup_reminders_is_completed' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('followup_reminders');
  },
};
