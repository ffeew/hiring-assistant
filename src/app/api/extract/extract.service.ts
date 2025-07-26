import { Mistral } from '@mistralai/mistralai';
import { z } from 'zod';
import { responseFormatFromZodObject } from '@mistralai/mistralai/extra/structChat.js';
import { env } from '@/lib/env';

const client = new Mistral({ apiKey: env.MISTRAL_API_KEY });

const ResumeExtractionForEmailSchema = z.object({
  firstName: z.string().describe("The first name of the candidate."),
  lastName: z.string().describe("The last name of the candidate."),
  email: z.string().describe("The email address of the candidate."),
});


export async function extractContactInfoFromResume(fileBuffer: Buffer) {
  try {
    // we first convert the file buffer to a base64 string
    const base64File = fileBuffer.toString('base64');


    const response = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: "data:application/pdf;base64," + base64File,
      },
      documentAnnotationFormat: responseFormatFromZodObject(ResumeExtractionForEmailSchema),
      includeImageBase64: true,
    });

    if (!response.documentAnnotation) {
      throw new Error("No document annotation found in the response.");
    }

    return JSON.parse(response.documentAnnotation) as z.infer<typeof ResumeExtractionForEmailSchema>;
  } catch (error) {
    console.error("Error processing document:", error);
  }
}