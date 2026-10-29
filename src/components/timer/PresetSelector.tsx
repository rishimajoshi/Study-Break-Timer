'use client';

import React from 'react';
import { Sliders } from 'lucide-react';
import { TimerStatus } from '@/types';

interface PresetSelectorProps {
  currentPresetMinutes: number;
  totalDurationSeconds: number;
  status: TimerStatus;
  onSelectPreset: (minutes: number) => void;
  onOpenCustomModal: () => void;
}

const PRESETS = [15, 25, 45, 60];

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  currentPresetMinutes,
  totalDurationSeconds,
  status,
  onSelectPreset,
  onOpenCustomModal,
}) => {
  const isTimerActive = status === 'running' || status === 'paused';
  // Check if current duration matches a standard preset exactly (in seconds)
  const isPresetMatch = PRESETS.some((m) => m * 60 === totalDurationSeconds);
  const isCustom = !isPresetMatch;

  // Format custom button label
  const customHours = Math.floor(totalDurationSeconds / 3600);
  const customMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const customSeconds = totalDurationSeconds % 60;

  let customLabel = 'Custom';
  if (isCustom) {
    if (customHours > 0) {
      customLabel = `${customHours}h ${customMinutes}m`;
    } else if (customSeconds > 0) {
      customLabel = `${customMinutes}m ${customSeconds}s`;
    } else {
      customLabel = `${customMinutes}m`;
    }
  }

  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
          Focus Presets
        </span>
        {isTimerActive && (
          <span className="text-[11px] text-brand-muted italic">
            Locked during active session
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {PRESETS.map((minutes) => {
          const isSelected = totalDurationSeconds === minutes * 60 && !isCustom;
          return (
            <button
              key={minutes}
              type="button"
              disabled={isTimerActive}
              onClick={() => onSelectPreset(minutes)}
              className={`py-2 px-1 rounded-xl border text-sm font-semibold transition-all duration-150 flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-brand-blue text-white border-brand-blue shadow-subtle'
                  : 'bg-white text-brand-navy border-brand-border hover:border-brand-blue/50 hover:bg-brand-blue-soft/30'
              } ${isTimerActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
            >
              <span>{minutes}</span>
              <span className={`text-[10px] font-normal ${isSelected ? 'text-white/80' : 'text-brand-muted'}`}>
                min
              </span>
            </button>
          );
        })}

        {/* Custom duration button */}
        <button
          type="button"
          disabled={isTimerActive}
          onClick={onOpenCustomModal}
          title="Set custom hours, minutes, and seconds"
          className={`py-2 px-1 rounded-xl border text-sm font-semibold transition-all duration-150 flex flex-col items-center justify-center ${
            isCustom
              ? 'bg-brand-blue text-white border-brand-blue shadow-subtle'
              : 'bg-white text-brand-navy border-brand-border hover:border-brand-blue/50 hover:bg-brand-blue-soft/30'
          } ${isTimerActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
        >
          <Sliders className="w-4 h-4 mb-0.5" />
          <span className={`text-[10px] truncate max-w-full px-0.5 font-normal ${isCustom ? 'text-white/90 font-medium' : 'text-brand-muted'}`}>
            {customLabel}
          </span>
        </button>
      </div>
    </div>
  );
};
