import { z } from "zod";
import fs from "fs";
import * as path from "path";
import { env } from "~/env";

export async function fetchSubtitles(path: string, slug: string) {
  const SubtitleDataV = z.object({
    id: z.string(),
    attributes: z.object({
      download_count: z.number(),
      release: z.string(),
      files: z.array(z.object({ file_id: z.number() })),
    }),
  });

  const ResponseV = z.object({
    total_pages: z.number(),
    total_count: z.number(),
    per_page: z.number(),
    page: z.number(),
    data: z.array(SubtitleDataV),
  });

  const urlParams = new URLSearchParams({
    query: slug,
    languages: "en",
  });

  try {
    const subtitleResponse = await fetch(
      `https://api.opensubtitles.com/api/v1${path}?${urlParams.toString()}`,
      {
        headers: {
          "Api-Key": env.OPENSUBTITLES_API_KEY,
          "User-Agent": "PostmanRuntime/7.42.0",
        },
      },
    );

    if (subtitleResponse.status !== 200) {
      const errorResponse = await subtitleResponse.text();
      console.error("Error in fetchSubtitles");
      console.error(errorResponse);
      return;
    }

    const subtitleJSON: unknown = await subtitleResponse.json();
    return ResponseV.parse(subtitleJSON);
  } catch (error) {
    console.error(error);
  }
}

export async function fetchLoginToken() {
  const LoginResponseV = z.object({
    token: z.string(),
  });

  try {
    const loginResponse = await fetch(
      "https://api.opensubtitles.com/api/v1/login",
      {
        method: "POST",
        headers: {
          "Api-Key": env.OPENSUBTITLES_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: env.OPENSUBTITLES_USERNAME,
          password: env.OPENSUBTITLES_PASSWORD,
        }),
      },
    );

    if (loginResponse.status !== 200) {
      console.error("Error in fetchLoginToken");
      const errorResponse = await loginResponse.text();
      console.error(errorResponse);
      return;
    }

    const loginJSON: unknown = await loginResponse.json();
    return LoginResponseV.parse(loginJSON).token;
  } catch (error) {
    console.error(error);
  }
}

export async function fetchDownloadURL(file: number) {
  const DownloadURLV = z.object({
    link: z.string(),
  });

  const token = await fetchLoginToken();
  if (!token) {
    return;
  }

  try {
    const downloadResponse = await fetch(
      `https://api.opensubtitles.com/api/v1/download`,
      {
        method: "POST",
        headers: {
          "Api-Key": env.OPENSUBTITLES_API_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_id: file }),
      },
    );

    if (downloadResponse.status !== 200) {
      const errorResponse = await downloadResponse.text();
      console.error("Error in fetchDownloadURL");
      console.error(errorResponse);
      return;
    }

    return DownloadURLV.parse(await downloadResponse.json()).link;
  } catch (error) {
    console.error(error);
  }
}

export async function getFilesSortedByCreationTime(
  dir: string,
): Promise<{ name: string; path: string; time: number }[]> {
  const files: { name: string; time: number; path: string }[] = [];

  async function traverseDirectory(currentDir: string) {
    const entries = await fs.promises.readdir(currentDir, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await traverseDirectory(fullPath);
      } else {
        const stats = await fs.promises.stat(fullPath);
        files.push({
          name: entry.name,
          time: stats.birthtimeMs,
          path: fullPath,
        });
      }
    }
  }

  await traverseDirectory(dir);

  files.sort((a, b) => a.time - b.time);
  return files;
}
