import React, { useState } from 'react';
import { Play, Trash2, Edit2, Check, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Highlight, HighlightType } from '@/types';
import { formatTime, getHighlightBadgeClass } from '@/lib/mockData';

interface HighlightCardProps {
  highlight: Highlight;
  index: number;
  onPreview: (highlight: Highlight) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onUpdateLabel: (id: string, label: HighlightType) => void;
  onUpdateTimes: (id: string, start: number, end: number) => void;
  onDelete: (id: string) => void;
  isActive?: boolean;
}

export const HighlightCard: React.FC<HighlightCardProps> = ({
  highlight,
  index,
  onPreview,
  onToggle,
  onUpdateLabel,
  onUpdateTimes,
  onDelete,
  isActive = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editStart, setEditStart] = useState(highlight.start.toString());
  const [editEnd, setEditEnd] = useState(highlight.end.toString());

  const handleSaveEdit = () => {
    const start = parseFloat(editStart);
    const end = parseFloat(editEnd);
    if (!isNaN(start) && !isNaN(end) && start < end && start >= 0) {
      onUpdateTimes(highlight.id, start, end);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditStart(highlight.start.toString());
    setEditEnd(highlight.end.toString());
    setIsEditing(false);
  };

  const confidencePercent = Math.round(highlight.confidence * 100);

  return (
    <div
      className={`highlight-card p-4 animate-fade-in ${
        isActive ? 'ring-2 ring-primary shadow-lg' : ''
      } ${!highlight.enabled ? 'opacity-50' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div className="flex items-center pt-1 text-muted-foreground/50 cursor-grab">
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Highlight number and preview */}
        <div className="flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="w-12 h-12 rounded-lg relative overflow-hidden group glow-button"
            onClick={() => onPreview(highlight)}
            disabled={!highlight.enabled}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
            <Play className="h-5 w-5 relative z-10 group-hover:scale-110 transition-transform" />
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-1">#{index + 1}</p>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {/* Label badge/selector */}
            <Select
              value={highlight.label}
              onValueChange={(value) => onUpdateLabel(highlight.id, value as HighlightType)}
              disabled={!highlight.enabled}
            >
              <SelectTrigger className={`w-auto h-6 px-2 text-xs font-medium border-0 ${getHighlightBadgeClass(highlight.label)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goal">Goal</SelectItem>
                <SelectItem value="foul">Foul</SelectItem>
                <SelectItem value="penalty">Penalty</SelectItem>
                <SelectItem value="crowd">Crowd</SelectItem>
              </SelectContent>
            </Select>

            {/* Confidence */}
            <span className="text-xs text-muted-foreground">
              {confidencePercent}% confidence
            </span>
          </div>

          {/* Timestamps */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={editStart}
                onChange={(e) => setEditStart(e.target.value)}
                className="w-20 h-7 text-xs"
                placeholder="Start"
              />
              <span className="text-muted-foreground">→</span>
              <Input
                type="number"
                value={editEnd}
                onChange={(e) => setEditEnd(e.target.value)}
                className="w-20 h-7 text-xs"
                placeholder="End"
              />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSaveEdit}>
                <Check className="h-3 w-3 text-success" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancelEdit}>
                <X className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted/50 px-2 py-0.5 rounded font-mono">
                {formatTime(highlight.start)} → {formatTime(highlight.end)}
              </code>
              <span className="text-xs text-muted-foreground">
                ({Math.round(highlight.end - highlight.start)}s)
              </span>
            </div>
          )}

          {/* Confidence bar */}
          <div className="mt-2">
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditing(!isEditing)}
            disabled={!highlight.enabled}
          >
            <Edit2 className="h-4 w-4" />
          </Button>

          <Switch
            checked={highlight.enabled}
            onCheckedChange={(checked) => onToggle(highlight.id, checked)}
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(highlight.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HighlightCard;
