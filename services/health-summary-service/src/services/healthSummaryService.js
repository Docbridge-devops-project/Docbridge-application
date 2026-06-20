const { sequelize } = require('../config/database');
const logger = require('../config/logger');
const InternalApi = require('./internalApiClient');

class HealthSummaryService {
  async getDashboard(userId, token) {
    try {
      const [[userRow]] = await sequelize.query(
        `SELECT first_name, last_name, blood_group, known_allergies, chronic_conditions, height_cm, weight_kg
         FROM users WHERE id = :userId`,
        { replacements: { userId } }
      );

      // const [[consultationStats]] = await sequelize.query(
      //   `SELECT COUNT(*) as total,
      //           COUNT(*) FILTER (WHERE status = 'completed') as completed,
      //           COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled
      //    FROM consultations WHERE user_id = :userId`,
      //   { replacements: { userId } }
      // );
      const consultationRes = await InternalApi.get('/consultations/stats/summary', token);
      let consultationStats = consultationRes?.data || null;

      // const [activeMeds] = await sequelize.query(
      //   `SELECT id, medicine_name, dosage, frequency, start_date, end_date, prescribing_doctor
      //    FROM prescriptions WHERE user_id = :userId AND is_active = true ORDER BY start_date DESC`,
      //   { replacements: { userId } }
      // );
      const prescriptionRes = await InternalApi.get('/prescriptions/active', token);
      let activeMeds = prescriptionRes?.data || null;
      if (activeMeds) {
        activeMeds = activeMeds.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)).map(p => ({
          id: p.id, medicine_name: p.medicine_name, dosage: p.dosage, frequency: p.frequency, start_date: p.start_date, end_date: p.end_date, prescribing_doctor: p.prescribing_doctor
        }));
      }

      // const [ongoingSymptoms] = await sequelize.query(
      //   `SELECT id, symptom_name, severity, onset_date, body_location
      //    FROM symptoms WHERE user_id = :userId AND is_ongoing = true ORDER BY severity DESC`,
      //   { replacements: { userId } }
      // );
      const symptomRes = await InternalApi.get('/symptoms/ongoing', token);
      let ongoingSymptoms = symptomRes?.data || null;
      if (ongoingSymptoms) {
        ongoingSymptoms = ongoingSymptoms.sort((a, b) => b.severity - a.severity).map(s => ({
          id: s.id, symptom_name: s.symptom_name, severity: s.severity, onset_date: s.onset_date, body_location: s.body_location
        }));
      }

      // const [upcomingFollowups] = await sequelize.query(
      //   `SELECT id, title, reminder_date, reminder_type
      //    FROM followup_reminders WHERE user_id = :userId AND is_active = true AND is_completed = false AND reminder_date >= CURRENT_DATE
      //    ORDER BY reminder_date ASC LIMIT 5`,
      //   { replacements: { userId } }
      // );
      const reminderRes = await InternalApi.get('/reminders/upcoming', token);
      let upcomingFollowups = reminderRes?.data?.followupReminders || reminderRes?.data || [];
      if (upcomingFollowups && Array.isArray(upcomingFollowups)) {
        upcomingFollowups = upcomingFollowups.map(r => ({
          id: r.id, title: r.title, reminder_date: r.reminder_date, reminder_type: r.reminder_type
        })).slice(0, 5);
      }

      // const [recentLabReports] = await sequelize.query(
      //   `SELECT id, report_name, report_type, report_date, status, flagged_values
      //    FROM lab_reports WHERE user_id = :userId ORDER BY report_date DESC LIMIT 3`,
      //   { replacements: { userId } }
      // );
      const labReportRes = await InternalApi.get('/lab-reports?limit=3', token);
      let recentLabReports = labReportRes?.data?.data || labReportRes?.data || null;
      if (recentLabReports && Array.isArray(recentLabReports)) {
        recentLabReports = recentLabReports.map(r => ({
          id: r.id, report_name: r.report_name, report_type: r.report_type, report_date: r.report_date, status: r.status, flagged_values: r.flagged_values
        }));
      } else if (!recentLabReports) {
        recentLabReports = null;
      }

      // const [[medReminderCount]] = await sequelize.query(
      //   `SELECT COUNT(*) as active_reminders FROM medicine_reminders WHERE user_id = :userId AND is_active = true`,
      //   { replacements: { userId } }
      // );
      const medReminderRes = await InternalApi.get('/reminders/medicine?is_active=true&limit=1', token);
      let medReminderCount = { active_reminders: medReminderRes?.pagination?.total || 0 };

      // Health score calculation (simple heuristic)
      let healthScore = 80;
      if (ongoingSymptoms) {
        if (ongoingSymptoms.length > 3) healthScore -= 10;
        if (ongoingSymptoms.some(s => s.severity >= 7)) healthScore -= 10;
      }
      const flaggedReports = (recentLabReports || []).filter(r => {
        const flagged = r.flagged_values;
        return Array.isArray(flagged) ? flagged.length > 0 : (flagged && flagged !== '[]');
      });
      if (flaggedReports.length > 0) healthScore -= 5;
      if (!activeMeds || activeMeds.length === 0) {
        if (!ongoingSymptoms || ongoingSymptoms.length === 0) {
          healthScore = Math.min(healthScore + 5, 100);
        }
      }
      healthScore = Math.max(healthScore, 20);

      // Compact arrays to return only small requested fields (name/dosage/date/title only)
      const activeMedicationsCompact = (activeMeds || []).map(p => ({
        id: p.id,
        medicine_name: p.medicine_name,
        dosage: p.dosage
      }));

