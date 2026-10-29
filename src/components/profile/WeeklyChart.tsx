'use client';

import React from 'react';
import { Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { ProgressSummaryData } from '@/types';

interface WeeklyChartProps {
  summary: ProgressSummaryData;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ summary }) => {
  const { totalCompletedSessions, totalCompletedMinutes, weeklyDays } = summary;

  const hours = Math.floor(totalCompletedMinutes / 60);
  const minutes = totalCompletedMinutes % 60;
  const formattedTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Determine max minutes for chart scaling (minimum 30m for empty chart)
  const maxDayMinutes = Math.max(30, ...weeklyDays.map((d) => d.totalMinutes));

  return (
    <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-brand-blue" />
          Weekly Progress
        </h3>
        <span className="text-xs text-brand-muted font-medium">This Week</span>
      </div>

      {/* High-level stats summary badges */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-brand-bg rounded-2xl p-3 border border-brand-border/60">
          <div className="flex items-center gap-2 text-brand-muted text-xs mb-1">
            <CheckCircle2 className="w-4 h-4 text-brand-teal" />
            <span>Completed Sessions</span>
          </div>
          <p className="text-2xl font-black text-brand-navy font-mono">
            {totalCompletedSessions}
          </p>
        </div>

        <div className="bg-brand-bg rounded-2xl p-3 border border-brand-border/60">
          <div className="flex items-center gap-2 text-brand-muted text-xs mb-1">
            <Clock className="w-4 h-4 text-brand-blue" />
            <span>Total Focus Time</span>
          </div>
          <p className="text-2xl font-black text-brand-navy font-mono">
            {formattedTime}
          </p>
        </div>
      </div>

      {/* Weekly Bar Chart */}
      <div className="pt-2">
        <div className="flex items-end justify-between gap-2 h-36 border-b border-brand-border/80 pb-2">
          {weeklyDays.map((day) => {
            const heightPercent = Math.min(100, Math.round((day.totalMinutes / maxDayMinutes) * 100));

            return (
              <div key={day.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group">
                {/* Tooltip on hover */}
                <span className="text-[10px] text-brand-navy font-mono opacity-0 group-hover:opacity-100 transition-opacity mb-1 bg-white px-1 py-0.5 rounded shadow-xs border border-brand-border">
                  {day.totalMinutes}m
                </span>

                {/* Bar */}
                <div className="w-full max-w-[28px] bg-slate-100 rounded-t-lg relative flex items-end h-full overflow-hidden">
                  <div
                    style={{ height: `${Math.max(6, heightPercent)}%` }}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      day.totalMinutes > 0
                        ? day.isToday
                          ? 'bg-brand-blue'
                          : 'bg-brand-blue/70'
                        : 'bg-slate-200/50'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Day Labels */}
        <div className="flex items-center justify-between gap-2 pt-2 text-center">
          {weeklyDays.map((day) => (
            <div key={day.dateStr} className="flex-1">
              <span
                className={`text-[11px] block font-semibold ${
                  day.isToday ? 'text-brand-blue font-bold' : 'text-brand-muted'
                }`}
              >
                {day.dayName}
              </span>
              <span className="text-[9px] text-brand-muted/70 block">
                {day.totalMinutes > 0 ? `${day.totalMinutes}m` : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
