import React from 'react';
import { Highlight } from '@/types';
import { formatTime } from '@/lib/mockData';

interface TimelineProps {
  duration: number;
  currentTime: number;
  highlights: Highlight[];
  onHighlightClick: (highlight: Highlight) => void;
  onSeek: (time: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  highlights,
  onHighlightClick,
  onSeek,
}) => {
  const getPosition = (time: number) => {
    if (duration === 0) return 0;
    return (time / duration) * 100;
  };

  const getHighlightColor = (label: string) => {
    switch (label) {
      case 'goal': return 'bg-highlight-goal';
      case 'foul': return 'bg-highlight-foul';
      case 'penalty': return 'bg-highlight-penalty';
      case 'crowd': return 'bg-highlight-crowd';
      default: return 'bg-primary';
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const time = percentage * duration;
    onSeek(Math.max(0, Math.min(duration, time)));
  };

  // Generate time markers
  const timeMarkers = [];
  const interval = duration > 300 ? 60 : 30; // 1 min or 30 sec intervals
  for (let t = 0; t <= duration; t += interval) {
    timeMarkers.push(t);
  }

  return (
    <div className="editor-panel">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-foreground">Timeline</h3>
        <span className="text-xs text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Timeline track */}
      <div
        className="relative h-16 bg-[hsl(var(--timeline-bg))] rounded-lg overflow-hidden cursor-pointer"
        onClick={handleTimelineClick}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 flex">
          {timeMarkers.map((t) => (
            <div
              key={t}
              className="absolute h-full border-l border-border/30"
              style={{ left: `${getPosition(t)}%` }}
            >
              <span className="absolute bottom-1 left-1 text-[10px] text-muted-foreground/60">
                {formatTime(t)}
              </span>
            </div>
          ))}
        </div>

        {/* Highlight blocks */}
        <div className="absolute inset-x-0 top-2 bottom-8">
          {highlights.filter(h => h.enabled).map((highlight, idx) => {
            const left = getPosition(highlight.start);
            const width = getPosition(highlight.end) - left;
            
            return (
              <div
                key={highlight.id}
                className={`absolute h-full rounded cursor-pointer transition-all hover:brightness-110 ${getHighlightColor(highlight.label)}`}
                style={{
                  left: `${left}%`,
                  width: `${Math.max(width, 1)}%`,
                  opacity: 0.8,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onHighlightClick(highlight);
                }}
                title={`${highlight.label}: ${formatTime(highlight.start)} - ${formatTime(highlight.end)}`}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-foreground truncate px-1">
                  {width > 3 && highlight.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Playhead */}
        <div
          className="timeline-marker z-20"
          style={{ left: `${getPosition(currentTime)}%` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-highlight-goal" />
          <span className="text-xs text-muted-foreground">Goal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-highlight-foul" />
          <span className="text-xs text-muted-foreground">Foul</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-highlight-penalty" />
          <span className="text-xs text-muted-foreground">Penalty</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-highlight-crowd" />
          <span className="text-xs text-muted-foreground">Crowd</span>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
