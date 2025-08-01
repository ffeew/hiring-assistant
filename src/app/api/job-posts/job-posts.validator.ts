import { z } from 'zod';
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from '@/app/types';

export const getJobPostsQuerySchema = z.object({
  active: z.enum(['true', 'false']).optional(),
});

export const jobPostParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createJobPostBodySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.enum(EMPLOYMENT_TYPES).optional(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).optional(),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  salaryRange: z.string().optional(),
});

export const updateJobPostBodySchema = createJobPostBodySchema.extend({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  isActive: z.boolean().optional(),
}).partial();

export type GetJobPostsQuery = z.infer<typeof getJobPostsQuerySchema>;
export type CreateJobPostBody = z.infer<typeof createJobPostBodySchema>;
export type UpdateJobPostBody = z.infer<typeof updateJobPostBodySchema>;
export type JobPostParams = z.infer<typeof jobPostParamsSchema>;