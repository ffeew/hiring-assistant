import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { db } from '@/lib/db/db';
import { jobPost } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';

const createJobPostSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  department: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior']).optional(),
  description: z.string().min(1, "Job description is required"),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  salaryRange: z.string().optional(),
});

// Removed unused updateJobPostSchema

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const conditions = [eq(jobPost.userId, session.user.id)];
    
    if (activeOnly) {
      conditions.push(eq(jobPost.isActive, true));
    }

    const jobPosts = await db
      .select()
      .from(jobPost)
      .where(and(...conditions))
      .orderBy(desc(jobPost.createdAt));

    // Parse JSON fields
    const parsedJobPosts = jobPosts.map(post => ({
      ...post,
      requirements: post.requirements ? JSON.parse(post.requirements) : [],
      responsibilities: post.responsibilities ? JSON.parse(post.responsibilities) : [],
      benefits: post.benefits ? JSON.parse(post.benefits) : [],
    }));

    return NextResponse.json({
      success: true,
      jobPosts: parsedJobPosts,
    });
  } catch (error) {
    console.error('Error fetching job posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validatedData = createJobPostSchema.parse(body);

    const newJobPost = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      title: validatedData.title,
      department: validatedData.department || null,
      location: validatedData.location || null,
      employmentType: validatedData.employmentType || null,
      experienceLevel: validatedData.experienceLevel || null,
      description: validatedData.description,
      requirements: validatedData.requirements ? JSON.stringify(validatedData.requirements) : null,
      responsibilities: validatedData.responsibilities ? JSON.stringify(validatedData.responsibilities) : null,
      benefits: validatedData.benefits ? JSON.stringify(validatedData.benefits) : null,
      salaryRange: validatedData.salaryRange || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [createdJobPost] = await db.insert(jobPost).values(newJobPost).returning();

    // Parse JSON fields for response
    const responseJobPost = {
      ...createdJobPost,
      requirements: createdJobPost.requirements ? JSON.parse(createdJobPost.requirements) : [],
      responsibilities: createdJobPost.responsibilities ? JSON.parse(createdJobPost.responsibilities) : [],
      benefits: createdJobPost.benefits ? JSON.parse(createdJobPost.benefits) : [],
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

    console.error('Error creating job post:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}