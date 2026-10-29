export type TimerPhase = 'focus' | 'break';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface Profile {
  id: string;
  email?: string;
  full_name: string | null;
  contact_number: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudySession {
  id: string;
  user_id?: string;
  task_title: string | null;
  session_type: TimerPhase;
  planned_duration_seconds: number;
  actual_duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface ActiveTimerState {
  phase: TimerPhase;
  status: TimerStatus;
  taskTitle: string;
  presetMinutes: number;
  totalDurationSeconds: number;
  remainingSeconds: number;
  startedAt: number | null; // epoch timestamp ms
  targetEndAt: number | null; // epoch timestamp ms
  pausedRemainingSeconds: number | null;
  lastUpdated: number;
  activeSessionId?: string | null;
}

export interface WeeklyStudyDay {
  dayName: string; // e.g. "Mon"
  dateStr: string; // YYYY-MM-DD
  totalMinutes: number;
  isToday: boolean;
}

export interface ProgressSummaryData {
  totalCompletedSessions: number;
  totalCompletedMinutes: number;
  weeklyDays: WeeklyStudyDay[];
}
