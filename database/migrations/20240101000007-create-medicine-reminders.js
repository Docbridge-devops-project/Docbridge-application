'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('medicine_reminders', {
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
      prescription_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'prescriptions', key: 'id' },
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
      dosage: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      reminder_times: {
        type: Sequelize.ARRAY(Sequelize.TEXT),
        allowNull: false,
      },
      days_of_week: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        allowNull: true,
        defaultValue: [1, 2, 3, 4, 5, 6, 7],
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
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
      last_triggered_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      snooze_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 10,
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

    await queryInterface.addIndex('medicine_reminders', ['user_id'], { name: 'idx_medicine_reminders_user_id' });
    await queryInterface.addIndex('medicine_reminders', ['is_active'], { name: 'idx_medicine_reminders_is_active' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('medicine_reminders');
  },
};
