import { z } from 'zod';

// ============================================================================
// CORE TYPES & ENUMS
// ============================================================================

export type ExtractedData = {
  fileName: string;
  firstName: string;
  lastName: string;
  email: string;
  template?: EmailTemplate;
  jobPosition?: string;
  resumeId?: string; // ID of the resume record in database
  applicantId?: string; // ID of the applicant record in database
  error?: string; // For failed extractions
};

export enum EmailTemplate {
  ACKNOWLEDGMENT = 'acknowledgment',
  SCREENING = 'screening'
}

// ============================================================================
// CONSTANTS (Used across multiple modules)
// ============================================================================

export const APPLICANT_STATUS = ['applied', 'screening', 'interview', 'offer', 'rejected', 'hired'] as const;
export const EXTRACTION_STATUS = ['pending', 'success', 'failed'] as const;
export const EMAIL_TYPE = ['acknowledgment', 'screening', 'interview', 'offer', 'rejection'] as const;
export const EMAIL_STATUS = ['sent', 'failed', 'bounced'] as const;
export const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'contract', 'internship'] as const;
export const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior'] as const;
export const SUPPORTED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const;

// ============================================================================
// TYPE IMPORTS FROM VALIDATORS (For frontend/shared usage)
// ============================================================================

// Import types from validator files to avoid schema duplication
export type { CreateApplicantBody as CreateApplicantData, UpdateApplicantBody as UpdateApplicantData } from '@/app/api/applicants/applicants.validator';
export type { CreateJobPostBody as CreateJobPostData, UpdateJobPostBody as UpdateJobPostData } from '@/app/api/job-posts/job-posts.validator';
export type { UpdateProfileBody as ProfileUpdateData } from '@/app/api/profile/profile.validator';
export type { SendEmailsBody as EmailRequestData, EmailPreviewBody as EmailPreviewRequestData } from '@/app/api/email/email.validator';
export type { MistralExtractionData, ResumeExtractionData, ExtractionResponseData } from '@/app/api/extract/resume-extraction.validator';

// Profile response schema (not used in validation, only for API responses)
export const profileResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  image: z.string().nullable(),
  gmailAddress: z.string().nullable(),
  gmailAppPassword: z.string().nullable(), // Will be masked as "****"
  companyName: z.string().nullable(),
  jobTitle: z.string().nullable(),
  emailVerified: z.boolean().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});


// ============================================================================
// DATABASE ENTITY SCHEMAS (For reference, but not used in validation)
// ============================================================================

export const applicantSchema = z.object({
  id: z.string(),
  userId: z.string(),
  jobPostId: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  linkedinUrl: z.string().nullable(),
  githubUrl: z.string().nullable(),
  portfolioUrl: z.string().nullable(),
  metadata: z.record(z.unknown()).nullable(),
  notes: z.string().nullable(),
  status: z.enum(APPLICANT_STATUS),
  source: z.enum(['manual', 'bulk_upload', 'api']),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const jobPostSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  department: z.string().nullable(),
  location: z.string().nullable(),
  employmentType: z.enum(EMPLOYMENT_TYPES).nullable(),
  experienceLevel: z.enum(EXPERIENCE_LEVELS).nullable(),
  description: z.string(),
  requirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  benefits: z.array(z.string()),
  salaryRange: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// ============================================================================
// INFERRED TYPES (For TypeScript usage)
// ============================================================================

// Main entity types
export type Applicant = z.infer<typeof applicantSchema>;
export type JobPost = z.infer<typeof jobPostSchema>;

// API response types (from schemas still defined here)
export type ProfileResponseData = z.infer<typeof profileResponseSchema>;