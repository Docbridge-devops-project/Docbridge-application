const { z } = require('zod');

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
  sessionId: z.string().uuid().optional().nullable(),
});

const explainMedicineSchema = z.object({
  medicineName: z.string().min(1),
  genericName: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  purpose: z.string().optional(),
  instructions: z.string().optional(),
});

const explainLabReportSchema = z.object({
  reportName: z.string().min(1),
  reportType: z.string().min(1),
  reportDate: z.string().optional(),
  results: z.array(z.any()).optional(),
  flaggedValues: z.array(z.any()).optional(),
  overallInterpretation: z.string().optional(),
});

const explainSymptomSchema = z.object({
  symptomName: z.string().min(1),
  severity: z.number().int().min(1).max(10),
  bodyLocation: z.string().optional(),
  durationHours: z.number().optional(),
  triggers: z.string().optional(),
  relievedBy: z.string().optional(),
});

module.exports = { chatSchema, explainMedicineSchema, explainLabReportSchema, explainSymptomSchema };
