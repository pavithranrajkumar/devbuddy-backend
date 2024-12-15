import { z } from "zod";

const baseProjectSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(50).max(5000),
  budgetMin: z.number().positive(),
  budgetMax: z.number().positive(),
  deadline: z.string().datetime(),
  requiredSkills: z.array(z.number()).min(1),
});

export const createProjectSchema = baseProjectSchema
  .refine((data) => data.budgetMin <= data.budgetMax, {
    message: "Minimum budget cannot be greater than maximum budget",
    path: ["budgetMin"],
  })
  .refine((data) => new Date(data.deadline) > new Date(), {
    message: "Deadline must be in the future",
    path: ["deadline"],
  });

export const updateProjectSchema = baseProjectSchema
  .partial()
  .refine(
    (data) =>
      !data.budgetMin || !data.budgetMax || data.budgetMin <= data.budgetMax,
    {
      message: "Minimum budget cannot be greater than maximum budget",
      path: ["budgetMin"],
    }
  )
  .refine((data) => !data.deadline || new Date(data.deadline) > new Date(), {
    message: "Deadline must be in the future",
    path: ["deadline"],
  });

export const projectQuerySchema = z
  .object({
    status: z
      .enum(["published", "in_progress", "completed", "cancelled"])
      .optional(),
    budgetMin: z
      .string()
      .transform((val) => parseInt(val))
      .optional(),
    budgetMax: z
      .string()
      .transform((val) => parseInt(val))
      .optional(),
    skills: z
      .string()
      .transform((val) => val.split(",").map(Number))
      .optional(),
    search: z.string().optional(),
    createdAfter: z.string().datetime().optional(),
    createdBefore: z.string().datetime().optional(),
    hasDeadlineBefore: z.string().datetime().optional(),
    experienceRequired: z
      .string()
      .transform((val) => parseInt(val))
      .optional(),
    sortBy: z
      .enum(["createdAt", "budgetMin", "deadline", "applicantsCount"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z
      .string()
      .transform((val) => parseInt(val))
      .default("1"),
    limit: z
      .string()
      .transform((val) => parseInt(val))
      .default("10"),
  })
  .refine((data) => data.limit <= 100, {
    message: "Maximum limit is 100 items per page",
  });
