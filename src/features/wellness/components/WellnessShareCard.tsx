import { useEffect, useRef, useState } from "react";
import {
  Download,
  FileImage,
  FileText,
  X,
} from "lucide-react";

import WellnessShareService, {
  type WeeklyWellnessData,
} from "../services/WellnessShareService";

interface WellnessShareCardProps {
  data: WeeklyWellnessData;
  open: boolean;
  onClose: () => void;
}

const metrics = [
  {
    key: "mood",
    label: "Mood",
  },
  {
    key: "journal",
    label: "Journal",
  },
  {
    key: "music",
    label: "Music",
  },
  {
    key: "community",
    label: "Community",
  },
  {
    key: "meditation",
    label: "Meditation",
  },
] as const;

export default function WellnessShareCard({
  data,
  open,
  onClose,
}: WellnessShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [downloadOpen, setDownloadOpen] =
    useState(false);

  const [downloading, setDownloading] =
    useState<"jpeg" | "pdf" | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleDownload = async (
    format: "jpeg" | "pdf",
  ) => {
    if (!cardRef.current) {
      return;
    }

    try {
      setDownloading(format);
      setDownloadOpen(false);

      if (format === "jpeg") {
        await WellnessShareService.downloadJpeg(
          cardRef.current,
        );
      } else {
        await WellnessShareService.downloadPdf(
          cardRef.current,
        );
      }
    } catch (error) {
      console.error(
        "Failed to export wellness card:",
        error,
      );
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 pb-28 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Weekly wellness card"
        className="relative w-full max-w-md"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close wellness card"
          className="absolute -right-2 -top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-background shadow-lg"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          ref={cardRef}
          className="overflow-hidden rounded-[32px] bg-white p-7 text-slate-900 shadow-2xl"
        >
          <div className="text-center">
            <div className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
              Saathi
            </div>

            <h2 className="text-2xl font-bold">
              Weekly Wellness
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your wellness snapshot from the
              last 7 days
            </p>
          </div>

          <div className="my-7 flex justify-center">
            <div
              className="flex h-32 w-32 flex-col items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(
                  #5b8def ${data.score}%,
                  #e8edf5 ${data.score}% 100%
                )`,
              }}
            >
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold">
                  {data.score}
                </span>

                <span className="text-xs text-slate-400">
                  / 100
                </span>
              </div>
            </div>
          </div>

          <div className="mb-7 text-center">
            <p className="text-sm font-semibold text-slate-700">
              {data.status}
            </p>
          </div>

          <div className="space-y-5">
            {metrics.map((metric) => {
              const value = Math.max(
                0,
                Math.min(
                  100,
                  Math.round(data[metric.key]),
                ),
              );

              return (
                <div key={metric.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      {metric.label}
                    </span>

                    <span className="text-sm font-semibold text-slate-500">
                      {value}
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-800"
                      style={{
                        width: `${value}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-400">
              Small steps. Better days. Together
              with Saathi.
            </p>
          </div>
        </div>

        <div className="relative mt-4 flex justify-center">
          <button
            type="button"
            disabled={downloading !== null}
            onClick={() =>
              setDownloadOpen((value) => !value)
            }
            className="flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background shadow-lg transition hover:opacity-90 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />

            {downloading
              ? "Preparing..."
              : "Download"}
          </button>

          {downloadOpen && (
            <div className="absolute bottom-full mb-2 w-48 overflow-hidden rounded-2xl border bg-background p-1 shadow-xl">
              <button
                type="button"
                onClick={() =>
                  void handleDownload("jpeg")
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-muted"
              >
                <FileImage className="h-4 w-4" />

                <span>
                  <span className="block font-medium">
                    JPEG
                  </span>

                  <span className="text-xs text-muted-foreground">
                    Image format
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleDownload("pdf")
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm hover:bg-muted"
              >
                <FileText className="h-4 w-4" />

                <span>
                  <span className="block font-medium">
                    PDF
                  </span>

                  <span className="text-xs text-muted-foreground">
                    Document format
                  </span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}