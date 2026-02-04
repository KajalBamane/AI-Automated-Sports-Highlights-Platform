import React, { useState, useRef, useEffect } from "react";
import { Upload, Play, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { VideoMetadata } from "@/types";
import { mockVideoMetadata } from "@/lib/mockData";
import { uploadVideo, checkBackendHealth } from "@/lib/api";

interface UploadPageProps {
  selectedVideo: VideoMetadata | null;
  onVideoSelect: (video: VideoMetadata) => void;
}

const UploadPage: React.FC<UploadPageProps> = ({
  selectedVideo,
  onVideoSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(
    null,
  );

  // Check backend health
  useEffect(() => {
    checkBackendHealth().then(setBackendAvailable);
  }, []);

  const handleSelectDemo = () => {
    onVideoSelect(mockVideoMetadata);
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setError("Please select a video file (MP4, MOV, or AVI)");
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const metadata = await uploadVideo(file, setUploadProgress);
      onVideoSelect(metadata);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed. Is the backend running?",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("video/")) return;

    const input = fileInputRef.current;
    if (!input) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {/* Backend warning */}
      {backendAvailable === false && (
        <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-warning" />
          <div>
            <p className="text-sm font-medium text-warning">
              Backend not running
            </p>
            <p className="text-xs text-muted-foreground">
              Run <code>cd backend && node server.js</code>
            </p>
          </div>
        </div>
      )}

      {/* Demo video */}
      <div className="glass-card p-6 mb-6 text-center">
        <h3 className="font-medium">Demo Match Video</h3>
        <p className="text-sm text-muted-foreground mb-3">
          FootballMatch_Demo.mp4 • Mock mode
        </p>

        {selectedVideo?.filename === mockVideoMetadata.filename ? (
          <div className="flex justify-center items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            Selected
          </div>
        ) : (
          <Button onClick={handleSelectDemo} variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Use Demo
          </Button>
        )}
      </div>

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors w-full max-w-md ${
          isUploading
            ? "border-primary/50 bg-primary/5"
            : "border-border/50 hover:border-primary/50"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
            <Progress value={uploadProgress} />
            <p className="text-sm">{uploadProgress}%</p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            <p className="mb-3 text-muted-foreground">
              Drag & drop your match video here
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={backendAvailable === false}
            >
              Browse Files
            </Button>
            <p className="text-xs text-muted-foreground mt-3">MP4, MOV, AVI</p>
          </>
        )}

        {error && (
          <div className="mt-4 text-sm text-destructive flex gap-2 justify-center">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
