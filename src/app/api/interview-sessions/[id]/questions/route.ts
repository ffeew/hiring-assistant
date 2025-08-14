import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuthParams, type AuthenticatedRequest } from '@/lib/auth-middleware';
import { InterviewSessionsService } from '../../interview-sessions.service';
import { DynamicQuestionsService } from './dynamic-questions.service';
import { 
  generateDynamicQuestionsBodySchema,
  interviewSessionParamsSchema
} from '../../interview-sessions.validator';

// ============================================================================
// POST /api/interview-sessions/[id]/questions - Generate dynamic questions
// ============================================================================

async function generateDynamicQuestions(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const validatedParams = interviewSessionParamsSchema.parse({ id });
    const body = await request.json();
    const validatedData = generateDynamicQuestionsBodySchema.parse(body);
    
    // Get session details and recent conversation turns
    const [sessionData, conversationTurns] = await Promise.all([
      InterviewSessionsService.getInterviewSessionById(
        request.user.id, 
        validatedParams.id
      ),
      InterviewSessionsService.getConversationTurns(
        request.user.id, 
        validatedParams.id
      )
    ]);

    // Generate context-aware questions
    const questions = await DynamicQuestionsService.generateDynamicQuestions({
      sessionData,
      conversationTurns,
      questionCount: validatedData.questionCount,
      focusAreas: validatedData.focusAreas,
      lastFewTurns: validatedData.lastFewTurns,
    });
    
    return NextResponse.json({ success: true, data: questions });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { 
          error: 'Interview session not found',
          details: [{ field: 'id', message: 'Interview session not found' }]
        },
        { status: 404 }
      );
    }

    console.error('Error in generateDynamicQuestions:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to generate dynamic questions' }]
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXPORT ROUTE HANDLERS
// ============================================================================

export const POST = withAuthParams(generateDynamicQuestions);