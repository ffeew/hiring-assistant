import { z } from 'zod';

export const sendEmailsBodySchema = z.object({
  recipients: z.array(z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    template: z.string().optional(),
    jobPosition: z.string().optional(),
    applicantId: z.string().min(1, 'Applicant ID is required'), // Required for updating applicant
    resumeId: z.string().min(1, 'Resume ID is required'), // Required for updating resume fields
  })).min(1, 'At least one recipient is required'),
  jobPostId: z.string().optional(),
});

export const emailPreviewBodySchema = z.object({
  recipients: z.array(z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    template: z.enum(['acknowledgment', 'screening']).optional(),
    jobPosition: z.string().optional(),
  })).min(1, 'At least one recipient is required'),
});

export type SendEmailsBody = z.infer<typeof sendEmailsBodySchema>;
export type EmailPreviewBody = z.infer<typeof emailPreviewBodySchema>;