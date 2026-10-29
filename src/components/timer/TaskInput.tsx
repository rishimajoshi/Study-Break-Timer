'use client';

import React from 'react';
import { Target, X } from 'lucide-react';
import { TimerStatus } from '@/types';

interface TaskInputProps {
  taskTitle: string;
  status: TimerStatus;
  onChangeTask: (title: string) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({ taskTitle, onChangeTask }) => {
  return (
    <div className="w-full mb-6">
      <label htmlFor="task-input" className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">
        Study Focus / Goal <span className="text-[11px] font-normal lowercase text-brand-muted">(optional)</span>
      </label>

      <div className="relative flex items-center">
        <div className="absolute left-3 text-brand-muted pointer-events-none">
          <Target className="w-4 h-4" />
        </div>

        <input
          id="task-input"
          type="text"
          value={taskTitle}
          onChange={(e) => onChangeTask(e.target.value)}
          placeholder="What are you working on? (e.g. History essay, Math problem set)"
          maxLength={80}
          className="w-full pl-9 pr-8 py-2.5 bg-white border border-brand-border rounded-xl text-sm text-brand-navy placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all"
        />

        {taskTitle.length > 0 && (
          <button
            type="button"
            onClick={() => onChangeTask('')}
            aria-label="Clear goal"
            className="absolute right-2.5 p-1 text-brand-muted hover:text-brand-navy rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
