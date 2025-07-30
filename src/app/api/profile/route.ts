import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/db';
import { user as userTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { safeEncrypt } from '@/lib/crypto';

export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { gmailAddress, gmailAppPassword, companyName, jobTitle } = body;

    // Validate required fields
    if (!gmailAddress || !gmailAppPassword) {
      return NextResponse.json(
        { error: 'Gmail address and app password are required' },
        { status: 400 }
      );
    }

    // Encrypt password before storing
    const encryptedPassword = gmailAppPassword ? safeEncrypt(gmailAppPassword) : gmailAppPassword;

    // Update user profile in database
    const [updatedUser] = await db
      .update(userTable)
      .set({
        gmailAddress,
        gmailAppPassword: encryptedPassword,
        companyName: companyName || null,
        jobTitle: jobTitle || null,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, session.user.id))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Decrypt password for response (but don't send it back for security)
    const userResponse = {
      ...updatedUser,
      gmailAppPassword: updatedUser.gmailAppPassword ? '****' : null, // Hide password in response
    };

    return NextResponse.json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const [userProfile] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Decrypt password for internal use but hide it in response
    const userResponse = {
      ...userProfile,
      gmailAppPassword: userProfile.gmailAppPassword ? '****' : null, // Hide password in response
    };

    return NextResponse.json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}