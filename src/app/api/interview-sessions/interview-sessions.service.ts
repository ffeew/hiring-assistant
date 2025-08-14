import { db } from '@/lib/db/db';
import { interviewSession, conversationTurn, applicant, jobPost, resumeFile } from '@/lib/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { withNotDeleted, softDeleteData } from '@/lib/soft-delete';
import { randomUUID } from 'crypto';
import {
  safeParseJSONArray,
  safeParseJSONObject
} from '@/lib/json-utils';
import { z } from 'zod';
import type {
  CreateInterviewSessionBody,
  UpdateInterviewSessionBody,
  GetInterviewSessionsQuery,
  AddConversationTurnBody,
  UpdateTranscriptBody,
} from './interview-sessions.validator';

// JSON schemas for validation
const questionsArraySchema = z.array(z.object({
  question: z.string(),
  category: z.enum(['technical', 'experience', 'soft_skills', 'verification']),
  reasoning: z.string(),
  expectedResponse: z.string(),
  exampleResponse: z.string()
}));

const sessionMetadataSchema = z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]));

// ============================================================================
// INTERVIEW SESSIONS SERVICE - MAIN BUSINESS LOGIC
// ============================================================================

export class InterviewSessionsService {
  /**
   * Get all interview sessions for a user
   */
  static async getInterviewSessions(userId: string, query: GetInterviewSessionsQuery) {
    const conditions = [
      eq(interviewSession.userId, userId),
      withNotDeleted(interviewSession.deletedAt)
    ];

    // Add optional filters
    if (query.status) {
      conditions.push(eq(interviewSession.status, query.status));
    }
    if (query.applicantId) {
      conditions.push(eq(interviewSession.applicantId, query.applicantId));
    }
    if (query.jobPostId) {
      conditions.push(eq(interviewSession.jobPostId, query.jobPostId));
    }
    if (query.interviewType) {
      conditions.push(eq(interviewSession.interviewType, query.interviewType));
    }

    const sessions = await db
      .select({
        id: interviewSession.id,
        title: interviewSession.title,
        status: interviewSession.status,
        startTime: interviewSession.startTime,
        endTime: interviewSession.endTime,
        interviewType: interviewSession.interviewType,
        createdAt: interviewSession.createdAt,
        updatedAt: interviewSession.updatedAt,
        applicant: {
          id: applicant.id,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          email: applicant.email,
        },
        jobPost: {
          id: jobPost.id,
          title: jobPost.title,
          department: jobPost.department,
        },
        resumeFile: {
          id: resumeFile.id,
          fileName: resumeFile.fileName,
        }
      })
      .from(interviewSession)
      .innerJoin(applicant, eq(interviewSession.applicantId, applicant.id))
      .innerJoin(jobPost, eq(interviewSession.jobPostId, jobPost.id))
      .leftJoin(resumeFile, eq(interviewSession.resumeFileId, resumeFile.id))
      .where(and(...conditions))
      .orderBy(desc(interviewSession.createdAt))
      .limit(query.limit)
      .offset(query.offset);

    return sessions;
  }

