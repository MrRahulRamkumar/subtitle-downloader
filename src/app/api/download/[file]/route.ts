import type { NextRequest } from "next/server";
import fs from "fs";
import { fetchDownloadURL } from "~/lib/backend-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: number }> },
) {
  const file = (await params).file;
  const url = request.nextUrl;
  const filePath = url.searchParams.get("filePath");

  if (!file || !filePath) {
    return Response.json(
      { message: "No file or filePath provided", success: false },
      { status: 400 },
    );
  }

  const downloadURL = await fetchDownloadURL(file);

  if (!downloadURL) {
    return Response.json(
      {
        message: `Failed to fetch the download URL`,
        success: false,
      },
      { status: 500 },
    );
  }

  const pathParts = filePath.split("/");
  const fileName = pathParts.pop()?.split(".").slice(0, -1).join(".");
  const path = pathParts.join("/");

  const subtitleResponse = await fetch(downloadURL);
  const subtitleContent = await subtitleResponse.text();

  fs.writeFileSync(`${path}/${fileName}.srt`, subtitleContent);

  return Response.json({
    message: `Downloaded file ${file} to ${filePath}`,
    success: true,
  });
}
