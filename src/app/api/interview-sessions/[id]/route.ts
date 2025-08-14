import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { withAuthParams, type AuthenticatedRequest } from '@/lib/auth-middleware';
import { InterviewSessionsService } from '../interview-sessions.service';
import { 
  updateInterviewSessionBodySchema,
  interviewSessionParamsSchema
} from '../interview-sessions.validator';

// ============================================================================
// GET /api/interview-sessions/[id] - Get specific interview session
// ============================================================================

async function getInterviewSession(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const validatedParams = interviewSessionParamsSchema.parse({ id });
    
    const session = await InterviewSessionsService.getInterviewSessionById(
      request.user.id, 
      validatedParams.id
    );
    
    return NextResponse.json({ success: true, data: session });
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

    console.error('Error in getInterviewSession:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to fetch interview session' }]
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/interview-sessions/[id] - Update interview session
// ============================================================================

async function updateInterviewSession(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const validatedParams = interviewSessionParamsSchema.parse({ id });
    const body = await request.json();
    const validatedData = updateInterviewSessionBodySchema.parse(body);
    
    const result = await InterviewSessionsService.updateInterviewSession(
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

    console.error('Error in updateInterviewSession:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to update interview session' }]
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/interview-sessions/[id] - Delete interview session
// ============================================================================

async function deleteInterviewSession(
  request: AuthenticatedRequest,
  { params }: { params: Promise<Record<string, string>>; }
) {
  try {
    const { id } = await params;
    const validatedParams = interviewSessionParamsSchema.parse({ id });
    
    const result = await InterviewSessionsService.deleteInterviewSession(
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

    console.error('Error in deleteInterviewSession:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to delete interview session' }]
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// EXPORT ROUTE HANDLERS
// ============================================================================

export const GET = withAuthParams(getInterviewSession);
export const PATCH = withAuthParams(updateInterviewSession);
export const DELETE = withAuthParams(deleteInterviewSession);