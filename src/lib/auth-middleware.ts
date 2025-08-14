import { NextRequest, NextResponse } from 'next/server';
import { auth, Session } from '@/lib/auth';
import { headers } from 'next/headers';

export interface AuthenticatedRequest extends NextRequest {
  user: Session['user'];
}

export interface AuthenticatedParamsRequest extends AuthenticatedRequest {
  params: Record<string, string>;
}

export type AuthenticatedHandler = (
  request: AuthenticatedRequest
) => Promise<NextResponse>;

export type AuthenticatedParamsHandler = (
  request: AuthenticatedRequest,
  context: { params: Promise<Record<string, string>>; }
) => Promise<NextResponse>;

/**
 * Higher-order function that wraps API route handlers with authentication (no params)
 */
export function withAuth(handler: AuthenticatedHandler): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    try {
      // Get session from Better Auth
      const session = await auth.api.getSession({
        headers: await headers()
      });

      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Add user to request object
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = session.user;

      // Call the original handler with authenticated request
      return await handler(authenticatedRequest);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Higher-order function that wraps API route handlers with authentication (with params)
 */
export function withAuthParams(handler: AuthenticatedParamsHandler): (request: NextRequest, context: { params: Promise<Record<string, string>>; }) => Promise<NextResponse> {
  return async (request: NextRequest, context: { params: Promise<Record<string, string>>; }) => {
    try {
      // Get session from Better Auth
      const session = await auth.api.getSession({
        headers: await headers()
      });

      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Add user to request object
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = session.user;

      // Call the original handler with authenticated request and context
      return await handler(authenticatedRequest, context);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}
