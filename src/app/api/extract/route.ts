import { NextRequest, NextResponse } from "next/server";
import { extractContactInfoFromResume } from "./extract.service";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SUPPORTED_FILE_TYPES } from "@/app/types";
import { SDKError } from "@mistralai/mistralai/models/errors/sdkerror";




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
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files were uploaded." },
        { status: 400 }
      );
    }

    const extractedData = await Promise.allSettled(
      files.map(async (file) => {

        // Type narrowing to ensure file type is supported
        if (!SUPPORTED_FILE_TYPES.includes(file.type as typeof SUPPORTED_FILE_TYPES[number])) {
          throw new Error(`Unsupported file type: ${file.type} for file: ${file.name}`);
        }

        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const extractedInfo = await extractContactInfoFromResume(fileBuffer, file.type as typeof SUPPORTED_FILE_TYPES[number]);
        return {
          fileName: file.name,
          ...extractedInfo, // Assuming extractContactInfoFromResume returns an object with name and email
        };
      })
    );

    // Process results and separate successful extractions from errors
    const results = extractedData.map((result, index) => {
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
