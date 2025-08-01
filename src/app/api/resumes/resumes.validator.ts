import { z } from 'zod';

export const getResumeFilesQuerySchema = z.object({
  applicantId: z.string().uuid().optional(),
});

export const resumeFileParamsSchema = z.object({
  id: z.string().uuid(),
});

export const updateResumeFileBodySchema = z.object({
  resumeContent: z.string().optional(),
  extractionStatus: z.enum(['pending', 'success', 'failed']).optional(),
  extractionError: z.string().optional(),
});

export const uploadResumeFileBodySchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  file: z.any(), // File will be validated separately
});

export type GetResumeFilesQuery = z.infer<typeof getResumeFilesQuerySchema>;
export type UploadResumeFileBody = z.infer<typeof uploadResumeFileBodySchema>;
export type UpdateResumeFileBody = z.infer<typeof updateResumeFileBodySchema>;
export type ResumeFileParams = z.infer<typeof resumeFileParamsSchema>;