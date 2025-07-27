import { NextRequest, NextResponse } from "next/server";
import { extractContactInfoFromResume } from "./extract.service";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SUPPORTED_FILE_TYPES } from "@/app/types";




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

    const extractedData = await Promise.all(
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

    return NextResponse.json(extractedData);
  } catch (error) {
    console.error("Error extracting data:", error);
    return NextResponse.json(
      { error: "Failed to extract data from resumes." },
      { status: 500 }
    );
  }
}
