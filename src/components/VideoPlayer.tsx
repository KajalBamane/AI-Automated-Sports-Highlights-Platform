import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatTime } from '@/lib/mockData';
import { Highlight } from '@/types';

interface VideoPlayerProps {
  src: string;
  highlights?: Highlight[];
  activeHighlight?: Highlight | null;
  onTimeUpdate?: (time: number) => void;
  onDurationChange?: (duration: number) => void;
  onHighlightClick?: (highlight: Highlight) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  highlights = [],
  activeHighlight,
  onTimeUpdate,
  onDurationChange,
  onHighlightClick,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle active highlight playback - seeks and plays only the highlight portion
  useEffect(() => {
    if (activeHighlight && videoRef.current) {
      const video = videoRef.current;
      video.currentTime = activeHighlight.start;
      video.play();
      setIsPlaying(true);
    }
  }, [activeHighlight]);

  // Monitor playback to stop at highlight end
  useEffect(() => {
    if (!activeHighlight || !videoRef.current) return;

    const video = videoRef.current;
    const checkTime = () => {
      if (video.currentTime >= activeHighlight.end) {
        video.pause();
        setIsPlaying(false);
        video.currentTime = activeHighlight.start;
      }
    };

    video.addEventListener('timeupdate', checkTime);
    return () => video.removeEventListener('timeupdate', checkTime);
  }, [activeHighlight]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      onDurationChange?.(dur);
    }
  }, [onDurationChange]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const vol = value[0];
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const skipBack = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
    }
  };

  // Calculate highlight positions on timeline
  const getHighlightPosition = (highlight: Highlight) => {
    if (duration === 0) return { left: '0%', width: '0%' };
    const left = (highlight.start / duration) * 100;
    const width = ((highlight.end - highlight.start) / duration) * 100;
    return { left: `${left}%`, width: `${Math.max(width, 0.5)}%` };
  };

  const getHighlightBgColor = (label: string) => {
    switch (label) {
      case 'goal': return 'bg-highlight-goal';
      case 'foul': return 'bg-highlight-foul';
      case 'penalty': return 'bg-highlight-penalty';
      case 'crowd': return 'bg-highlight-crowd';
      default: return 'bg-primary';
    }
  };

  return (
    <div ref={containerRef} className="video-container group">
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video bg-black"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {/* Timeline with highlights */}
        <div className="relative mb-3">
          {/* Highlight markers on timeline */}
          <div className="absolute inset-0 h-1.5 pointer-events-none z-10">
            {highlights.filter(h => h.enabled).map((highlight) => {
              const pos = getHighlightPosition(highlight);
              return (
                <div
                  key={highlight.id}
                  className={`absolute h-full rounded-full cursor-pointer opacity-70 hover:opacity-100 transition-opacity ${getHighlightBgColor(highlight.label)}`}
                  style={{ left: pos.left, width: pos.width }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onHighlightClick?.(highlight);
                  }}
                  title={`${highlight.label}: ${formatTime(highlight.start)} - ${formatTime(highlight.end)}`}
                />
              );
            })}
          </div>
          
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="relative z-20"
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={skipBack}
              className="text-foreground hover:bg-foreground/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-foreground hover:bg-foreground/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={skipForward}
              className="text-foreground hover:bg-foreground/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            <span className="text-sm text-foreground/80 ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-foreground hover:bg-foreground/20"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-foreground hover:bg-foreground/20"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Play button overlay when paused */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center animate-pulse-glow">
            <Play className="h-8 w-8 text-primary-foreground ml-1" />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
