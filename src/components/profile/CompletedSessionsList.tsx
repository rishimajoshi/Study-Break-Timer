'use client';

import React from 'react';
import { CheckCircle2, Calendar, BookOpen, Clock } from 'lucide-react';
import { StudySession } from '@/types';

interface CompletedSessionsListProps {
  sessions: StudySession[];
  isLoading: boolean;
}

export const CompletedSessionsList: React.FC<CompletedSessionsListProps> = ({
  sessions,
  isLoading,
}) => {
  const completedFocusSessions = sessions.filter(
    (s) => s.status === 'completed' && s.session_type === 'focus'
  );

  const formatSessionDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-card mb-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-navy">
          Completed Sessions
        </h3>
        <span className="text-xs text-brand-muted font-medium">
          {completedFocusSessions.length} total
        </span>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-brand-muted text-xs">
          Loading your session history...
        </div>
      ) : completedFocusSessions.length === 0 ? (
        <div className="py-10 px-4 text-center border-2 border-dashed border-brand-border/80 rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-brand-blue-soft text-brand-blue mx-auto mb-2.5 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-brand-navy mb-1">
            No completed sessions yet
          </p>
          <p className="text-xs text-brand-muted max-w-xs mx-auto leading-relaxed">
            Your completed sessions will appear here once you finish your first focus interval.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {completedFocusSessions.map((session) => {
            const minutes = Math.round(
              (session.actual_duration_seconds || session.planned_duration_seconds) / 60
            );

            return (
              <div
                key={session.id}
                className="p-3.5 rounded-2xl bg-brand-bg border border-brand-border/70 flex items-center justify-between gap-3 transition-colors hover:border-brand-blue/30"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-navy leading-snug">
                      {session.task_title?.trim() || 'Focus Session'}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-brand-muted mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatSessionDate(session.started_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-bold font-mono text-brand-blue bg-white px-2.5 py-1 rounded-lg border border-brand-border shadow-2xs">
                    <Clock className="w-3 h-3" />
                    {minutes}m
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
