import React, { useState } from "react";
import {
  Download,
  Film,
  FileVideo,
  Loader2,
  CheckCircle2,
  Package,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Timeline } from "@/components/Timeline";
import { Highlight, VideoMetadata, ExportProgress } from "@/types";
import { mockVideoMetadata } from "@/lib/mockData";
import { exportHighlights, downloadFile, ExportResult } from "@/lib/api";

interface ReviewPageProps {
  video: VideoMetadata;
  highlights: Highlight[];
}

const ReviewPage: React.FC<ReviewPageProps> = ({ video, highlights }) => {
  const [exportAll, setExportAll] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);

  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    stage: "idle",
    progress: 0,
    message: "",
  });
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  const enabledHighlights = highlights.filter((h) => h.enabled);
  const isUsingMockVideo = video.filename === mockVideoMetadata.filename;

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleHighlightClick = (highlight: Highlight) => {
    setCurrentTime(highlight.start);
  };

  const handleExport = async () => {
    const toExport = exportAll
      ? enabledHighlights
      : enabledHighlights.slice(0, 1);

    setExportProgress({
      stage: "processing",
      progress: 10,
      message: "Preparing clips...",
    });
    setExportResult(null);

    // DEMO MODE
    if (isUsingMockVideo) {
      for (let i = 0; i < toExport.length; i++) {
        await new Promise((r) => setTimeout(r, 400));
        setExportProgress({
          stage: "processing",
          progress: ((i + 1) / toExport.length) * 80,
          message: `Processing ${toExport[i].label}...`,
        });
      }

      setExportProgress({
        stage: "complete",
        progress: 100,
        message: "Demo export complete",
      });
      return;
    }

    // REAL BACKEND
    try {
      const result = await exportHighlights(
        video.filename,
        toExport.map((h) => ({
          id: h.id,
          start: h.start,
          end: h.end,
          label: h.label,
        })),
      );

      setExportResult(result);
      setExportProgress({
        stage: "complete",
        progress: 100,
        message: "Export complete",
      });
    } catch (error) {
      setExportProgress({
        stage: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "Export failed",
      });
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Package className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">Review & Export</h2>
      </div>

      {/* Timeline ✅ FIXED */}
      <Timeline
        duration={video.duration}
        currentTime={currentTime}
        highlights={highlights}
        onSeek={handleSeek}
        onHighlightClick={handleHighlightClick}
      />

      {/* Export options */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Export all highlights</p>
          <p className="text-xs text-muted-foreground">
            Otherwise only the first clip is exported
          </p>
        </div>
        <Switch checked={exportAll} onCheckedChange={setExportAll} />
      </div>

      {/* Export button */}
      {exportProgress.stage === "idle" && (
        <Button onClick={handleExport}>
          <Film className="h-4 w-4 mr-2" />
          Export Highlights
        </Button>
      )}

      {/* Progress */}
      {exportProgress.stage !== "idle" && (
        <div
          className={`rounded-lg p-4 ${
            exportProgress.stage === "complete"
              ? "bg-success/10"
              : exportProgress.stage === "error"
                ? "bg-destructive/10"
                : "bg-muted/30"
          }`}
        >
          <div className="flex items-center gap-2">
            {exportProgress.stage === "processing" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {exportProgress.stage === "complete" && (
              <CheckCircle2 className="h-4 w-4 text-success" />
            )}
            {exportProgress.stage === "error" && (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
            <p className="text-sm">{exportProgress.message}</p>
          </div>
        </div>
      )}

      {/* Downloads */}
      {exportProgress.stage === "complete" && exportResult && (
        <div className="flex flex-wrap gap-2">
          {exportResult.clips.map((clip) => (
            <Button
              key={clip.id}
              size="sm"
              variant="outline"
              onClick={() => downloadFile(clip.downloadUrl, clip.filename)}
            >
              <FileVideo className="h-3 w-3 mr-1" />
              {clip.label}
            </Button>
          ))}

          {exportResult.reel && (
            <Button
              size="sm"
              onClick={() =>
                downloadFile(
                  exportResult.reel.downloadUrl,
                  exportResult.reel.filename,
                )
              }
            >
              <Download className="h-3 w-3 mr-1" />
              Full Reel
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewPage;
