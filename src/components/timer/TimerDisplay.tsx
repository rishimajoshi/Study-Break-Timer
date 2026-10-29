'use client';

import React from 'react';
import { TimerPhase, TimerStatus } from '@/types';

interface TimerDisplayProps {
  remainingSeconds: number;
  totalDurationSeconds: number;
  progressPercent: number;
  phase: TimerPhase;
  status: TimerStatus;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  remainingSeconds,
  totalDurationSeconds,
  progressPercent,
  phase,
  status,
}) => {
  const safeRemaining = Math.max(0, Math.floor(remainingSeconds || 0));
  const hours = Math.floor(safeRemaining / 3600);
  const minutes = Math.floor((safeRemaining % 3600) / 60);
  const seconds = safeRemaining % 60;

  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  const hasHours = hours > 0 || totalDurationSeconds >= 3600;
  const timeDisplay = hasHours
    ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
    : `${formattedMinutes}:${formattedSeconds}`;

  // SVG circular dimensions
  const size = 260;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Guard against NaN or out-of-range percentage
  const validPercent = Number.isFinite(progressPercent)
    ? Math.min(100, Math.max(0, progressPercent))
    : 0;
  const strokeDashoffset = circumference - (validPercent / 100) * circumference;

  const isBreak = phase === 'break';
  const primaryColor = isBreak ? '#0D9488' : '#2878E8'; // brand teal or brand blue
  const softColor = isBreak ? '#E6F6F4' : '#EAF2FD';

  return (
    <div className="flex flex-col items-center justify-center my-6">
      {/* Accessible phase label */}
      <div className="mb-2">
        <span
          className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${
            isBreak
              ? 'bg-brand-teal-soft text-brand-teal'
              : 'bg-brand-blue-soft text-brand-blue'
          }`}
        >
          {phase === 'focus' ? 'Focus Session' : 'Restorative Break'}
        </span>
      </div>

      {/* Circular Progress & Digital Countdown Display */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 drop-shadow-sm"
          aria-hidden="true"
        >
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={softColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated active progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-[stroke-dashoffset] duration-300 ease-linear"
          />
        </svg>

        {/* Center Countdown Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none px-4">
          <time
            dateTime={`PT${hours}H${minutes}M${seconds}S`}
            className={`font-black tracking-tight text-brand-navy font-mono ${
              hasHours ? 'text-4xl sm:text-5xl' : 'text-6xl'
            }`}
            aria-label={`${hours > 0 ? `${hours} hours, ` : ''}${minutes} minutes, and ${seconds} seconds remaining`}
          >
            {timeDisplay}
          </time>

          <span className="text-xs text-brand-muted font-medium mt-1 uppercase tracking-widest">
            {status === 'running'
              ? 'In progress'
              : status === 'paused'
              ? 'Paused'
              : status === 'completed'
              ? 'Finished'
              : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};
