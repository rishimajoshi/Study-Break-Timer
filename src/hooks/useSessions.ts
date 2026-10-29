'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { StudySession, WeeklyStudyDay, ProgressSummaryData } from '@/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getLocalSessions, saveLocalSession } from '@/lib/storage';

export const useSessions = (userId?: string | null) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    const configured = isSupabaseConfigured();

    if (!configured || !userId) {
      const local = getLocalSessions();
      setSessions(local);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setSessions(getLocalSessions());
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .eq('session_type', 'focus')
        .order('started_at', { ascending: false });

      if (error) {
        console.error('Error fetching study sessions:', error);
        setSessions(getLocalSessions());
      } else {
        setSessions(data || []);
      }
    } catch (err) {
      console.error('Fetch study sessions failed:', err);
      setSessions(getLocalSessions());
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const recordCompletedSession = useCallback(
    async (session: StudySession) => {
      // Optimistically update state
      setSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)]);

      // Always save to local storage as resilience cache
      saveLocalSession(session);

      const configured = isSupabaseConfigured();
      if (!configured || !userId) return;

      const supabase = createClient();
      if (!supabase) return;

      try {
        const { error } = await supabase.from('study_sessions').insert([
          {
            id: session.id,
            user_id: userId,
            task_title: session.task_title,
            session_type: session.session_type,
            planned_duration_seconds: session.planned_duration_seconds,
            actual_duration_seconds: session.actual_duration_seconds,
            started_at: session.started_at,
            ended_at: session.ended_at,
            status: session.status,
          },
        ]);

        if (error) {
          console.error('Failed to save session to Supabase:', error);
        }
      } catch (err) {
        console.error('Error inserting session:', err);
      }
    },
    [userId]
  );

  // Compute summary statistics
  const summary: ProgressSummaryData = useMemo(() => {
    const completedFocus = sessions.filter(
      (s) => s.status === 'completed' && s.session_type === 'focus'
    );

    const totalCompletedSessions = completedFocus.length;
    const totalCompletedSeconds = completedFocus.reduce(
      (acc, s) => acc + (s.actual_duration_seconds || s.planned_duration_seconds),
      0
    );
    const totalCompletedMinutes = Math.round(totalCompletedSeconds / 60);

    // Compute weekly breakdown (Monday to Sunday of current week)
    const now = new Date();
    const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayOfWeek);
    monday.setHours(0, 0, 0, 0);

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyDays: WeeklyStudyDay[] = dayLabels.map((name, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      const dateStr = d.toISOString().slice(0, 10);
      const isToday = d.toDateString() === now.toDateString();

      // Find sessions matching this day in local timezone
      const daySessions = completedFocus.filter((s) => {
        const sessDate = new Date(s.started_at);
        return sessDate.toDateString() === d.toDateString();
      });

      const daySeconds = daySessions.reduce(
        (sum, s) => sum + (s.actual_duration_seconds || s.planned_duration_seconds),
        0
      );

      return {
        dayName: name,
        dateStr,
        totalMinutes: Math.round(daySeconds / 60),
        isToday,
      };
    });

    return {
      totalCompletedSessions,
      totalCompletedMinutes,
      weeklyDays,
    };
  }, [sessions]);

  return {
    sessions,
    isLoading,
    summary,
    recordCompletedSession,
    refreshSessions: fetchSessions,
  };
};
