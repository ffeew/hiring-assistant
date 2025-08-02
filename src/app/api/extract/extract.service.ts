import { Mistral } from '@mistralai/mistralai';
import { responseFormatFromZodObject } from '@mistralai/mistralai/extra/structChat.js';
import { env } from '@/lib/env';
import { ResponseFormat } from '@mistralai/mistralai/models/components/responseformat';
import { randomUUID } from 'node:crypto';
import { SUPPORTED_FILE_TYPES } from '@/app/types';
import { 
  mistralExtractionSchema, 
  resumeExtractionSchema,
  type ResumeExtractionData,
  type ExtractionResponseData
} from './extract.validator';
import { db } from '@/lib/db/db';
import { applicant, resumeFile } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculateFileHash } from '@/lib/hash';
import { withNotDeleted } from '@/lib/soft-delete';
import { r2Service } from "@/lib/r2";

const client = new Mistral({ apiKey: env.MISTRAL_API_KEY });

// ============================================================================
// EXTRACT SERVICE - MAIN BUSINESS LOGIC
// ============================================================================

export class ExtractService {
  /**
   * Main method to process resume files
   */
  static async processResumes(
    userId: string, 
    files: File[], 
    jobPostId: string
  ): Promise<ExtractionResponseData[]> {
    const extractedData = await Promise.allSettled(
      files.map(async (file): Promise<ExtractionResponseData> => {
        // Type narrowing to ensure file type is supported
        if (!SUPPORTED_FILE_TYPES.includes(file.type as typeof SUPPORTED_FILE_TYPES[number])) {
          throw new Error(`Unsupported file type: ${file.type} for file: ${file.name}`);
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // Check for duplicate resume before processing
        const duplicateCheck = await this.checkForDuplicateResume(userId, fileBuffer);

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
        const { extractedText, structuredResumeData } = await this.extractResumeData(
          fileBuffer, 
          file.type as typeof SUPPORTED_FILE_TYPES[number]
        );

        // Upload file to R2
        const uploadResult = await r2Service.uploadFile(
          fileBuffer,
          file.name,
          file.type,
          userId
        );

        // Find or create applicant based on email
        const applicantId = await this.findOrCreateApplicant(userId, structuredResumeData, jobPostId);

        // Create resume record in database with file hash
        const resumeId = await this.createResumeRecord(
          applicantId,
          file.name,
          uploadResult.filePath,
          file.size,
          file.type,
          extractedText,
          duplicateCheck.fileHash,
          jobPostId
        );

        return {
          fileName: file.name,
          resumeId,
          applicantId,
          firstName: structuredResumeData.firstName,
          lastName: structuredResumeData.lastName,
          email: structuredResumeData.email,
          template: 'screening', // Default template
        };
      })
    );

    // Process results and separate successful extractions from errors
    return extractedData.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Error processing file ${files[index].name}:`, result.reason);
        return {
          fileName: files[index].name,
          error: result.reason instanceof Error ? result.reason.message : 'Unknown error occurred'
        };
      }
    });
  }

  /**
   * Extract data from resume using Mistral OCR
   */
  static async extractResumeData(
    fileBuffer: Buffer, 
    fileType: typeof SUPPORTED_FILE_TYPES[number]
  ): Promise<{ extractedText: string; structuredResumeData: ResumeExtractionData; }> {
    if (!SUPPORTED_FILE_TYPES.includes(fileType)) {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    try {
      const response = await this.extractInformationFromFile({
        fileBuffer,
        fileType,
        annotationFormat: responseFormatFromZodObject(mistralExtractionSchema),
      });

      if (!response.documentAnnotation) {
        throw new Error("No document annotation found in the response.");
      }

      const extractedData = JSON.parse(response.documentAnnotation);

      // First validate with Mistral schema to ensure basic structure
      const mistralValidatedData = mistralExtractionSchema.parse(extractedData);

      // Then validate with full schema (this will validate email/URL formats)
      // If validation fails, we'll still return the Mistral data but log the validation errors
      try {
        return { 
          extractedText: response.pages.map(page => page.markdown).join("\n---\n"), 
          structuredResumeData: resumeExtractionSchema.parse(mistralValidatedData) 
        };
      } catch (validationError) {
        console.warn("Resume data failed full validation, but will proceed with basic validation:", validationError);
        // Return the Mistral-validated data as ResumeExtractionData
        return { 
          extractedText: response.pages.map(page => page.markdown).join("\n---\n"), 
          structuredResumeData: mistralValidatedData as ResumeExtractionData 
        };
      }
    } catch (error) {
      console.error("Error extracting resume data:", error);
      throw error;
    }
  }

  /**
   * Find existing applicant or create new one
   */
  static async findOrCreateApplicant(
    userId: string,
    extractedData: ResumeExtractionData,
    jobPostId: string
  ): Promise<string> {
    // Check if applicant exists by email
    const existingApplicant = await db
      .select()
      .from(applicant)
      .where(eq(applicant.email, extractedData.email))
      .limit(1);

    if (existingApplicant.length > 0) {
      return existingApplicant[0].id;
    }

    // Create new applicant using validated schema
    const applicantId = randomUUID();

    // Prepare metadata from extracted data
    const metadata = {
      skills: extractedData.skills,
      experience: extractedData.experience,
      education: extractedData.education,
    };

    await db.insert(applicant).values({
      id: applicantId,
      userId,
      jobPostId,
      firstName: extractedData.firstName,
      lastName: extractedData.lastName,
      email: extractedData.email,
      phone: extractedData.phone || undefined,
      linkedinUrl: extractedData.linkedinUrl || undefined,
      githubUrl: extractedData.githubUrl || undefined,
      portfolioUrl: extractedData.portfolioUrl || undefined,
      status: 'applied',
      source: 'bulk_upload',
      metadata: JSON.stringify(metadata),
    });

    return applicantId;
  }

  /**
   * Create resume record in database
   */
  static async createResumeRecord(
    applicantId: string,
    fileName: string,
    filePath: string,
    fileSize: number,
    mimeType: string,
    extractedText: string,
    fileHash: string,
    jobPostId: string
  ): Promise<string> {
    const resumeId = randomUUID();

    await db.insert(resumeFile).values({
      id: resumeId,
      applicantId,
      jobPostId,
      fileName,
      filePath,
      fileSize,
      mimeType,
      fileHash,
      resumeContent: extractedText,
      extractionStatus: 'success',
    });

    return resumeId;
  }

  /**
   * Check if resume already exists (duplicate detection)
   */
  static async checkForDuplicateResume(
    userId: string,
    fileBuffer: Buffer
  ): Promise<{
    isDuplicate: boolean;
    resumeId?: string;
    applicantId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    fileHash: string;
  }> {
    // Calculate file hash
    const fileHash = calculateFileHash(fileBuffer);

    // Check if this hash already exists for this user
    const existing = await this.findExistingResumeByHash(userId, fileHash);

    if (existing) {
      return {
        isDuplicate: true,
        resumeId: existing.resumeId,
        applicantId: existing.applicantId,
        firstName: existing.firstName,
        lastName: existing.lastName,
        email: existing.email,
        fileHash,
      };
    }

    return {
      isDuplicate: false,
      fileHash,
    };
  }

  /**
   * Find existing resume by file hash
   */
  static async findExistingResumeByHash(
    userId: string,
    fileHash: string
  ): Promise<{ resumeId: string; applicantId: string; firstName: string; lastName: string; email: string; } | null> {
    // Check if a resume with this hash already exists for this user
    const existingResume = await db
      .select({
        resumeId: resumeFile.id,
        applicantId: resumeFile.applicantId,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
      })
      .from(resumeFile)
      .innerJoin(applicant, eq(resumeFile.applicantId, applicant.id))
      .where(
        withNotDeleted(
          resumeFile.deletedAt,
          eq(resumeFile.fileHash, fileHash),
          eq(applicant.userId, userId)
        )
      )
      .limit(1);

    return existingResume.length > 0 ? existingResume[0] : null;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private static async extractInformationFromFile({ 
    fileBuffer, 
    fileType, 
    annotationFormat 
  }: { 
    fileBuffer: Buffer, 
    fileType: typeof SUPPORTED_FILE_TYPES[number]; 
    annotationFormat: ResponseFormat; 
  }) {
    switch (fileType) {
      case 'application/pdf':
        return this.extractInformationFromPdf(fileBuffer, annotationFormat);
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.extractInformationFromDocx(fileBuffer, annotationFormat);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  private static async extractInformationFromPdf(fileBuffer: Buffer, annotationFormat?: ResponseFormat) {
    try {
      const base64File = fileBuffer.toString('base64');

      return await client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          documentUrl: "data:application/pdf;base64," + base64File,
        },
        documentAnnotationFormat: annotationFormat,
        includeImageBase64: true,
      });
    } catch (error) {
      console.error("Error processing PDF file:", error);
      throw error;
    }
  }

  private static async extractInformationFromDocx(fileBuffer: Buffer, annotationFormat?: ResponseFormat) {
    try {
      const uploadedDocx = await client.files.upload({
        file: {
          fileName: `${randomUUID()}.docx`,
          content: fileBuffer,
        },
        purpose: "ocr"
      });
      const signedUrl = await client.files.getSignedUrl({
        fileId: uploadedDocx.id,
      });

      const ocrResponse = await client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          documentUrl: signedUrl.url,
        },
        documentAnnotationFormat: annotationFormat,
        includeImageBase64: true
      });

      // delete the uploaded file after processing
      await client.files.delete({
        fileId: uploadedDocx.id,
      });

      return ocrResponse;
    } catch (error) {
      console.error("Error uploading or processing DOCX file:", error);
      throw error;
    }
  }
}