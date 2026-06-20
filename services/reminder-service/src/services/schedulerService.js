const cron = require('node-cron');
const { MedicineReminder, FollowupReminder } = require('../models');
const { Op } = require('sequelize');
const logger = require('../config/logger');

function initializeScheduler() {
  logger.info('Initializing reminder scheduler — checking every minute');

  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM
      const currentDay = now.getDay() || 7; // 1=Mon, 7=Sun
      const today = now.toISOString().split('T')[0];

      // Check medicine reminders
      const medicineReminders = await MedicineReminder.findAll({
        where: {
          is_active: true,
          start_date: { [Op.lte]: today },
          [Op.or]: [{ end_date: null }, { end_date: { [Op.gte]: today } }],
        },
      });

      for (const reminder of medicineReminders) {
        const daysMatch = reminder.days_of_week && reminder.days_of_week.includes(currentDay);
        const timeMatch = reminder.reminder_times && reminder.reminder_times.some(t => t.slice(0, 5) === currentTime);

        if (daysMatch && timeMatch) {
          logger.info(`Medicine reminder triggered: ${reminder.id} — ${reminder.medicine_name} ${reminder.dosage}`);
          await reminder.update({ last_triggered_at: now });
        }
      }

      // Check followup reminders due today
      const followupReminders = await FollowupReminder.findAll({
        where: {
          is_active: true,
          is_completed: false,
          reminder_date: today,
        },
      });

      for (const reminder of followupReminders) {
        if (reminder.reminder_time) {
          const reminderTime = reminder.reminder_time.slice(0, 5);
          if (reminderTime === currentTime) {
            logger.info(`Follow-up reminder triggered: ${reminder.id} — ${reminder.title}`);
          }
        }
      }
    } catch (error) {
      logger.error('Scheduler error:', { message: error.message });
    }
  });
}

module.exports = { initializeScheduler };
