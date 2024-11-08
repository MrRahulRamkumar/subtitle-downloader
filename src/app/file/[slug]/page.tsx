import { Card, CardContent } from "~/components/ui/card";
import { DownloadButton } from "~/components/ui/download-button";
import { fetchSubtitles } from "~/lib/backend-utils";

export default async function Page({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const filePath = (await searchParams).filePath;

  if (!slug || !filePath || typeof filePath !== "string") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold md:text-4xl">Error</h1>
        <p className="mt-4 text-center text-red-500">{`No slug or filePath provided`}</p>
      </div>
    );
  }

  const subtitles = await fetchSubtitles("/subtitles", slug);
  if (!subtitles || subtitles.data.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold md:text-4xl">Error</h1>
        <p className="mt-4 text-center text-red-500">
          {`Failed to fetch subtitles for ${slug}`}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4">
        {subtitles.data.map((subtitle) => (
          <Card key={subtitle.id}>
            <CardContent className="flex flex-col items-center justify-between p-4 sm:flex-row">
              <div>
                <h2 className="text-center font-semibold sm:text-left sm:text-lg">
                  {subtitle.attributes.release}
                </h2>
                <p className="text-center text-sm text-gray-500 sm:text-left">
                  {`Downloaded ${subtitle.attributes.download_count} times`}
                </p>
              </div>
              {subtitle.attributes.files[0]?.file_id && (
                <DownloadButton
                  file={subtitle.attributes.files[0].file_id}
                  filePath={filePath}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
