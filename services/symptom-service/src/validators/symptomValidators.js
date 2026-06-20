const { z } = require('zod');
const xss = require('xss');

const createSymptomSchema = z.object({
  familyMemberId: z.string().uuid().optional().nullable(),
  symptomName: z.string().min(1).max(200).transform(v => v ? xss(v) : v),
  severity: z.number().int().min(1).max(10),
  onsetDate: z.string().min(1),
  onsetTime: z.string().optional().nullable(),
  durationHours: z.number().int().optional(),
  isOngoing: z.boolean().optional(),
  resolvedDate: z.string().optional().nullable(),
  bodyLocation: z.string().max(100).optional().transform(v => v ? xss(v) : v),
  triggers: z.string().optional().transform(v => v ? xss(v) : v),
  relievedBy: z.string().optional().transform(v => v ? xss(v) : v),
  associatedSymptoms: z.array(z.string().transform(v => v ? xss(v) : v)).optional(),
  notes: z.string().optional().transform(v => v ? xss(v) : v),
  relatedConsultationId: z.string().uuid().optional().nullable(),
});
const updateSymptomSchema = createSymptomSchema.partial();
module.exports = { createSymptomSchema, updateSymptomSchema };
