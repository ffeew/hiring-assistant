import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { withAuth, type AuthenticatedRequest } from "@/lib/auth-middleware";
import { InterviewAssistantService } from "./interview-assistant.service";
import { generateQuestionsBodySchema } from "./interview-assistant.validator";

async function generateQuestions(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = generateQuestionsBodySchema.parse(body);
    
    const result = await InterviewAssistantService.generateQuestions(
      request.user.id,
      validatedData
    );
    
    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    console.error("Unexpected error in interview assistant:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(generateQuestions);