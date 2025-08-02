import { z } from "zod";

export const generateQuestionsBodySchema = z.object({
  applicantId: z.string().min(1, "Applicant ID is required"),
  jobPostId: z.string().min(1, "Job post ID is required"),
  resumeFileId: z.string().min(1, "Resume file ID is required"),
  questionCount: z.number().min(1).max(20),
  focusAreas: z.array(z.enum(["technical", "experience", "soft_skills", "verification"])).optional(),
});

export type GenerateQuestionsBody = z.infer<typeof generateQuestionsBodySchema>;