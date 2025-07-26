import { NextRequest, NextResponse } from "next/server";
import { extractContactInfoFromResume } from "./extract.service";




export async function POST(request: NextRequest) {
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
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const extractedInfo = await extractContactInfoFromResume(fileBuffer);
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
