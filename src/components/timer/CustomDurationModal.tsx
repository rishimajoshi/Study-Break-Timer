'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Clock } from 'lucide-react';

interface CustomDurationModalProps {
  isOpen: boolean;
  totalDurationSeconds: number;
  onClose: () => void;
  onApply: (hours: number, minutes: number, seconds: number) => void;
}

export const CustomDurationModal: React.FC<CustomDurationModalProps> = ({
  isOpen,
  totalDurationSeconds,
  onClose,
  onApply,
}) => {
  const initialHours = Math.floor(totalDurationSeconds / 3600);
  const initialMinutes = Math.floor((totalDurationSeconds % 3600) / 60);
  const initialSeconds = totalDurationSeconds % 60;

  const [hours, setHours] = useState<number>(initialHours);
  const [minutes, setMinutes] = useState<number>(initialMinutes);
  const [seconds, setSeconds] = useState<number>(initialSeconds);

  // Sync state when opened
  useEffect(() => {
    if (isOpen) {
      setHours(Math.floor(totalDurationSeconds / 3600));
      setMinutes(Math.floor((totalDurationSeconds % 3600) / 60));
      setSeconds(totalDurationSeconds % 60);
    }
  }, [isOpen, totalDurationSeconds]);

  if (!isOpen) return null;

  const totalCalculatedSeconds = hours * 3600 + minutes * 60 + seconds;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalCalculatedSeconds >= 5) {
      onApply(hours, minutes, seconds);
      onClose();
    }
  };

  const setPresetQuick = (h: number, m: number, s: number) => {
    setHours(h);
    setMinutes(m);
    setSeconds(s);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-timer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-card border border-brand-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-blue-soft text-brand-blue flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 id="custom-timer-title" className="text-base font-bold text-brand-navy">
              Custom Duration
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-brand-muted hover:text-brand-navy rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p className="text-xs text-brand-muted mb-4">
            Set your exact target using hours, minutes, and seconds:
          </p>

          {/* HH : MM : SS Inputs */}
          <div className="flex items-center justify-center gap-2 mb-4 bg-brand-bg p-4 rounded-2xl border border-brand-border/70">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <input
                id="hours-input"
                type="number"
                min="0"
                max="12"
                value={hours}
                onChange={(e) => setHours(Math.max(0, Math.min(12, parseInt(e.target.value) || 0)))}
                className="w-16 text-center text-2xl font-bold font-mono py-2 bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <label htmlFor="hours-input" className="text-[10px] uppercase font-semibold text-brand-muted mt-1">
                Hours
              </label>
            </div>

            <span className="text-2xl font-bold text-brand-muted mb-4">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <input
                id="minutes-input"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-16 text-center text-2xl font-bold font-mono py-2 bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <label htmlFor="minutes-input" className="text-[10px] uppercase font-semibold text-brand-muted mt-1">
                Mins
              </label>
            </div>

            <span className="text-2xl font-bold text-brand-muted mb-4">:</span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <input
                id="seconds-input"
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                className="w-16 text-center text-2xl font-bold font-mono py-2 bg-white border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
              <label htmlFor="seconds-input" className="text-[10px] uppercase font-semibold text-brand-muted mt-1">
                Secs
              </label>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="mb-5">
            <span className="text-[10px] uppercase font-semibold text-brand-muted tracking-wider block mb-1.5">
              Quick Shortcuts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPresetQuick(0, 0, 30)}
                className="py-1 px-2.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-brand-navy font-medium"
              >
                30s
              </button>
              <button
                type="button"
                onClick={() => setPresetQuick(0, 5, 0)}
                className="py-1 px-2.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-brand-navy font-medium"
              >
                5m
              </button>
              <button
                type="button"
                onClick={() => setPresetQuick(0, 50, 0)}
                className="py-1 px-2.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-brand-navy font-medium"
              >
                50m
              </button>
              <button
                type="button"
                onClick={() => setPresetQuick(1, 0, 0)}
                className="py-1 px-2.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-brand-navy font-medium"
              >
                1h 00m
              </button>
              <button
                type="button"
                onClick={() => setPresetQuick(1, 30, 0)}
                className="py-1 px-2.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-brand-navy font-medium"
              >
                1h 30m
              </button>
              <button
                type="button"
                onClick={() => setPresetQuick(2, 0, 0)}
                className="py-1 px-2.5 rounded-lg text-xs bg-slate-100 hover:bg-slate-200 text-brand-navy font-medium"
              >
                2h 00m
              </button>
            </div>
          </div>

          {totalCalculatedSeconds < 5 && (
            <p className="text-xs text-brand-rose mb-3 text-center">
              Please enter at least 5 seconds.
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 text-sm font-semibold text-brand-muted hover:text-brand-navy rounded-xl border border-brand-border hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={totalCalculatedSeconds < 5}
              className="flex-1 py-2.5 px-3 text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover rounded-xl shadow-subtle flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Set Timer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
