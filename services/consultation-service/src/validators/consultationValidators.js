const { z } = require('zod');
const xss = require('xss');

const createConsultationSchema = z.object({
  familyMemberId: z.string().uuid().optional().nullable(),
  doctorName: z.string().max(200).optional().transform(v => v ? xss(v) : v),
  doctorSpecialty: z.string().max(100).optional().transform(v => v ? xss(v) : v),
  hospitalClinic: z.string().max(200).optional().transform(v => v ? xss(v) : v),
  consultationDate: z.string().min(1, 'Consultation date is required'),
  consultationTime: z.string().optional(),
  chiefComplaint: z.string().optional().transform(v => v ? xss(v) : v),
  diagnosis: z.string().optional().transform(v => v ? xss(v) : v),
  diagnosisSimplified: z.string().optional().transform(v => v ? xss(v) : v),
  doctorNotes: z.string().optional().transform(v => v ? xss(v) : v),
  followUpDate: z.string().optional().nullable(),
  followUpNotes: z.string().optional().transform(v => v ? xss(v) : v),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'missed']).optional(),
  isTeleconsultation: z.boolean().optional(),
  attachments: z.array(z.any()).optional(),
});

const updateConsultationSchema = createConsultationSchema.partial();

module.exports = { createConsultationSchema, updateConsultationSchema };
