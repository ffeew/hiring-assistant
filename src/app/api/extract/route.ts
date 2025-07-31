import { NextResponse } from "next/server";
import { extractResumeData } from "./extract.service";
import { findOrCreateApplicant, createResumeRecord, checkForDuplicateResume } from "./resume-extraction.service";
import { r2Service } from "@/lib/r2";
import { SUPPORTED_FILE_TYPES, type ExtractionResponseData } from "@/app/types";
import { SDKError } from "@mistralai/mistralai/models/errors/sdkerror";
import { withAuth, AuthenticatedRequest } from "@/lib/auth-middleware";

async function extractResumes(request: AuthenticatedRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files were uploaded." },
        { status: 400 }
      );
    }

    const extractedData = await Promise.allSettled(
      files.map(async (file): Promise<ExtractionResponseData> => {
        // Type narrowing to ensure file type is supported
        if (!SUPPORTED_FILE_TYPES.includes(file.type as typeof SUPPORTED_FILE_TYPES[number])) {
          throw new Error(`Unsupported file type: ${file.type} for file: ${file.name}`);
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        
        // Check for duplicate resume before processing
        const duplicateCheck = await checkForDuplicateResume(request.user.id, fileBuffer);
        
        if (duplicateCheck.isDuplicate) {
          // Return existing resume data without processing
          return {
            fileName: file.name,
            resumeId: duplicateCheck.resumeId!,
            applicantId: duplicateCheck.applicantId!,
            firstName: duplicateCheck.firstName!,
            lastName: duplicateCheck.lastName!,
            email: duplicateCheck.email!,
            template: 'screening',
          };
        }
        
        // Extract resume data using Mistral OCR
        const extractedInfo = await extractResumeData(fileBuffer, file.type as typeof SUPPORTED_FILE_TYPES[number]);
        
        // Upload file to R2
        const uploadResult = await r2Service.uploadFile(
          fileBuffer,
          file.name,
          file.type,
          request.user.id
        );

        // Find or create applicant based on email
        const applicantId = await findOrCreateApplicant(request.user.id, extractedInfo);

        // Create resume record in database with file hash
        const resumeId = await createResumeRecord(
          applicantId,
          file.name,
          uploadResult.filePath,
          file.size,
          file.type,
          extractedInfo.extractedText,
          duplicateCheck.fileHash
        );

        return {
          fileName: file.name,
          resumeId,
          applicantId,
          firstName: extractedInfo.firstName,
          lastName: extractedInfo.lastName,
          email: extractedInfo.email,
          template: 'screening', // Default template
        };
      })
    );

    // Process results and separate successful extractions from errors
    const results: ExtractionResponseData[] = extractedData.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Error processing file ${files[index].name}:`, result.reason);

        // result.reason is an SDKError, we can extract the message
        if (result.reason instanceof SDKError) {
          return {
            fileName: files[index].name,
            error: JSON.parse(result.reason.body).message
          };
        }
        return {
          fileName: files[index].name,
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error occurred'
        };
      }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error extracting data:", error);
    return NextResponse.json(
      { error: "Failed to extract data from resumes." },
      { status: 500 }
    );
  }
}

// Export authenticated route handler
export const POST = withAuth(extractResumes);
