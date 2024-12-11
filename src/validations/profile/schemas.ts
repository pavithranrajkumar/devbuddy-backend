import { z } from 'zod';

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().optional(),
});

export const userSkillSchema = z.object({
  skillId: z.number(),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'expert']),
});

export type SkillInput = z.infer<typeof skillSchema>;
export type UserSkillInput = z.infer<typeof userSkillSchema>;
