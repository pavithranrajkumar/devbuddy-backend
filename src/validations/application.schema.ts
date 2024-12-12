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

// First create the base schema without refinements
const baseApplicationQuerySchema = z.object({
  status: z.array(z.enum(['applied', 'marked_for_interview', 'accepted', 'rejected', 'withdrawn'])).optional(),
  page: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  projectId: z.string().optional(),
});

// Then add the refinements
export const applicationQuerySchema = baseApplicationQuerySchema
  .refine(
    (data) => {
      // If limit is provided, ensure it's not more than 100
      if (data.limit) {
        return data.limit <= 100;
      }
      return true;
    },
    {
      message: 'Maximum limit is 100 items per page',
    }
  )
  .refine(
    (data) => {
      // Ensure both page and limit are provided if either is provided
      return (data.page && data.limit) || (!data.page && !data.limit);
    },
    {
      message: 'Both page and limit must be provided for pagination',
    }
  );
