const { z } = require('zod');
const xss = require('xss');

const createPrescriptionSchema = z.object({
  consultationId: z.string().uuid().optional().nullable(),
  familyMemberId: z.string().uuid().optional().nullable(),
  medicineName: z.string().min(1, 'Medicine name is required').max(200).transform(v => v ? xss(v) : v),
  genericName: z.string().max(200).optional().transform(v => v ? xss(v) : v),
  dosage: z.string().min(1, 'Dosage is required').max(100).transform(v => v ? xss(v) : v),
  frequency: z.string().min(1, 'Frequency is required').max(100).transform(v => v ? xss(v) : v),
  durationDays: z.number().int().positive().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
  instructions: z.string().optional().transform(v => v ? xss(v) : v),
  purpose: z.string().optional().transform(v => v ? xss(v) : v),
  purposeSimplified: z.string().optional().transform(v => v ? xss(v) : v),
  isActive: z.boolean().optional(),
  refillNeeded: z.boolean().optional(),
  refillDate: z.string().optional().nullable(),
  prescribingDoctor: z.string().max(200).optional().transform(v => v ? xss(v) : v),
  pharmacyNotes: z.string().optional().transform(v => v ? xss(v) : v),
  sideEffectWarnings: z.array(z.string().transform(v => v ? xss(v) : v)).optional(),
  foodInteractions: z.array(z.string().transform(v => v ? xss(v) : v)).optional(),
});

const updatePrescriptionSchema = createPrescriptionSchema.partial();

const createSideEffectSchema = z.object({
  effectDescription: z.string().min(1, 'Description is required'),
  severity: z.enum(['mild', 'moderate', 'severe']),
  onsetDate: z.string().min(1, 'Onset date is required'),
  resolvedDate: z.string().optional().nullable(),
  isResolved: z.boolean().optional(),
  actionTaken: z.string().optional(),
  doctorNotified: z.boolean().optional(),
});

const updateSideEffectSchema = createSideEffectSchema.partial();

module.exports = { createPrescriptionSchema, updatePrescriptionSchema, createSideEffectSchema, updateSideEffectSchema };
