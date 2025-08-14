import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuthParams, type AuthenticatedRequest } from '@/lib/auth-middleware';
import { InterviewSessionsService } from '../../interview-sessions.service';
import { 
  addConversationTurnBodySchema,
  interviewSessionParamsSchema
} from '../../interview-sessions.validator';

// ============================================================================
// GET /api/interview-sessions/[id]/turns - Get conversation turns
// ============================================================================

async function getConversationTurns(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const validatedParams = interviewSessionParamsSchema.parse({ id });
    
    const turns = await InterviewSessionsService.getConversationTurns(
      request.user.id, 
      validatedParams.id
    );
    
    return NextResponse.json({ success: true, data: turns });
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

    console.error('Error in getConversationTurns:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to fetch conversation turns' }]
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/interview-sessions/[id]/turns - Add conversation turn
// ============================================================================

async function addConversationTurn(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const validatedParams = interviewSessionParamsSchema.parse({ id });
    const body = await request.json();
    const validatedData = addConversationTurnBodySchema.parse(body);
    
    const result = await InterviewSessionsService.addConversationTurn(
      request.user.id, 
      validatedParams.id, 
      validatedData
    );
    
    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
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

    if (error instanceof Error && (
      error.message.includes('not found') ||
      error.message.includes('not in progress')
    )) {
      return NextResponse.json(
        { 
          error: 'Business logic error',
          details: [{ field: 'business', message: error.message }]
        },
        { status: 400 }
      );
    }

    console.error('Error in addConversationTurn:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to add conversation turn' }]
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXPORT ROUTE HANDLERS
// ============================================================================

export const GET = withAuthParams(getConversationTurns);
export const POST = withAuthParams(addConversationTurn);