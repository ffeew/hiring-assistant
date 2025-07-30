import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/db';
import { jobPost } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const updateJobPostSchema = z.object({
  title: z.string().min(1, "Job title is required").optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior']).optional(),
  description: z.string().min(1, "Job description is required").optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  salaryRange: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const [post] = await db
      .select()
      .from(jobPost)
      .where(and(
        eq(jobPost.id, resolvedParams.id),
        eq(jobPost.userId, session.user.id)
      ))
      .limit(1);

    if (!post) {
      return NextResponse.json(
        { error: 'Job post not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const parsedJobPost = {
      ...post,
      requirements: post.requirements ? JSON.parse(post.requirements) : [],
      responsibilities: post.responsibilities ? JSON.parse(post.responsibilities) : [],
      benefits: post.benefits ? JSON.parse(post.benefits) : [],
    };

    return NextResponse.json({
      success: true,
      jobPost: parsedJobPost,
    });
  } catch (error) {
    console.error('Error fetching job post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    const body = await request.json();
    const validatedData = updateJobPostSchema.parse(body);

    // Check if job post exists and belongs to user
    const [existingPost] = await db
      .select()
      .from(jobPost)
      .where(and(
        eq(jobPost.id, resolvedParams.id),
        eq(jobPost.userId, session.user.id)
      ))
      .limit(1);

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Job post not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.department !== undefined) updateData.department = validatedData.department;
    if (validatedData.location !== undefined) updateData.location = validatedData.location;
    if (validatedData.employmentType !== undefined) updateData.employmentType = validatedData.employmentType;
    if (validatedData.experienceLevel !== undefined) updateData.experienceLevel = validatedData.experienceLevel;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.requirements !== undefined) updateData.requirements = JSON.stringify(validatedData.requirements);
    if (validatedData.responsibilities !== undefined) updateData.responsibilities = JSON.stringify(validatedData.responsibilities);
    if (validatedData.benefits !== undefined) updateData.benefits = JSON.stringify(validatedData.benefits);
    if (validatedData.salaryRange !== undefined) updateData.salaryRange = validatedData.salaryRange;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

    const [updatedJobPost] = await db
      .update(jobPost)
      .set(updateData)
      .where(eq(jobPost.id, resolvedParams.id))
      .returning();

    // Parse JSON fields for response
    const responseJobPost = {
      ...updatedJobPost,
      requirements: updatedJobPost.requirements ? JSON.parse(updatedJobPost.requirements) : [],
      responsibilities: updatedJobPost.responsibilities ? JSON.parse(updatedJobPost.responsibilities) : [],
      benefits: updatedJobPost.benefits ? JSON.parse(updatedJobPost.benefits) : [],
    };

    return NextResponse.json({
      success: true,
      jobPost: responseJobPost,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating job post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const resolvedParams = await params;
    // Check if job post exists and belongs to user
    const [existingPost] = await db
      .select()
      .from(jobPost)
      .where(and(
        eq(jobPost.id, resolvedParams.id),
        eq(jobPost.userId, session.user.id)
      ))
      .limit(1);

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Job post not found' },
        { status: 404 }
      );
    }

    await db.delete(jobPost).where(eq(jobPost.id, resolvedParams.id));

    return NextResponse.json({
      success: true,
      message: 'Job post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting job post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}