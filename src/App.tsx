import React, { useState } from "react";
import { Navigation } from "@/components/Navigation";
import UploadPage from "@/pages/Upload";
import DetectPage from "@/pages/Detect";
import ReviewPage from "@/pages/Review";
import { VideoMetadata, Highlight } from "@/types";

type Step = "upload" | "detect" | "review";

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(
    null,
  );
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const handleVideoSelect = (metadata: VideoMetadata) => {
    setSelectedVideo(metadata);
    setCurrentStep("detect");
  };

  const handleDetectionComplete = (detectedHighlights: Highlight[]) => {
    setHighlights(detectedHighlights);
    setCurrentStep("review");
  };

  const handleStepChange = (step: Step) => {
    if (step === "detect" && !selectedVideo) return;
    if (step === "review" && highlights.length === 0) return;
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation
        currentStep={currentStep}
        onStepChange={handleStepChange}
        hasVideo={!!selectedVideo}
        hasHighlights={highlights.length > 0}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {currentStep === "upload" && (
          <UploadPage
            onVideoSelect={handleVideoSelect}
            selectedVideo={selectedVideo}
          />
        )}

        {currentStep === "detect" && selectedVideo && (
          <DetectPage
            video={selectedVideo}
            existingHighlights={highlights}
            onDetectionComplete={handleDetectionComplete}
          />
        )}

        {currentStep === "review" && selectedVideo && (
          <ReviewPage video={selectedVideo} highlights={highlights} />
        )}
      </main>

      <footer className="border-t border-border/50 px-6 py-3 text-center text-xs text-muted-foreground">
        AI Football Highlights Platform • Proof of Concept
      </footer>
    </div>
  );
};

export default App;
