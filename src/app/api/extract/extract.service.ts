import { Mistral } from '@mistralai/mistralai';
import { responseFormatFromZodObject } from '@mistralai/mistralai/extra/structChat.js';
import { env } from '@/lib/env';
import { ResponseFormat } from '@mistralai/mistralai/models/components/responseformat';
import { randomUUID } from 'node:crypto';
import { SUPPORTED_FILE_TYPES, mistralExtractionSchema, resumeExtractionSchema, type ResumeExtractionData } from '@/app/types';

const client = new Mistral({ apiKey: env.MISTRAL_API_KEY });



export async function extractResumeData(fileBuffer: Buffer, fileType: typeof SUPPORTED_FILE_TYPES[number]): Promise<{ extractedText: string; structuredResumeData: ResumeExtractionData; }> {
  if (!SUPPORTED_FILE_TYPES.includes(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  try {
    const response = await extractInformationFromFile({
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
      return { extractedText: response.pages.map(page => page.markdown).join("\n---\n"), structuredResumeData: resumeExtractionSchema.parse(mistralValidatedData) };
    } catch (validationError) {
      console.warn("Resume data failed full validation, but will proceed with basic validation:", validationError);
      // Return the Mistral-validated data as ResumeExtractionData
      return { extractedText: response.pages.map(page => page.markdown).join("\n---\n"), structuredResumeData: mistralValidatedData as ResumeExtractionData };
    }
  } catch (error) {
    console.error("Error extracting resume data:", error);
    throw error;
  }
}

async function extractInformationFromFile({ fileBuffer, fileType, annotationFormat }: { fileBuffer: Buffer, fileType: typeof SUPPORTED_FILE_TYPES[number]; annotationFormat: ResponseFormat; }) {
  switch (fileType) {
    case 'application/pdf':
      return extractInformationFromPdf(fileBuffer, annotationFormat);
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractInformationFromDocx(fileBuffer, annotationFormat);
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function extractInformationFromPdf(fileBuffer: Buffer, annotationFormat?: ResponseFormat) {
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

async function extractInformationFromDocx(fileBuffer: Buffer, annotationFormat?: ResponseFormat) {
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