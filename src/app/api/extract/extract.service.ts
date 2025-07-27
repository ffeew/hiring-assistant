import { Mistral } from '@mistralai/mistralai';
import { z } from 'zod';
import { responseFormatFromZodObject } from '@mistralai/mistralai/extra/structChat.js';
import { env } from '@/lib/env';
import { ResponseFormat } from '@mistralai/mistralai/models/components/responseformat';
import { randomUUID } from 'node:crypto';
import { SUPPORTED_FILE_TYPES } from '@/app/types';

const client = new Mistral({ apiKey: env.MISTRAL_API_KEY });

const ResumeExtractionForEmailSchema = z.object({
  firstName: z.string().describe("The first name of the candidate."),
  lastName: z.string().describe("The last name of the candidate."),
  email: z.string().describe("The email address of the candidate."),
});



export async function extractContactInfoFromResume(fileBuffer: Buffer, fileType: typeof SUPPORTED_FILE_TYPES[number]) {
  if (!SUPPORTED_FILE_TYPES.includes(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  try {
    const response = await extractInformationFromFile({
      fileBuffer,
      fileType,
      annotationFormat: responseFormatFromZodObject(ResumeExtractionForEmailSchema),
    });

    if (!response.documentAnnotation) {
      throw new Error("No document annotation found in the response.");
    }

    return JSON.parse(response.documentAnnotation) as z.infer<typeof ResumeExtractionForEmailSchema>;
  } catch (error) {
    console.error("Error extracting contact info from resume:", error);
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