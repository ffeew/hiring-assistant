import { NextResponse } from "next/server";
import { SUPPORTED_FILE_TYPES } from "@/app/types";
import { SDKError } from "@mistralai/mistralai/models/errors/sdkerror";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-middleware";
import { ZodError } from "zod";
import { ExtractService } from "./extract.service";

// ============================================================================
// EXTRACT CONTROLLER - HTTP HANDLING ONLY
// ============================================================================

async function extractResumes(request: AuthenticatedRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const jobPostId = formData.get("jobPostId") as string | null;

    // Validate input
    if (!files || files.length === 0) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: [{ field: "files", message: "No files were uploaded." }]
        },
        { status: 400 }
      );
    }

    if (!jobPostId) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: [{ field: "jobPostId", message: "Job post ID is required for resume uploads." }]
        },
        { status: 400 }
      );
    }

    // Validate file types
    const unsupportedFiles = files.filter(file => 
      !SUPPORTED_FILE_TYPES.includes(file.type as typeof SUPPORTED_FILE_TYPES[number])
    );

    if (unsupportedFiles.length > 0) {
      return NextResponse.json(
        { 
          error: "Validation failed",
          details: unsupportedFiles.map(file => ({
            field: "files",
            message: `Unsupported file type: ${file.type} for file: ${file.name}`
          }))
        },
        { status: 400 }
      );
    }

    // Process resumes using service layer
    const results = await ExtractService.processResumes(
      request.user.id,
      files,
      jobPostId
    );

    return NextResponse.json(results);
    
  } catch (error) {
    console.error("Error in extract controller:", error);

    // Handle specific error types
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

    if (error instanceof SDKError) {
      try {
        const errorBody = JSON.parse(error.body);
        return NextResponse.json(
          { 
            error: "External service error",
            details: [{ field: "mistral", message: errorBody.message || "Mistral API error" }]
          },
          { status: 422 }
        );
      } catch {
        return NextResponse.json(
          { 
            error: "External service error",
            details: [{ field: "mistral", message: "Failed to process with Mistral API" }]
          },
          { status: 422 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: [{ field: "server", message: "Failed to extract data from resumes." }]
      },
      { status: 500 }
    );
  }
}

// Export authenticated route handler
export const POST = withAuth(extractResumes);