      const ongoingSymptomsCompact = (ongoingSymptoms || []).map(s => ({
        id: s.id,
        symptom_name: s.symptom_name,
        severity: s.severity
      }));

      const upcomingFollowupsCompact = (upcomingFollowups || []).map(r => ({
        id: r.id,
        title: r.title,
        reminder_date: r.reminder_date
      }));

      const recentLabReportsCompact = (recentLabReports || []).map(r => ({
        id: r.id,
        report_name: r.report_name,
        status: r.status,
        flagged_count: Array.isArray(r.flagged_values) ? r.flagged_values.length : 0
      }));

      return {
        user: userRow || {},
        healthScore,
        consultations: consultationStats,
        activeMedications: activeMedicationsCompact,
        activeMedicationCount: activeMedicationsCompact.length,
        ongoingSymptoms: ongoingSymptomsCompact,
        ongoingSymptomCount: ongoingSymptomsCompact.length,
        upcomingFollowups: upcomingFollowupsCompact,
        recentLabReports: recentLabReportsCompact,
        activeReminderCount: parseInt(medReminderCount?.active_reminders || 0, 10),
        serviceStatus: {
          symptoms: symptomRes ? 'healthy' : 'degraded',
          prescriptions: prescriptionRes ? 'healthy' : 'degraded',
          labReports: labReportRes ? 'healthy' : 'degraded',
          consultations: consultationRes ? 'healthy' : 'degraded',
          reminders: (reminderRes && medReminderRes) ? 'healthy' : 'degraded'
        }
      };
    } catch (error) {
      logger.error('Dashboard aggregation error:', { message: error.message });
      throw error;
    }
  }

  async getTimeline(userId, query = {}, token) {
    const { page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    try {
      const [symptomRes, prescriptionRes, labReportRes, consultationRes] = await Promise.allSettled([
        InternalApi.get('/symptoms?limit=1000', token),
        InternalApi.get('/prescriptions?limit=1000', token),
        InternalApi.get('/lab-reports?limit=1000', token),
        InternalApi.get('/consultations?limit=1000', token)
      ]);

      let totalSymptoms = 0;
      let symptomEvents = [];
      if (symptomRes.status === 'fulfilled' && symptomRes.value && symptomRes.value.data) {
        totalSymptoms = symptomRes.value.pagination?.total || (Array.isArray(symptomRes.value.data) ? symptomRes.value.data.length : 0);
        symptomEvents = symptomRes.value.data.map(s => ({
          id: s.id,
          type: 'symptom',
          event_date: s.onset_date,
          title: s.symptom_name,
          description: s.notes,
          status: s.is_ongoing ? 'ongoing' : 'resolved',
          created_at: s.created_at
        }));
      }

      let totalPrescriptions = 0;
      let prescriptionEvents = [];
      if (prescriptionRes.status === 'fulfilled' && prescriptionRes.value && prescriptionRes.value.data) {
        totalPrescriptions = prescriptionRes.value.pagination?.total || (Array.isArray(prescriptionRes.value.data) ? prescriptionRes.value.data.length : 0);
        prescriptionEvents = prescriptionRes.value.data.map(p => ({
          id: p.id,
          type: 'prescription',
          event_date: p.start_date,
          title: p.medicine_name,
          description: p.purpose_simplified || p.purpose,
          status: p.is_active ? 'active' : 'completed',
          created_at: p.created_at
        }));
      }

      let totalLabReports = 0;
      let labReportEvents = [];
      if (labReportRes.status === 'fulfilled' && labReportRes.value && labReportRes.value.data) {
        totalLabReports = labReportRes.value.pagination?.total || (Array.isArray(labReportRes.value.data) ? labReportRes.value.data.length : 0);
        labReportEvents = labReportRes.value.data.map(l => ({
          id: l.id,
          type: 'lab_report',
          event_date: l.report_date,
          title: l.report_name,
          description: l.overall_interpretation_simplified || l.overall_interpretation,
          status: l.status,
          created_at: l.created_at
        }));
      }

      let totalConsultations = 0;
      let consultationEvents = [];
      if (consultationRes.status === 'fulfilled' && consultationRes.value && consultationRes.value.data) {
        totalConsultations = consultationRes.value.pagination?.total || (Array.isArray(consultationRes.value.data) ? consultationRes.value.data.length : 0);
        consultationEvents = consultationRes.value.data.map(c => ({
          id: c.id,
          type: 'consultation',
          event_date: c.consultation_date,
          title: c.doctor_name,
          description: c.diagnosis_simplified || c.diagnosis || c.chief_complaint,
          status: c.status,
          created_at: c.created_at
        }));
      }

      let allEvents = [...symptomEvents, ...prescriptionEvents, ...labReportEvents, ...consultationEvents];
      allEvents.sort((a, b) => {
        const dateA = new Date(a.event_date);
        const dateB = new Date(b.event_date);
        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        const createA = new Date(a.created_at);
        const createB = new Date(b.created_at);
        return createB - createA;
      });

      const paginatedEvents = allEvents.slice(offset, offset + limit);
      const grandTotal = totalSymptoms + totalPrescriptions + totalLabReports + totalConsultations;

      return {
        events: paginatedEvents,
        total: grandTotal,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      };
    } catch (error) {
      logger.error('Timeline aggregation error:', { message: error.message });
      throw error;
    }
  }
}

module.exports = new HealthSummaryService();
