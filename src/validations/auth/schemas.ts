import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required'),
    userType: z.enum(['client', 'freelancer'], {
      errorMap: () => ({ message: 'User type must be either client or freelancer' }),
    }),
    title: z.string().optional(),
    bio: z.string().optional(),
    hourlyRate: z.number().optional(),
    experienceInMonths: z.number().min(0, 'Experience must be positive').max(600, 'Experience cannot exceed 600 months (50 years)').optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
