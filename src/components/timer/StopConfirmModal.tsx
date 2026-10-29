'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface StopConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirmStop: () => void;
}

export const StopConfirmModal: React.FC<StopConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirmStop,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="stop-session-title"
      aria-describedby="stop-session-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-card border border-brand-border text-center">
        <div className="w-12 h-12 rounded-full bg-brand-rose-soft text-brand-rose mx-auto mb-4 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h3 id="stop-session-title" className="text-lg font-bold text-brand-navy mb-2">
          End session early?
        </h3>

        <p id="stop-session-desc" className="text-sm text-brand-muted leading-relaxed mb-6">
          Stopping now will reset the timer. This partial session won&apos;t be recorded in your completed study history. No worries at all—you can start fresh whenever you&apos;re ready.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 text-sm font-semibold text-brand-navy bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Keep Going
          </button>
          <button
            type="button"
            onClick={onConfirmStop}
            className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-brand-rose hover:bg-rose-700 rounded-xl shadow-subtle transition-colors"
          >
            Yes, End Now
          </button>
        </div>
      </div>
    </div>
  );
};