  /**
   * Get a specific interview session by ID
   */
  static async getInterviewSessionById(userId: string, sessionId: string) {
    const session = await db
      .select({
        id: interviewSession.id,
        title: interviewSession.title,
        status: interviewSession.status,
        startTime: interviewSession.startTime,
        endTime: interviewSession.endTime,
        fullTranscript: interviewSession.fullTranscript,
        sessionNotes: interviewSession.sessionNotes,
        generatedQuestions: interviewSession.generatedQuestions,
        interviewType: interviewSession.interviewType,
        metadata: interviewSession.metadata,
        createdAt: interviewSession.createdAt,
        updatedAt: interviewSession.updatedAt,
        applicant: {
          id: applicant.id,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          email: applicant.email,
        },
        jobPost: {
          id: jobPost.id,
          title: jobPost.title,
          department: jobPost.department,
          description: jobPost.description,
          requirements: jobPost.requirements,
          responsibilities: jobPost.responsibilities,
        },
        resumeFile: {
          id: resumeFile.id,
          fileName: resumeFile.fileName,
          resumeContent: resumeFile.resumeContent,
        }
      })
      .from(interviewSession)
      .innerJoin(applicant, eq(interviewSession.applicantId, applicant.id))
      .innerJoin(jobPost, eq(interviewSession.jobPostId, jobPost.id))
      .leftJoin(resumeFile, eq(interviewSession.resumeFileId, resumeFile.id))
      .where(
        withNotDeleted(
          interviewSession.deletedAt,
          eq(interviewSession.id, sessionId),
          eq(interviewSession.userId, userId)
        )
      )
      .limit(1);

    if (session.length === 0) {
      throw new Error('Interview session not found');
    }

    const sessionData = session[0];

    // Parse JSON fields safely
    const generatedQuestions = safeParseJSONArray(sessionData.generatedQuestions, questionsArraySchema);
    const metadata = safeParseJSONObject(sessionData.metadata, sessionMetadataSchema);

    return {
      ...sessionData,
      generatedQuestions,
      metadata,
    };
  }

  /**
   * Create a new interview session
   */
  static async createInterviewSession(userId: string, data: CreateInterviewSessionBody) {
    // Verify that applicant, job post, and optional resume belong to user
    const [applicantData, jobPostData, resumeData] = await Promise.all([
      db.select({ id: applicant.id })
        .from(applicant)
        .where(
          withNotDeleted(
            applicant.deletedAt,
            eq(applicant.id, data.applicantId),
            eq(applicant.userId, userId)
          )
        )
        .limit(1),

      db.select({ id: jobPost.id })
        .from(jobPost)
        .where(
          withNotDeleted(
            jobPost.deletedAt,
            eq(jobPost.id, data.jobPostId),
            eq(jobPost.userId, userId)
          )
        )
        .limit(1),

      data.resumeFileId ?
        db.select({ id: resumeFile.id })
          .from(resumeFile)
          .where(
            withNotDeleted(
              resumeFile.deletedAt,
              eq(resumeFile.id, data.resumeFileId),
              eq(resumeFile.applicantId, data.applicantId)
            )
          )
          .limit(1) :
        Promise.resolve([])
    ]);

    if (applicantData.length === 0) {
      throw new Error('Applicant not found');
    }
    if (jobPostData.length === 0) {
      throw new Error('Job post not found');
    }
    if (data.resumeFileId && resumeData.length === 0) {
      throw new Error('Resume file not found');
    }

    const sessionId = randomUUID();

    await db.insert(interviewSession).values({
      id: sessionId,
      userId,
      applicantId: data.applicantId,
      jobPostId: data.jobPostId,
      resumeFileId: data.resumeFileId || null,
      title: data.title,
      interviewType: data.interviewType,
      status: 'scheduled',
      metadata: JSON.stringify({}),
    });

    return { id: sessionId };
  }

  /**
   * Update an interview session
   */
  static async updateInterviewSession(
    userId: string,
    sessionId: string,
    data: UpdateInterviewSessionBody
  ) {
    // Verify session exists and belongs to user
    const existingSession = await db
      .select({ id: interviewSession.id })
      .from(interviewSession)
      .where(
        withNotDeleted(
          interviewSession.deletedAt,
          eq(interviewSession.id, sessionId),
          eq(interviewSession.userId, userId)
        )
      )
      .limit(1);

    if (existingSession.length === 0) {
      throw new Error('Interview session not found');
    }

    const updateData: Partial<typeof interviewSession.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime);
    if (data.endTime !== undefined) updateData.endTime = new Date(data.endTime);
    if (data.sessionNotes !== undefined) updateData.sessionNotes = data.sessionNotes;
    if (data.interviewType !== undefined) updateData.interviewType = data.interviewType;
    if (data.metadata !== undefined) updateData.metadata = JSON.stringify(data.metadata);

    await db
      .update(interviewSession)
      .set(updateData)
      .where(eq(interviewSession.id, sessionId));

