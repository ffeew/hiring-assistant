import { z } from 'zod';

// ============================================================================
// EXTRACT API VALIDATION SCHEMAS
// ============================================================================

// Form data validation for extract endpoint
export const extractResumesFormDataSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, 'At least one file is required'),
  jobPostId: z.string().min(1, 'Job post ID is required'),
});

// Mistral-compatible extraction schema (without format validations that cause API errors)
export const mistralExtractionSchema = z.object({
  firstName: z.string().describe("The first name of the candidate."),
  lastName: z.string().describe("The last name of the candidate."),
  email: z.string().describe("The email address of the candidate."),
  phone: z.string().optional().describe("The phone number of the candidate."),
  linkedinUrl: z.string().optional().describe("The LinkedIn profile URL of the candidate."),
  githubUrl: z.string().optional().describe("The GitHub profile URL of the candidate."),
  portfolioUrl: z.string().optional().describe("The portfolio website URL of the candidate."),
  extractedText: z.string().describe("The full text content extracted from the resume."),
  skills: z.array(z.string()).optional().describe("List of skills mentioned in the resume."),
  experience: z.array(z.object({
    company: z.string().describe("The company or organization name where the candidate worked."),
    position: z.string().describe("The job title or role held at this company."),
    duration: z.string().optional().describe("The time period of employment (e.g., 'Jan 2020 - Dec 2022', '2 years', 'Present'). Extract as written in the resume."),
    description: z.string().optional().describe("Brief description of responsibilities, achievements, or key points mentioned for this role.")
  })).optional().describe("Work experience from the resume."),
  education: z.array(z.object({
    institution: z.string().describe("The name of the educational institution, university, college, or school."),
    degree: z.string().optional().describe("The degree type or qualification obtained (e.g., 'Bachelor of Science', 'Master's', 'PhD', 'Certificate')."),
    fieldOfStudy: z.string().optional().describe("The major, field of study, or subject area (e.g., 'Computer Science', 'Business Administration', 'Engineering')."),
    graduationYear: z.string().optional().describe("The year of graduation or completion. Extract as a 4-digit year if available.")
  })).optional().describe("Extract educational background including degrees, institutions, graduation dates, and fields of study. Include relevant certifications and academic achievements.")
});

// Full extraction schema with validation (for internal use after Mistral response)
export const resumeExtractionSchema = z.object({
  firstName: z.string().describe("The first name of the candidate."),
  lastName: z.string().describe("The last name of the candidate."),
  email: z.string().email().describe("The email address of the candidate."),
  phone: z.string().optional().describe("The phone number of the candidate."),
  linkedinUrl: z.string().url().optional().describe("The LinkedIn profile URL of the candidate."),
  githubUrl: z.string().url().optional().describe("The GitHub profile URL of the candidate."),
  portfolioUrl: z.string().url().optional().describe("The portfolio website URL of the candidate."),
  skills: z.array(z.string()).optional().describe("List of skills mentioned in the resume."),
  experience: z.array(z.object({
    company: z.string(),
    position: z.string(),
    duration: z.string().optional(),
    description: z.string().optional()
  })).optional().describe("Work experience from the resume."),
  education: z.array(z.object({
    institution: z.string(),
    degree: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    graduationYear: z.string().optional()
  })).optional().describe("Educational background from the resume.")
});

// Response schema for the extraction API (handles both success and failure)
export const extractionResponseSchema = z.object({
  fileName: z.string(),
  resumeId: z.string().optional(), // Will be present on successful extraction
  applicantId: z.string().optional(), // Will be present on successful extraction
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  template: z.enum(['acknowledgment', 'screening']).optional(),
  jobPosition: z.string().optional(),
  error: z.string().optional(), // Will be present on failed extraction
});

// Schema for successful extractions only (used for email sending)
export const successfulExtractionSchema = z.object({
  fileName: z.string(),
  resumeId: z.string(),
  applicantId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  template: z.enum(['acknowledgment', 'screening']),
  jobPosition: z.string().optional(),
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type ExtractResumesFormData = z.infer<typeof extractResumesFormDataSchema>;
export type MistralExtractionData = z.infer<typeof mistralExtractionSchema>;
export type ResumeExtractionData = z.infer<typeof resumeExtractionSchema>;
export type ExtractionResponseData = z.infer<typeof extractionResponseSchema>;
export type SuccessfulExtractionData = z.infer<typeof successfulExtractionSchema>;