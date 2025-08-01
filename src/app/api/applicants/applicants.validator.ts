import { z } from 'zod';
import { APPLICANT_STATUS } from '@/app/types';

export const getApplicantsQuerySchema = z.object({
  jobPostId: z.string().uuid().optional(),
  status: z.enum(APPLICANT_STATUS).optional(),
});

export const applicantParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createApplicantBodySchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  metadata: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
  jobPostId: z.string().optional(),
  status: z.enum(APPLICANT_STATUS).optional(),
  source: z.enum(['manual', 'bulk_upload', 'api']).optional(),
});

export const updateApplicantBodySchema = createApplicantBodySchema.partial();

export type GetApplicantsQuery = z.infer<typeof getApplicantsQuerySchema>;
export type CreateApplicantBody = z.infer<typeof createApplicantBodySchema>;
export type UpdateApplicantBody = z.infer<typeof updateApplicantBodySchema>;
export type ApplicantParams = z.infer<typeof applicantParamsSchema>;