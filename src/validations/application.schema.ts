import { z } from 'zod';

export const createApplicationSchema = z.object({
  coverLetter: z.string().min(100, 'Cover letter must be at least 100 characters').max(1000, 'Cover letter cannot exceed 1000 characters'),
  proposedRate: z.number().positive('Proposed rate must be positive'),
  estimatedDuration: z.number().positive('Estimated duration must be positive'),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['marked_for_interview', 'accepted', 'rejected', 'withdrawn']),
});

export const paginationSchema = z
  .object({
    page: z
      .string()
      .transform((val) => parseInt(val))
      .default('1'),
    limit: z
      .string()
      .transform((val) => parseInt(val))
      .default('10'),
  })
  .refine((data) => data.limit <= 100, { message: 'Maximum limit is 100 items per page' });

export const applicationQuerySchema = z
  .object({
    status: z.array(z.enum(['applied', 'marked_for_interview', 'accepted', 'rejected', 'withdrawn'])).optional(),
    page: z
      .string()
      .transform((val) => parseInt(val))
      .default('1'),
    limit: z
      .string()
      .transform((val) => parseInt(val))
      .default('10'),
  })
  .refine((data) => data.limit <= 100, {
    message: 'Maximum limit is 100 items per page',
  });