    return { success: true };
  }

  /**
   * Start an interview session
   */
  static async startInterviewSession(userId: string, sessionId: string) {
    await this.updateInterviewSession(userId, sessionId, {
      status: 'in_progress',
      startTime: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * End an interview session
   */
  static async endInterviewSession(userId: string, sessionId: string) {
    await this.updateInterviewSession(userId, sessionId, {
      status: 'completed',
      endTime: new Date().toISOString(),
    });

    return { success: true };
  }

  /**
   * Delete an interview session (soft delete)
   */
  static async deleteInterviewSession(userId: string, sessionId: string) {
    // Verify session exists and belongs to user
    const existingSession = await db
      .select({ id: interviewSession.id })
      .from(interviewSession)
      .where(
        withNotDeleted(
          interviewSession.deletedAt,
          eq(interviewSession.id, sessionId),
          eq(interviewSession.userId, userId)
        )
      )
      .limit(1);

    if (existingSession.length === 0) {
      throw new Error('Interview session not found');
    }

    await db
      .update(interviewSession)
      .set(softDeleteData())
      .where(eq(interviewSession.id, sessionId));

    return { success: true };
  }

  /**
   * Add a conversation turn to a session
   */
  static async addConversationTurn(
    userId: string,
    sessionId: string,
    data: AddConversationTurnBody
  ) {
    // Verify session exists and belongs to user
    const session = await db
      .select({ id: interviewSession.id, status: interviewSession.status })
      .from(interviewSession)
      .where(
        withNotDeleted(
          interviewSession.deletedAt,
          eq(interviewSession.id, sessionId),
          eq(interviewSession.userId, userId)
        )
      )
      .limit(1);

    if (session.length === 0) {
      throw new Error('Interview session not found');
    }

    if (session[0].status !== 'in_progress') {
      throw new Error('Interview session is not in progress');
    }

    // Get the next turn order
    const lastTurn = await db
      .select({ turnOrder: conversationTurn.turnOrder })
      .from(conversationTurn)
      .where(eq(conversationTurn.sessionId, sessionId))
      .orderBy(desc(conversationTurn.turnOrder))
      .limit(1);

    const nextTurnOrder = lastTurn.length > 0 ? lastTurn[0].turnOrder + 1 : 1;

    const turnId = randomUUID();

    await db.insert(conversationTurn).values({
      id: turnId,
      sessionId,
      speaker: data.speaker,
      content: data.content,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      turnOrder: nextTurnOrder,
      confidence: data.confidence || null,
      duration: data.duration || null,
    });

    return { id: turnId, turnOrder: nextTurnOrder };
  }

  /**
   * Get conversation turns for a session
   */
  static async getConversationTurns(userId: string, sessionId: string) {
    // Verify session exists and belongs to user
    const session = await db
      .select({ id: interviewSession.id })
      .from(interviewSession)
      .where(
        withNotDeleted(
          interviewSession.deletedAt,
          eq(interviewSession.id, sessionId),
          eq(interviewSession.userId, userId)
        )
      )
      .limit(1);

    if (session.length === 0) {
      throw new Error('Interview session not found');
    }

    const turns = await db
      .select()
      .from(conversationTurn)
      .where(eq(conversationTurn.sessionId, sessionId))
      .orderBy(asc(conversationTurn.turnOrder));

    return turns.map(turn => ({
      ...turn,
      generatedQuestions: safeParseJSONArray(turn.generatedQuestions, questionsArraySchema),
      questionSuggestions: safeParseJSONArray(turn.questionSuggestions, questionsArraySchema),
      analysis: safeParseJSONObject(turn.analysis, z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]))),
    }));
  }

  /**
   * Update the full transcript of a session
   */
  static async updateTranscript(
    userId: string,
    sessionId: string,
    data: UpdateTranscriptBody
  ) {
    await this.updateInterviewSession(userId, sessionId, {
      metadata: { lastTranscriptUpdate: new Date().toISOString() }
    });

    await db
      .update(interviewSession)
      .set({ fullTranscript: data.fullTranscript })
      .where(
        and(
          eq(interviewSession.id, sessionId),
          eq(interviewSession.userId, userId)
        )
      );

    return { success: true };
  }
}