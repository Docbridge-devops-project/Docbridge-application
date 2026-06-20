const { z } = require('zod');

const createFamilyMemberSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  relationship: z.enum(['spouse','child','parent','sibling','grandparent','grandchild','other']),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['male','female','other','prefer_not_to_say']).optional(),
  bloodGroup: z.string().max(10).optional(),
  knownAllergies: z.array(z.string()).optional(),
  chronicConditions: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
const updateFamilyMemberSchema = createFamilyMemberSchema.partial();
module.exports = { createFamilyMemberSchema, updateFamilyMemberSchema };
