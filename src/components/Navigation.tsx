import React from 'react';
import { Upload, Cpu, Film, Download, Zap } from 'lucide-react';

type Step = 'upload' | 'detect' | 'review';

interface NavigationProps {
  currentStep: Step;
  onStepChange: (step: Step) => void;
  hasVideo: boolean;
  hasHighlights: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentStep,
  onStepChange,
  hasVideo,
  hasHighlights,
}) => {
  const steps = [
    {
      id: 'upload' as Step,
      label: 'Select Match',
      icon: Upload,
      enabled: true,
    },
    {
      id: 'detect' as Step,
      label: 'AI Detection',
      icon: Cpu,
      enabled: hasVideo,
    },
    {
      id: 'review' as Step,
      label: 'Review & Export',
      icon: Film,
      enabled: hasHighlights,
    },
  ];

  return (
    <header className="glass-card border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gradient">AI Highlights</h1>
            <p className="text-xs text-muted-foreground">Football Edition</p>
          </div>
        </div>

        {/* Step navigation */}
        <nav className="flex items-center gap-1">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = 
              (step.id === 'upload' && hasVideo) ||
              (step.id === 'detect' && hasHighlights);

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => step.enabled && onStepChange(step.id)}
                  disabled={!step.enabled}
                  className={`nav-link ${isActive ? 'active' : ''} ${
                    !step.enabled ? 'opacity-40 cursor-not-allowed' : ''
                  }`}
                >
                  <div className={`relative ${isCompleted ? 'text-primary' : ''}`}>
                    <Icon className="h-4 w-4" />
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <span className="text-sm">{step.label}</span>
                </button>
                
                {index < steps.length - 1 && (
                  <div className={`w-8 h-px ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            Football ⚽
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
