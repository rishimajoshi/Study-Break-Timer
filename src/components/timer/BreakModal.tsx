'use client';

import React, { useState } from 'react';
import { Sparkles, Coffee, ArrowRight, X, Heart, Droplets, Eye, Wind, Footprints } from 'lucide-react';
import { TimerPhase } from '@/types';
import { BreakActivity } from '@/lib/break-suggestions';

interface BreakModalProps {
  isOpen: boolean;
  phase: TimerPhase;
  taskTitle?: string;
  breakSuggestion: BreakActivity | null;
  defaultBreakMinutes: number;
  onStartBreak: (breakMinutes: number) => void;
  onSkipBreak: () => void;
  onClose: () => void;
}

export const BreakModal: React.FC<BreakModalProps> = ({
  isOpen,
  phase,
  taskTitle,
  breakSuggestion,
  defaultBreakMinutes,
  onStartBreak,
  onSkipBreak,
  onClose,
}) => {
  const [selectedBreakMinutes, setSelectedBreakMinutes] = useState<number>(defaultBreakMinutes);

  if (!isOpen) return null;

  const isFocusFinished = phase === 'focus';

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case 'water':
        return <Droplets className="w-6 h-6 text-sky-500" />;
      case 'eye':
        return <Eye className="w-6 h-6 text-indigo-500" />;
      case 'breath':
        return <Wind className="w-6 h-6 text-teal-500" />;
      case 'walk':
        return <Footprints className="w-6 h-6 text-emerald-500" />;
      default:
        return <Heart className="w-6 h-6 text-rose-500" />;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-card border border-brand-border text-center relative overflow-hidden">
        {/* Subtle top decorative ribbon */}
        <div
          className={`absolute top-0 left-0 right-0 h-2 ${
            isFocusFinished ? 'bg-brand-blue' : 'bg-brand-teal'
          }`}
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-brand-muted hover:text-brand-navy rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        {isFocusFinished ? (
          <>
            {/* Focus finished celebration */}
            <div className="w-14 h-14 rounded-2xl bg-brand-blue-soft text-brand-blue mx-auto mb-4 flex items-center justify-center shadow-subtle">
              <Sparkles className="w-7 h-7" />
            </div>

            <h3 id="completion-modal-title" className="text-xl font-bold text-brand-navy mb-1">
              Focus Session Complete!
            </h3>

            <p className="text-xs text-brand-muted mb-4">
              {taskTitle
                ? `Saved: "${taskTitle}" to your completed profile.`
                : 'Session logged to your completed study history.'}
            </p>

            {/* Restorative Break Suggestion Card */}
            {breakSuggestion && (
              <div className="bg-slate-50 border border-brand-border/70 rounded-2xl p-4 text-left mb-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-xs shrink-0">
                    {renderIcon(breakSuggestion.iconName)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-navy mb-0.5">
                      {breakSuggestion.title}
                    </h4>
                    <p className="text-xs text-brand-muted leading-relaxed">
                      {breakSuggestion.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Break Duration Selector */}
            <div className="mb-5">
              <span className="block text-[11px] font-semibold text-brand-muted uppercase tracking-wider mb-2">
                Choose Break Length
              </span>
              <div className="flex items-center justify-center gap-2">
                {[3, 5, 10, 15].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedBreakMinutes(m)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      selectedBreakMinutes === m
                        ? 'bg-brand-teal text-white border-brand-teal shadow-xs'
                        : 'bg-white text-brand-navy border-brand-border hover:bg-slate-50'
                    }`}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onStartBreak(selectedBreakMinutes)}
                className="w-full py-3 px-4 bg-brand-teal hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-subtle flex items-center justify-center gap-2 transition-colors"
              >
                <Coffee className="w-4 h-4" />
                <span>Start {selectedBreakMinutes} Min Break</span>
              </button>

              <button
                type="button"
                onClick={onSkipBreak}
                className="w-full py-2.5 px-4 text-xs font-semibold text-brand-muted hover:text-brand-navy transition-colors"
              >
                Skip break & continue studying
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Break finished */}
            <div className="w-14 h-14 rounded-2xl bg-brand-teal-soft text-brand-teal mx-auto mb-4 flex items-center justify-center shadow-subtle">
              <Coffee className="w-7 h-7" />
            </div>

            <h3 id="completion-modal-title" className="text-xl font-bold text-brand-navy mb-2">
              Break Time Over!
            </h3>

            <p className="text-sm text-brand-muted leading-relaxed mb-6">
              Feeling rested and recharged? Ready to dive into your next focus interval whenever you are.
            </p>

            <button
              type="button"
              onClick={onSkipBreak}
              className="w-full py-3 px-4 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-sm rounded-xl shadow-subtle flex items-center justify-center gap-2 transition-colors"
            >
              <span>Begin Next Focus Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
