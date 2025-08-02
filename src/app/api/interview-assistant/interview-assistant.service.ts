import { db } from "@/lib/db/db";
import { applicant, jobPost, resumeFile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { withNotDeleted } from "@/lib/soft-delete";
import {
  safeParseJSON,
  requirementsSchema,
  responsibilitiesSchema
} from "@/lib/json-utils";
import type { GenerateQuestionsBody } from "./interview-assistant.validator";

// Import AI SDK for LLM integration
import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { z } from "zod";

const interviewQuestionsSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    category: z.enum(["technical", "experience", "soft_skills", "verification"]),
    reasoning: z.string(),
    expectedResponse: z.string(),
    exampleResponse: z.string()
  })),
});

export class InterviewAssistantService {
  static async generateQuestions(userId: string, data: GenerateQuestionsBody) {
    // Fetch applicant, job post, and resume data
    const [applicantData, jobPostData, resumeData] = await Promise.all([
      db.select()
        .from(applicant)
        .where(
          withNotDeleted(
            applicant.deletedAt,
            eq(applicant.id, data.applicantId),
            eq(applicant.userId, userId)
          )
        )
        .limit(1),

      db.select()
        .from(jobPost)
        .where(
          withNotDeleted(
            jobPost.deletedAt,
            eq(jobPost.id, data.jobPostId),
            eq(jobPost.userId, userId)
          )
        )
        .limit(1),

      db.select()
        .from(resumeFile)
        .where(
          withNotDeleted(
            resumeFile.deletedAt,
            eq(resumeFile.id, data.resumeFileId),
            eq(resumeFile.applicantId, data.applicantId),
            eq(resumeFile.jobPostId, data.jobPostId)
          )
        )
        .limit(1)
    ]);

    if (!applicantData[0]) {
      throw new Error("Applicant not found");
    }

    if (!jobPostData[0]) {
      throw new Error("Job post not found");
    }

    if (!resumeData[0]) {
      throw new Error("Resume file not found");
    }

    const applicantInfo = applicantData[0];
    const jobInfo = jobPostData[0];
    const resume = resumeData[0];

    if (!resume.resumeContent) {
      throw new Error("Resume content has not been extracted yet");
    }

    if (resume.extractionStatus !== "success") {
      throw new Error("Resume extraction failed or is still pending");
    }

    // Parse JSON fields
    const requirements = safeParseJSON(jobInfo.requirements, requirementsSchema, []);
    const responsibilities = safeParseJSON(jobInfo.responsibilities, responsibilitiesSchema, []);

    // Generate interview questions using AI
    const prompt = `You are an expert interviewer helping to assess a candidate's qualifications. Your goal is to generate insightful questions that verify the candidate's claims, assess their true capabilities and check if they fit the job requirements.

JOB POST INFORMATION:
Title: ${jobInfo.title}
Department: ${jobInfo.department || "Not specified"}
Experience Level: ${jobInfo.experienceLevel || "Not specified"}
Description: ${jobInfo.description}
Requirements: ${requirements.join(", ")}
Responsibilities: ${responsibilities.join(", ")}

CANDIDATE INFORMATION:
Name: ${applicantInfo.firstName} ${applicantInfo.lastName}
Email: ${applicantInfo.email}

RESUME CONTENT:
${resume.resumeContent}

INSTRUCTIONS:
Generate ${data.questionCount} interview questions that:
1. Verify specific claims made in the resume
2. Test actual knowledge and skills mentioned
3. Assess problem-solving abilities relevant to the role
4. Check for depth of experience in claimed areas
5. Identify potential red flags or exaggerations
6. Explore soft skills and cultural fit
7. Verify technical skills and knowledge

Focus areas: ${data.focusAreas?.join(", ") || "technical, experience, soft_skills, verification"}

For each question, provide:
- The actual question to ask
- The category (technical, experience, soft_skills, verification)
- Your reasoning for asking this question
- What you expect in a good response
- An example response that would indicate a strong candidate

Make questions specific to the candidate's background and the job requirements. Avoid generic questions.`;

    try {
      const result = await generateObject({
        model: groq("moonshotai/kimi-k2-instruct"),
        prompt,
        schema: interviewQuestionsSchema,
      });

      // sort the questions by category
      result.object.questions.sort((a, b) => {
        const categories = ["technical", "experience", "soft_skills", "verification"];
        return categories.indexOf(a.category) - categories.indexOf(b.category);
      });


      return {
        questions: result.object.questions,
        applicant: {
          id: applicantInfo.id,
          name: `${applicantInfo.firstName} ${applicantInfo.lastName}`,
          email: applicantInfo.email,
        },
        jobPost: {
          id: jobInfo.id,
          title: jobInfo.title,
          department: jobInfo.department,
        },
        resume: {
          id: resume.id,
          fileName: resume.fileName,
        },
      };
    } catch (error) {
      console.error("Error generating interview questions:", error);
      throw new Error("Failed to generate interview questions. Please try again.");
    }
  }
}