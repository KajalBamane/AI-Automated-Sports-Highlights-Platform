// Core types for the AI Football Highlights Platform

export interface Highlight {
  id: string;
  start: number; // Start timestamp in seconds
  end: number; // End timestamp in seconds
  label: HighlightType;
  confidence: number; // 0-1
  enabled: boolean;
  thumbnail?: string;
}

export type HighlightType = 'goal' | 'foul' | 'penalty' | 'crowd';

export interface VideoMetadata {
  duration: number;
  sport: 'football';
  filename: string;
  path: string;
}

export interface DetectionProgress {
  stage: 'idle' | 'analyzing' | 'detecting' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
}

export interface ExportProgress {
  stage: 'idle' | 'processing' | 'stitching' | 'complete' | 'error';
  progress: number;
  message: string;
  clips?: ExportedClip[];
}

export interface ExportedClip {
  id: string;
  highlightId: string;
  label: HighlightType;
  filename: string;
  url: string;
  start: number;
  end: number;
}

// API Response types
export interface DetectResponse {
  success: boolean;
  highlights: Highlight[];
  metadata: VideoMetadata;
}

export interface ExportResponse {
  success: boolean;
  clips: ExportedClip[];
  reelUrl?: string;
}
