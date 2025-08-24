import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-middleware";
import { generateTemplateBodySchema } from "./generate.validator";
import { TemplateGenerationService } from "./generate.service";

async function generateTemplate(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = generateTemplateBodySchema.parse(body);

    const result = await TemplateGenerationService.generateTemplate(validatedData);

    return NextResponse.json(result);
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
        {
          error: "AI generation failed", 
          details: [{ field: "prompt", message: error.message }]
        },
        { status: 400 }
      );
    }

    console.error("Error in generateTemplate:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: [{ field: "server", message: "Failed to generate template" }]
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(generateTemplate);