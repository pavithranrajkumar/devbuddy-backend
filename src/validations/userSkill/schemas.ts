import { z } from 'zod';

// Base user skill schema
export const userSkillSchema = z.object({
  skillId: z.number({
    required_error: 'Skill ID is required',
    invalid_type_error: 'Skill ID must be a number',
  }),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'expert'], {
    required_error: 'Proficiency level is required',
    invalid_type_error: 'Invalid proficiency level',
  }),
});

// For updating user skills
export const updateUserSkillSchema = z.object({
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'expert'], {
    required_error: 'Proficiency level is required',
    invalid_type_error: 'Invalid proficiency level',
  }),
});

// For skill ID param validation
export const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Skill ID must be a number').transform(Number),
});

export type UserSkillInput = z.infer<typeof userSkillSchema>;
export type UpdateUserSkillInput = z.infer<typeof updateUserSkillSchema>;
