import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { ProfileService } from './profile.service';
import { updateProfileBodySchema } from './profile.validator';
import { ZodError } from 'zod';

async function updateProfile(request: AuthenticatedRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = updateProfileBodySchema.parse(body);

    // Update profile using service
    const user = await ProfileService.updateProfile(request.user.id, validatedData);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        },
        { status: 400 }
      );
    }

    // Handle business logic errors
    if (error instanceof Error && error.message === 'Failed to update profile') {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getProfile(request: AuthenticatedRequest) {
  try {
    // Get profile using service
    const user = await ProfileService.getProfile(request.user.id);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    // Handle business logic errors
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: [{ field: 'server', message: 'Failed to fetch profile' }]
      },
      { status: 500 }
    );
  }
}

// Export authenticated route handlers
export const PATCH = withAuth(updateProfile);
export const GET = withAuth(getProfile);