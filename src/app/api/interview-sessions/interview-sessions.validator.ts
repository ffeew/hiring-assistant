import { z } from 'zod';

// ============================================================================
// INTERVIEW SESSIONS API VALIDATION SCHEMAS
// ============================================================================

// Create interview session validation
export const createInterviewSessionBodySchema = z.object({
  applicantId: z.string().min(1, 'Applicant ID is required'),
  jobPostId: z.string().min(1, 'Job post ID is required'),
  resumeFileId: z.string().optional(),
  title: z.string().min(1, 'Interview title is required'),
  interviewType: z.enum(['screening', 'technical', 'behavioral', 'final']).default('screening'),
  scheduledTime: z.string().datetime().optional(),
});

// Update interview session validation
export const updateInterviewSessionBodySchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  sessionNotes: z.string().optional(),
  interviewType: z.enum(['screening', 'technical', 'behavioral', 'final']).optional(),
  metadata: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

// Query validation for listing sessions
export const getInterviewSessionsQuerySchema = z.object({
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  applicantId: z.string().optional(),
  jobPostId: z.string().optional(),
  interviewType: z.enum(['screening', 'technical', 'behavioral', 'final']).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

// Session ID params validation
export const interviewSessionParamsSchema = z.object({
  id: z.string().min(1, 'Session ID is required'),
});

// Start session validation
export const startSessionBodySchema = z.object({
  actualStartTime: z.string().datetime().optional(),
});

// Add conversation turn validation
export const addConversationTurnBodySchema = z.object({
  speaker: z.enum(['interviewer', 'candidate']),
  content: z.string().min(1, 'Content is required'),
  timestamp: z.string().datetime().optional(),
  confidence: z.number().min(0).max(100).optional(),
  duration: z.number().min(0).optional(),
});

// Generate dynamic questions validation
export const generateDynamicQuestionsBodySchema = z.object({
  conversationContext: z.string().min(1, 'Conversation context is required'),
  questionCount: z.number().min(1).max(10).default(3),
  focusAreas: z.array(z.enum(['technical', 'experience', 'soft_skills', 'verification'])).optional(),
  lastFewTurns: z.number().min(1).max(10).default(5), // Number of recent turns to analyze
});

// Update transcript validation
export const updateTranscriptBodySchema = z.object({
  fullTranscript: z.string(),
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type CreateInterviewSessionBody = z.infer<typeof createInterviewSessionBodySchema>;
export type UpdateInterviewSessionBody = z.infer<typeof updateInterviewSessionBodySchema>;
export type GetInterviewSessionsQuery = z.infer<typeof getInterviewSessionsQuerySchema>;
export type InterviewSessionParams = z.infer<typeof interviewSessionParamsSchema>;
export type StartSessionBody = z.infer<typeof startSessionBodySchema>;
export type AddConversationTurnBody = z.infer<typeof addConversationTurnBodySchema>;
export type GenerateDynamicQuestionsBody = z.infer<typeof generateDynamicQuestionsBodySchema>;
export type UpdateTranscriptBody = z.infer<typeof updateTranscriptBodySchema>;