'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chat_history', {
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
      session_id: {
        type: Sequelize.UUID,
        allowNull: false,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      context_snapshot: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      tokens_used: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      model_used: {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'gpt-4',
      },
      feedback: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      is_flagged: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('chat_history', ['user_id'], { name: 'idx_chat_history_user_id' });
    await queryInterface.addIndex('chat_history', ['session_id'], { name: 'idx_chat_history_session_id' });
    await queryInterface.addIndex('chat_history', ['created_at'], { name: 'idx_chat_history_created_at' });

    
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE 'plpgsql';

      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_side_effects_log_updated_at BEFORE UPDATE ON side_effects_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_medicine_reminders_updated_at BEFORE UPDATE ON medicine_reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_followup_reminders_updated_at BEFORE UPDATE ON followup_reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_lab_reports_updated_at BEFORE UPDATE ON lab_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_symptoms_updated_at BEFORE UPDATE ON symptoms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;');
    await queryInterface.dropTable('chat_history');
  },
};
