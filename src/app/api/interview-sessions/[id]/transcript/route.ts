import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuthParams, type AuthenticatedRequest } from '@/lib/auth-middleware';
import { InterviewSessionsService } from '../../interview-sessions.service';
import { 
  updateTranscriptBodySchema,
  interviewSessionParamsSchema
} from '../../interview-sessions.validator';

// ============================================================================
// PATCH /api/interview-sessions/[id]/transcript - Update session transcript
// ============================================================================

async function updateTranscript(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const validatedParams = interviewSessionParamsSchema.parse({ id });
    const body = await request.json();
    const validatedData = updateTranscriptBodySchema.parse(body);
    
    const result = await InterviewSessionsService.updateTranscript(
      request.user.id, 
      validatedParams.id, 
      validatedData
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

    console.error('Error in updateTranscript:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to update transcript' }]
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXPORT ROUTE HANDLERS
// ============================================================================

export const PATCH = withAuthParams(updateTranscript);