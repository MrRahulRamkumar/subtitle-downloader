import { Download } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { getFilesSortedByCreationTime } from "~/lib/backend-utils";

export default async function HomePage() {
  const directoryList = [
    "/Users/rahulramkumar/Downloads/",
    "/Users/rahulramkumar/Documents/",
  ];
  const fileList: { name: string; path: string; time: number }[] = [];

  for (const directory of directoryList) {
    const files = await getFilesSortedByCreationTime(directory);
    fileList.push(...files);
  }

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4">
        {fileList
          .filter((file) => !file.name.startsWith("."))
          .map((file) => (
            <Card key={file.name}>
              <CardContent className="flex flex-col items-center justify-between p-4 sm:flex-row">
                <div>
                  <h2 className="text-center font-semibold sm:text-left sm:text-lg">
                    {file.name}
                  </h2>
                </div>
                <Link href={`/file/${file.name}?filePath=${file.path}`}>
                  <Button className="mt-4 sm:mr-2">
                    <Download className="h-4 w-4" />
                    Fetch Subtitles
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
