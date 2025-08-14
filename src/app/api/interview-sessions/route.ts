import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuth, type AuthenticatedRequest } from '@/lib/auth-middleware';
import { InterviewSessionsService } from './interview-sessions.service';
import { 
  createInterviewSessionBodySchema,
  getInterviewSessionsQuerySchema
} from './interview-sessions.validator';

// ============================================================================
// GET /api/interview-sessions - List interview sessions
// ============================================================================

async function getInterviewSessions(request: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validatedQuery = getInterviewSessionsQuerySchema.parse(queryParams);
    const sessions = await InterviewSessionsService.getInterviewSessions(
      request.user.id, 
      validatedQuery
    );
    
    return NextResponse.json({ success: true, data: sessions });
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

    console.error('Error in getInterviewSessions:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to fetch interview sessions' }]
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/interview-sessions - Create interview session
// ============================================================================

async function createInterviewSession(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = createInterviewSessionBodySchema.parse(body);
    
    const result = await InterviewSessionsService.createInterviewSession(
      request.user.id, 
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

    // Business logic errors
    if (error instanceof Error && (
      error.message.includes('not found') ||
      error.message.includes('already exists')
    )) {
      return NextResponse.json(
        { 
          error: 'Business logic error',
          details: [{ field: 'business', message: error.message }]
        },
        { status: 400 }
      );
    }

    console.error('Error in createInterviewSession:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to create interview session' }]
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXPORT ROUTE HANDLERS
// ============================================================================

export const GET = withAuth(getInterviewSessions);
export const POST = withAuth(createInterviewSession);