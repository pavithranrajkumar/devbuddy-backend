import { z } from 'zod';

// Base skill schema
export const skillSchema = z.object({
  name: z.string().min(2, 'Skill name must be at least 2 characters').max(50, 'Skill name must be less than 50 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters').max(30, 'Category must be less than 30 characters').optional(),
});

// For updating skills
export const updateSkillSchema = skillSchema.partial();

// For skill ID param validation
export const skillIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

export type SkillInput = z.infer<typeof skillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
