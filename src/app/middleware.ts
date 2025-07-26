import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to auth routes
  if (pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow access to static files
  if (pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")) {
    return NextResponse.next();
  }

  // Skip middleware for API routes since they handle auth internally
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      // Redirect to login page if not authenticated
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error checking session:", error);
    // If there's an error checking session, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - /api (API routes)
     * - login/signup pages
     */
    "/((?!_next/static|_next/image|favicon.ico|api|login|signup).*)",
  ],
};
