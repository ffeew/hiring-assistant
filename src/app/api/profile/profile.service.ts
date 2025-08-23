import { db } from '@/lib/db/db';
import { user as userTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { safeEncrypt } from '@/lib/crypto';
import type { UpdateProfileBody } from './profile.validator';

export class ProfileService {
  static async getProfile(userId: string) {
    const [userProfile] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (!userProfile) {
      throw new Error('User not found');
    }

    // Hide password in response
    return {
      ...userProfile,
      gmailAppPassword: userProfile.gmailAppPassword ? '****' : null,
    };
  }

  static async updateProfile(userId: string, data: UpdateProfileBody) {
    const { gmailAddress, gmailAppPassword, companyName, jobTitle } = data;

    // Handle empty strings - convert to null for database storage
    const cleanGmailAddress = gmailAddress && gmailAddress.trim() !== "" ? gmailAddress : null;
    const cleanGmailPassword = gmailAppPassword && gmailAppPassword.trim() !== "" ? gmailAppPassword : null;

    // Encrypt password before storing (only if provided)
    const encryptedPassword = cleanGmailPassword ? safeEncrypt(cleanGmailPassword) : null;

    // Update user profile in database
    const [updatedUser] = await db
      .update(userTable)
      .set({
        gmailAddress: cleanGmailAddress,
        gmailAppPassword: encryptedPassword,
        companyName: companyName || null,
        jobTitle: jobTitle || null,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error('Failed to update profile');
    }

    // Hide password in response
    return {
      ...updatedUser,
      gmailAppPassword: updatedUser.gmailAppPassword ? '****' : null,
    };
  }
}