import { Highlight, VideoMetadata } from '@/types';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock AI-detected highlights for the demo video
// These represent realistic timestamps for a football match
export const mockHighlights: Highlight[] = [
  {
    id: generateId(),
    start: 12,
    end: 22,
    label: 'goal',
    confidence: 0.95,
    enabled: true,
  },
  {
    id: generateId(),
    start: 45,
    end: 52,
    label: 'foul',
    confidence: 0.82,
    enabled: true,
  },
  {
    id: generateId(),
    start: 78,
    end: 92,
    label: 'penalty',
    confidence: 0.91,
    enabled: true,
  },
  {
    id: generateId(),
    start: 120,
    end: 128,
    label: 'crowd',
    confidence: 0.76,
    enabled: true,
  },
  {
    id: generateId(),
    start: 156,
    end: 168,
    label: 'goal',
    confidence: 0.98,
    enabled: true,
  },
  {
    id: generateId(),
    start: 210,
    end: 218,
    label: 'foul',
    confidence: 0.72,
    enabled: true,
  },
];

export const mockVideoMetadata: VideoMetadata = {
  duration: 300, // 5 minutes demo
  sport: 'football',
  filename: 'FootballMatch_Demo.mp4',
  path: '/sample-videos/FootballMatch_Demo.mp4',
};

// Format seconds to MM:SS display
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Get color class for highlight type
export const getHighlightColor = (type: string): string => {
  switch (type) {
    case 'goal':
      return 'highlight-goal';
    case 'foul':
      return 'highlight-foul';
    case 'penalty':
      return 'highlight-penalty';
    case 'crowd':
      return 'highlight-crowd';
    default:
      return 'highlight-goal';
  }
};

// Get badge class for highlight type
export const getHighlightBadgeClass = (type: string): string => {
  switch (type) {
    case 'goal':
      return 'status-badge-goal';
    case 'foul':
      return 'status-badge-foul';
    case 'penalty':
      return 'status-badge-penalty';
    case 'crowd':
      return 'status-badge-crowd';
    default:
      return 'status-badge-goal';
  }
};

// Simulate AI detection with progressive updates
export const simulateAIDetection = (
  onProgress: (progress: number, stage: string) => void,
  onComplete: (highlights: Highlight[]) => void
): (() => void) => {
  let cancelled = false;
  
  const stages = [
    { progress: 10, message: 'Loading video frames...' },
    { progress: 25, message: 'Analyzing motion patterns...' },
    { progress: 40, message: 'Detecting key events...' },
    { progress: 55, message: 'Identifying goals and fouls...' },
    { progress: 70, message: 'Processing crowd reactions...' },
    { progress: 85, message: 'Calculating confidence scores...' },
    { progress: 95, message: 'Finalizing highlights...' },
    { progress: 100, message: 'Detection complete!' },
  ];

  let currentStage = 0;

  const runStage = () => {
    if (cancelled || currentStage >= stages.length) {
      if (!cancelled) {
        onComplete(mockHighlights);
      }
      return;
    }

    const stage = stages[currentStage];
    onProgress(stage.progress, stage.message);
    currentStage++;

    setTimeout(runStage, 400 + Math.random() * 300);
  };

  setTimeout(runStage, 500);

  return () => {
    cancelled = true;
  };
};
