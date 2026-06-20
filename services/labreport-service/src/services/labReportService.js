const { LabReport } = require('../models');
const { Op, fn, col } = require('sequelize');
const logger = require('../config/logger');

class LabReportService {
  async list(userId, query = {}) {
    const { page = 1, limit = 10, reportType, familyMemberId, search } = query;
    const where = { user_id: userId };
    if (reportType) where.report_type = reportType;
    if (familyMemberId) where.family_member_id = familyMemberId;
    if (search) {
      where[Op.or] = [
        { report_name: { [Op.iLike]: `%${search}%` } },
        { lab_name: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const { count, rows } = await LabReport.findAndCountAll({
      where, order: [['report_date', 'DESC']], limit: parseInt(limit, 10), offset: (page - 1) * limit,
    });
    return { total: count, reports: rows, page: parseInt(page, 10), limit: parseInt(limit, 10) };
  }

  async getById(userId, id) {
    const r = await LabReport.findOne({ where: { id, user_id: userId } });
    if (!r) { const e = new Error('Lab report not found.'); e.statusCode = 404; throw e; }
    return r;
  }

  async create(userId, data) {
    return LabReport.create({
      user_id: userId, consultation_id: data.consultationId || null,
      family_member_id: data.familyMemberId || null,
      report_name: data.reportName, report_type: data.reportType,
      lab_name: data.labName, report_date: data.reportDate,
      ordered_by_doctor: data.orderedByDoctor, results: data.results || [],
      flagged_values: data.flaggedValues || [],
      overall_interpretation: data.overallInterpretation,
      overall_interpretation_simplified: data.overallInterpretationSimplified,
      file_url: data.fileUrl, raw_text: data.rawText,
      status: data.status || 'final',
    });
  }

  async update(userId, id, data) {
    const r = await this.getById(userId, id);
    const fields = {};
    if (data.reportName !== undefined) fields.report_name = data.reportName;
    if (data.reportType !== undefined) fields.report_type = data.reportType;
    if (data.labName !== undefined) fields.lab_name = data.labName;
    if (data.reportDate !== undefined) fields.report_date = data.reportDate;
    if (data.orderedByDoctor !== undefined) fields.ordered_by_doctor = data.orderedByDoctor;
    if (data.results !== undefined) fields.results = data.results;
    if (data.flaggedValues !== undefined) fields.flagged_values = data.flaggedValues;
    if (data.overallInterpretation !== undefined) fields.overall_interpretation = data.overallInterpretation;
    if (data.overallInterpretationSimplified !== undefined) fields.overall_interpretation_simplified = data.overallInterpretationSimplified;
    if (data.fileUrl !== undefined) fields.file_url = data.fileUrl;
    if (data.rawText !== undefined) fields.raw_text = data.rawText;
    if (data.status !== undefined) fields.status = data.status;
    if (data.consultationId !== undefined) fields.consultation_id = data.consultationId;
    if (data.familyMemberId !== undefined) fields.family_member_id = data.familyMemberId;
    await r.update(fields);
    return r;
  }

  async delete(userId, id) {
    const r = await this.getById(userId, id);
    await r.destroy();
    return { message: 'Lab report deleted.' };
  }

  async getFlagged(userId) {
    return LabReport.findAll({
      where: { user_id: userId, flagged_values: { [Op.ne]: [] } },
      order: [['report_date', 'DESC']],
    });
  }

  async aiExplain(userId, id) {
    const r = await this.getById(userId, id);
    const explanation = r.ai_explanation || 'AI explanation will be generated when the AI Companion service is configured.';
    if (!r.ai_explanation) await r.update({ ai_explanation: explanation });
    return { report: r, explanation };
  }

  async getTrends(userId, testName) {
    const reports = await LabReport.findAll({
      where: { user_id: userId },
      order: [['report_date', 'ASC']],
    });

    const trendData = [];
    for (const report of reports) {
      const results = report.results || [];
      for (const result of results) {
        if (result.test_name && result.test_name.toLowerCase().includes(testName.toLowerCase())) {
          trendData.push({
            date: report.report_date,
            value: result.value,
            unit: result.unit,
            reference_range: result.reference_range,
            status: result.status,
            report_name: report.report_name,
          });
        }
      }
    }
    return { testName, trends: trendData };
  }
}

module.exports = new LabReportService();
