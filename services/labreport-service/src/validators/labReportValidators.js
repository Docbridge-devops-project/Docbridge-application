const { z } = require('zod');
const xss = require('xss');

const createLabReportSchema = z.object({
  consultationId: z.string().uuid().optional().nullable(),
  familyMemberId: z.string().uuid().optional().nullable(),
  reportName: z.string().min(1).max(300).transform(v => v ? xss(v) : v),
  reportType: z.string().min(1).max(100).transform(v => v ? xss(v) : v),
  labName: z.string().max(200).optional().transform(v => v ? xss(v) : v),
  reportDate: z.string().min(1),
  orderedByDoctor: z.string().max(200).optional().transform(v => v ? xss(v) : v),
  results: z.array(z.object({
    test_name: z.string().transform(v => v ? xss(v) : v), value: z.any(), unit: z.string().optional().transform(v => v ? xss(v) : v),
    reference_range: z.string().optional().transform(v => v ? xss(v) : v), status: z.string().optional().transform(v => v ? xss(v) : v),
  })).optional(),
  flaggedValues: z.array(z.any()).optional(),
  overallInterpretation: z.string().optional().transform(v => v ? xss(v) : v),
  overallInterpretationSimplified: z.string().optional().transform(v => v ? xss(v) : v),
  fileUrl: z.string().optional(),
  rawText: z.string().optional().transform(v => v ? xss(v) : v),
  status: z.enum(['pending','preliminary','final','corrected']).optional(),
});
const updateLabReportSchema = createLabReportSchema.partial();
module.exports = { createLabReportSchema, updateLabReportSchema };
