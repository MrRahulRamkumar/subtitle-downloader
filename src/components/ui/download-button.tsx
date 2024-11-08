"use client";

import { Button } from "~/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

export interface DownloadButtonProps {
  file: number;
  filePath: string;
}

async function downloadSubtitle(file: number, filePath: string) {
  const response = await fetch(`/api/download/${file}/?filePath=${filePath}`);
  const responseJSON = (await response.json()) as {
    message: string;
    success: boolean;
  };
  return responseJSON;
}

export function DownloadButton({ file, filePath }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <div className="flex min-w-40 max-w-40 flex-col gap-y-2">
      <Button
        onClick={async () => {
          setLoading(true);
          const response = await downloadSubtitle(file, filePath);
          setLoading(false);

          if (response.success) {
            setMessage("Subtitle downloaded successfully");
          } else {
            setMessage(response.message);
          }
        }}
        className="mt-4 sm:mr-2"
      >
        {!loading && (
          <>
            <Download /> Download
          </>
        )}
        {loading && (
          <>
            <Loader2 className="animate-spin" /> Loading
          </>
        )}
      </Button>
      {message && <p className="text-center text-sm">{message}</p>}
    </div>
  );
}
