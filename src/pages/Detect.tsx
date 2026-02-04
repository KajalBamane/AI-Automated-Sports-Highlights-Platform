import React, { useState } from "react";
import {
  Cpu,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { VideoMetadata, Highlight, DetectionProgress } from "@/types";
import {
  simulateAIDetection,
  formatTime,
  mockVideoMetadata,
} from "@/lib/mockData";
import { detectHighlights as detectHighlightsAPI } from "@/lib/api";

interface DetectPageProps {
  video: VideoMetadata;
  existingHighlights: Highlight[];
  onDetectionComplete: (highlights: Highlight[]) => void;
}

const DetectPage: React.FC<DetectPageProps> = ({
  video,
  existingHighlights,
  onDetectionComplete,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [progress, setProgress] = useState<DetectionProgress>({
    stage: "idle",
    progress: 0,
    message: "",
  });

  const isUsingMockVideo = video.filename === mockVideoMetadata.filename;

  const startDetection = async () => {
    setIsDetecting(true);
    setProgress({
      stage: "analyzing",
      progress: 0,
      message: "Starting analysis...",
    });

    // ✅ DEMO / MOCK MODE
    if (isUsingMockVideo) {
      simulateAIDetection(
        (prog, message) => {
          setProgress({
            stage: prog < 100 ? "detecting" : "complete",
            progress: prog,
            message,
          });
        },
        (highlights) => {
          setProgress({
            stage: "complete",
            progress: 100,
            message: "Detection complete!",
          });
          setIsDetecting(false);
          onDetectionComplete(highlights);
        },
      );
      return;
    }

    // ✅ REAL BACKEND MODE
    try {
      const progressStages = [
        { progress: 20, message: "Sending to AI service..." },
        { progress: 40, message: "Analyzing video frames..." },
        { progress: 60, message: "Detecting key events..." },
        { progress: 80, message: "Calculating confidence scores..." },
      ];

      let stageIndex = 0;
      const interval = setInterval(() => {
        if (stageIndex < progressStages.length) {
          setProgress({
            stage: "detecting",
            progress: progressStages[stageIndex].progress,
            message: progressStages[stageIndex].message,
          });
          stageIndex++;
        }
      }, 500);

      const highlights = await detectHighlightsAPI(video.path, video.duration);

      clearInterval(interval);

      setProgress({
        stage: "complete",
        progress: 100,
        message: "Detection complete!",
      });
      setIsDetecting(false);
      onDetectionComplete(highlights);
    } catch (error) {
      setProgress({
        stage: "error",
        progress: 0,
        message: error instanceof Error ? error.message : "Detection failed",
      });
      setIsDetecting(false);
    }
  };

  const hasExistingHighlights = existingHighlights.length > 0;

  return (
    <div className="flex-1 p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Cpu className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold">AI Detection</h2>
      </div>

      {/* Video info */}
      <div className="text-sm text-muted-foreground">
        Analyzing {video.filename} ({formatTime(video.duration)})
        {isUsingMockVideo && (
          <p className="text-xs text-warning mt-1">
            Using mock detection (demo mode)
          </p>
        )}
      </div>

      {/* Progress */}
      {progress.stage !== "idle" && (
        <div className="space-y-3">
          <Progress value={progress.progress} />
          <p className="text-sm">{progress.message}</p>
        </div>
      )}

      {/* Error */}
      {progress.stage === "error" && (
        <div className="bg-destructive/10 rounded-lg p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Detection Failed</p>
            <p className="text-sm text-muted-foreground">{progress.message}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      {progress.stage === "idle" && (
        <Button size="lg" onClick={startDetection}>
          <Sparkles className="h-4 w-4 mr-2" />
          Start Detection
        </Button>
      )}

      {progress.stage === "error" && (
        <Button variant="outline" onClick={startDetection}>
          Try Again
        </Button>
      )}

      {progress.stage === "complete" && hasExistingHighlights && (
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle2 className="h-5 w-5" />
          Highlights detected successfully
        </div>
      )}

      {isDetecting && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
    </div>
  );
};

export default DetectPage;
