const { z } = require('zod');
const xss = require('xss');

const createMedicineReminderSchema = z.object({
  prescriptionId: z.string().uuid().optional().nullable(),
  familyMemberId: z.string().uuid().optional().nullable(),
  medicineName: z.string().min(1).max(200).transform(v => v ? xss(v) : v),
  dosage: z.string().min(1).max(100).transform(v => v ? xss(v) : v),
  reminderTimes: z.array(z.string()).min(1, 'At least one reminder time is required'),
  daysOfWeek: z.array(z.number().int().min(1).max(7)).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional().nullable(),
  notificationMethod: z.string().optional(),
  snoozeMinutes: z.number().int().optional(),
  notes: z.string().optional().transform(v => v ? xss(v) : v),
});
const updateMedicineReminderSchema = createMedicineReminderSchema.partial().extend({ isActive: z.boolean().optional() });

const createFollowupReminderSchema = z.object({
  consultationId: z.string().uuid().optional().nullable(),
  familyMemberId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(300),
  description: z.string().optional(),
  reminderDate: z.string().min(1),
  reminderTime: z.string().optional().nullable(),
  reminderType: z.enum(['followup','test','vaccination','checkup','refill','other']).optional(),
  notificationMethod: z.string().optional(),
  notes: z.string().optional(),
});
const updateFollowupReminderSchema = createFollowupReminderSchema.partial().extend({ isActive: z.boolean().optional() });

module.exports = { createMedicineReminderSchema, updateMedicineReminderSchema, createFollowupReminderSchema, updateFollowupReminderSchema };
