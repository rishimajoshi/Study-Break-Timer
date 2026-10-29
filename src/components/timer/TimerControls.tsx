'use client';

import React from 'react';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { TimerPhase, TimerStatus } from '@/types';

interface TimerControlsProps {
  phase: TimerPhase;
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStopClick: () => void; // Opens confirmation modal
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  phase,
  status,
  onStart,
  onPause,
  onResume,
  onStopClick,
}) => {
  const isBreak = phase === 'break';

  if (status === 'idle') {
    return (
      <div className="w-full flex justify-center">
        <button
          type="button"
          onClick={onStart}
          className={`w-full max-w-xs py-3.5 px-6 rounded-2xl text-white font-bold text-base shadow-subtle flex items-center justify-center gap-2 transition-all transform active:scale-98 ${
            isBreak
              ? 'bg-brand-teal hover:bg-teal-700'
              : 'bg-brand-blue hover:bg-brand-blue-hover'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>{isBreak ? 'Start Break' : 'Start Focus Session'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs mx-auto flex items-center justify-center gap-4">
      {status === 'running' ? (
        <button
          type="button"
          onClick={onPause}
          className="flex-1 py-3 px-5 rounded-2xl border-2 border-brand-blue text-brand-blue bg-white hover:bg-brand-blue-soft/50 font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <Pause className="w-4 h-4 fill-current" />
          <span>Pause</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={onResume}
          className="flex-1 py-3 px-5 rounded-2xl bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-subtle active:scale-98"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Resume</span>
        </button>
      )}

      <button
        type="button"
        onClick={onStopClick}
        title="Stop session early"
        className="py-3 px-4 rounded-2xl border border-brand-border text-brand-muted hover:text-brand-rose hover:border-brand-rose/40 hover:bg-brand-rose-soft/20 font-semibold text-sm flex items-center justify-center gap-1.5 transition-all active:scale-98"
      >
        <Square className="w-4 h-4 fill-current text-brand-rose" />
        <span>End</span>
      </button>
    </div>
  );
};
