'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface CustomDurationModalProps {
  isOpen: boolean;
  currentMinutes: number;
  onClose: () => void;
  onApply: (minutes: number) => void;
}

export const CustomDurationModal: React.FC<CustomDurationModalProps> = ({
  isOpen,
  currentMinutes,
  onClose,
  onApply,
}) => {
  const [minutes, setMinutes] = useState<number>(currentMinutes);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes >= 1 && minutes <= 180) {
      onApply(minutes);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="custom-timer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-card border border-brand-border">
        <div className="flex items-center justify-between mb-4">
          <h3 id="custom-timer-title" className="text-base font-bold text-brand-navy">
            Custom Study Duration
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-brand-muted hover:text-brand-navy rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="custom-minutes-input" className="block text-xs text-brand-muted mb-2">
            Enter duration in minutes (1 – 180)
          </label>
          <div className="flex items-center gap-2 mb-5">
            <input
              id="custom-minutes-input"
              type="number"
              min="1"
              max="180"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full text-2xl font-bold font-mono text-center py-2 px-3 border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue"
              autoFocus
            />
            <span className="text-sm font-semibold text-brand-muted">mins</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-3 text-sm font-semibold text-brand-muted hover:text-brand-navy rounded-xl border border-brand-border hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-3 text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover rounded-xl shadow-subtle flex items-center justify-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              Set Duration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
