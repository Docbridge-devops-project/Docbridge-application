'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('side_effects_log', {
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
        allowNull: false,
        references: { model: 'prescriptions', key: 'id' },
        onDelete: 'CASCADE',
      },
      effect_description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      severity: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      onset_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      resolved_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      is_resolved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      action_taken: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      doctor_notified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex('side_effects_log', ['user_id'], { name: 'idx_side_effects_log_user_id' });
    await queryInterface.addIndex('side_effects_log', ['prescription_id'], { name: 'idx_side_effects_log_prescription_id' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('side_effects_log');
  },
};
