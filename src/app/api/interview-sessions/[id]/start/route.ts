import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuthParams, type AuthenticatedRequest } from '@/lib/auth-middleware';
import { InterviewSessionsService } from '../../interview-sessions.service';
import { 
  interviewSessionParamsSchema
} from '../../interview-sessions.validator';

// ============================================================================
// POST /api/interview-sessions/[id]/start - Start interview session
// ============================================================================

async function startInterviewSession(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const validatedParams = interviewSessionParamsSchema.parse({ id });
    
    const result = await InterviewSessionsService.startInterviewSession(
      request.user.id, 
      validatedParams.id
    );
    
    return NextResponse.json({ success: true, data: result });
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

    console.error('Error in startInterviewSession:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to start interview session' }]
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXPORT ROUTE HANDLERS
// ============================================================================

export const POST = withAuthParams(startInterviewSession);