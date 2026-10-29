'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ActiveTimerState, TimerPhase, TimerStatus, StudySession } from '@/types';
import { saveActiveTimer, getSavedActiveTimer, clearActiveTimer } from '@/lib/storage';
import { playGentleChime, sendBrowserNotification } from '@/lib/notifications';
import { getRandomBreakSuggestion, BreakActivity } from '@/lib/break-suggestions';

interface UseTimerProps {
  onSessionCompleted?: (session: StudySession) => Promise<void> | void;
  defaultFocusMinutes?: number;
  defaultBreakMinutes?: number;
}

export const useTimer = ({
  onSessionCompleted,
  defaultFocusMinutes = 25,
  defaultBreakMinutes = 5,
}: UseTimerProps = {}) => {
  // Configured presets
  const [focusPresetMinutes, setFocusPresetMinutes] = useState<number>(defaultFocusMinutes);
  const [breakMinutes, setBreakMinutes] = useState<number>(defaultBreakMinutes);
  const [taskTitle, setTaskTitle] = useState<string>('');

  // Active state
  const [phase, setPhase] = useState<TimerPhase>('focus');
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [totalDurationSeconds, setTotalDurationSeconds] = useState<number>(defaultFocusMinutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(defaultFocusMinutes * 60);

  // Completion & Break suggestions
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [breakSuggestion, setBreakSuggestion] = useState<BreakActivity | null>(null);

  // Mutable refs for stable closures
  const targetEndAtRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedHandledRef = useRef<boolean>(false);
  const onSessionCompletedRef = useRef(onSessionCompleted);
  const phaseRef = useRef<TimerPhase>(phase);
  const taskTitleRef = useRef<string>(taskTitle);
  const totalDurationSecondsRef = useRef<number>(totalDurationSeconds);
  const focusPresetMinutesRef = useRef<number>(focusPresetMinutes);
  const remainingSecondsRef = useRef<number>(remainingSeconds);
  const statusRef = useRef<TimerStatus>(status);

  // Keep refs synchronized
  useEffect(() => {
    onSessionCompletedRef.current = onSessionCompleted;
  }, [onSessionCompleted]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    taskTitleRef.current = taskTitle;
  }, [taskTitle]);

  useEffect(() => {
    totalDurationSecondsRef.current = totalDurationSeconds;
  }, [totalDurationSeconds]);

  useEffect(() => {
    focusPresetMinutesRef.current = focusPresetMinutes;
  }, [focusPresetMinutes]);

  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds;
  }, [remainingSeconds]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Persist snapshot to storage (called only on explicit transitions)
  const persistState = useCallback(
    (override?: Partial<ActiveTimerState>) => {
      const curStatus = override?.status ?? statusRef.current;
      if (curStatus === 'idle') {
        clearActiveTimer();
        return;
      }

      const activeState: ActiveTimerState = {
        phase: override?.phase ?? phaseRef.current,
        status: curStatus,
        taskTitle: override?.taskTitle ?? taskTitleRef.current,
        presetMinutes: override?.presetMinutes ?? focusPresetMinutesRef.current,
        totalDurationSeconds: override?.totalDurationSeconds ?? totalDurationSecondsRef.current,
        remainingSeconds: override?.remainingSeconds ?? remainingSecondsRef.current,
        startedAt: startedAtRef.current,
        targetEndAt: targetEndAtRef.current,
        pausedRemainingSeconds: curStatus === 'paused' ? (override?.remainingSeconds ?? remainingSecondsRef.current) : null,
        lastUpdated: Date.now(),
        ...override,
      };

      saveActiveTimer(activeState);
    },
    []
  );

  // Stop the interval
  const clearIntervalTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Completion handler (stable, uses refs)
  const handleCountdownFinished = useCallback(async () => {
    clearIntervalTimer();
    if (completedHandledRef.current) return;
    completedHandledRef.current = true;

    setStatus('completed');
    setRemainingSeconds(0);
    clearActiveTimer();
    playGentleChime();

    const curPhase = phaseRef.current;
    const curTask = taskTitleRef.current.trim() || null;
    const planned = totalDurationSecondsRef.current;

    if (curPhase === 'focus') {
      sendBrowserNotification('Focus session complete! 🎉', {
        body: curTask
          ? `Great job completing "${curTask}"! Time for a well-deserved break.`
          : 'Great job! Take a moment to rest and recharge.',
      });

      const suggestion = getRandomBreakSuggestion();
      setBreakSuggestion(suggestion);
      setShowCompletionModal(true);

      const completedSession: StudySession = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`,
        task_title: curTask,
        session_type: 'focus',
        planned_duration_seconds: planned,
        actual_duration_seconds: planned,
        started_at: new Date(startedAtRef.current || Date.now() - planned * 1000).toISOString(),
        ended_at: new Date().toISOString(),
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      if (onSessionCompletedRef.current) {
        try {
          await onSessionCompletedRef.current(completedSession);
        } catch (err) {
          console.error('Failed to notify session completed callback:', err);
        }
      }
    } else {
      // Break session ended
      sendBrowserNotification('Break time ended ⏰', {
        body: 'Feeling refreshed? Ready for your next focus session when you are!',
      });
      setShowCompletionModal(true);
    }
  }, [clearIntervalTimer]);

  // Interval tick function
  const tick = useCallback(() => {
    if (!targetEndAtRef.current) return;

    const now = Date.now();
    const diffMs = targetEndAtRef.current - now;
    const secondsLeft = Math.max(0, Math.ceil(diffMs / 1000));

    setRemainingSeconds(secondsLeft);

    if (secondsLeft <= 0) {
      handleCountdownFinished();
    }
  }, [handleCountdownFinished]);

  // Start ticking
  const startInterval = useCallback(() => {
    clearIntervalTimer();
    timerIntervalRef.current = setInterval(tick, 250);
  }, [clearIntervalTimer, tick]);

  // RECOVER ACTIVE SESSION ONCE ON MOUNT ONLY
  useEffect(() => {
    const saved = getSavedActiveTimer();
    if (!saved) return;

    // If saved state is already completed or expired, discard it cleanly
    if (saved.status === 'completed' || saved.remainingSeconds <= 0) {
      clearActiveTimer();
      return;
    }

    setPhase(saved.phase);
    setTaskTitle(saved.taskTitle || '');
    const preset = saved.presetMinutes || defaultFocusMinutes;
    setFocusPresetMinutes(preset);
    setTotalDurationSeconds(saved.totalDurationSeconds);
    completedHandledRef.current = false;

    if (saved.status === 'running') {
      if (saved.targetEndAt && saved.targetEndAt > Date.now()) {
        targetEndAtRef.current = saved.targetEndAt;
        startedAtRef.current = saved.startedAt;
        setRemainingSeconds(saved.remainingSeconds);
        setStatus('running');
        startInterval();
      } else {
        // Expired while closed
        clearActiveTimer();
        setStatus('idle');
        setRemainingSeconds(preset * 60);
      }
    } else if (saved.status === 'paused') {
      setStatus('paused');
      const rem = saved.pausedRemainingSeconds ?? saved.remainingSeconds;
      setRemainingSeconds(rem);
      startedAtRef.current = saved.startedAt;
    }

    return () => clearIntervalTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run exactly once on mount

  // Select Preset (only allowed when idle)
  const selectPreset = useCallback((minutes: number) => {
    if (statusRef.current !== 'idle') return;
    setFocusPresetMinutes(minutes);
    const secs = minutes * 60;
    setTotalDurationSeconds(secs);
    setRemainingSeconds(secs);
  }, []);

  // Set Custom Duration in hours, minutes, and seconds
  const setCustomDuration = useCallback((hOrMins: number, m?: number, s?: number) => {
    if (statusRef.current !== 'idle') return;
    let totalSecs = 0;
    if (m !== undefined && s !== undefined) {
      // Called with (hours, minutes, seconds)
      totalSecs = Math.max(5, Math.min(43200, Math.round(hOrMins * 3600 + m * 60 + s)));
    } else {
      // Called with (minutes)
      totalSecs = Math.max(5, Math.min(43200, Math.round(hOrMins * 60)));
    }
    const approxMins = Math.max(1, Math.round(totalSecs / 60));
    setFocusPresetMinutes(approxMins);
    setTotalDurationSeconds(totalSecs);
    setRemainingSeconds(totalSecs);
  }, []);

  // Action: Start
  const startTimer = useCallback(() => {
    const now = Date.now();
    const duration = remainingSecondsRef.current > 0 ? remainingSecondsRef.current : totalDurationSecondsRef.current;
    const targetEnd = now + duration * 1000;

    targetEndAtRef.current = targetEnd;
    if (!startedAtRef.current) {
      startedAtRef.current = now;
    }
    completedHandledRef.current = false;

    setStatus('running');
    startInterval();

    persistState({
      status: 'running',
      remainingSeconds: duration,
      targetEndAt: targetEnd,
      startedAt: startedAtRef.current,
    });
  }, [startInterval, persistState]);

  // Action: Pause
  const pauseTimer = useCallback(() => {
    clearIntervalTimer();
    targetEndAtRef.current = null;
    setStatus('paused');

    persistState({
      status: 'paused',
      remainingSeconds: remainingSecondsRef.current,
    });
  }, [clearIntervalTimer, persistState]);

  // Action: Resume
  const resumeTimer = useCallback(() => {
    const now = Date.now();
    const duration = remainingSecondsRef.current;
    const targetEnd = now + duration * 1000;
    targetEndAtRef.current = targetEnd;

    setStatus('running');
    startInterval();

    persistState({
      status: 'running',
      remainingSeconds: duration,
      targetEndAt: targetEnd,
    });
  }, [startInterval, persistState]);

  // Action: Stop / Cancel early
  const stopTimer = useCallback(() => {
    clearIntervalTimer();
    targetEndAtRef.current = null;
    startedAtRef.current = null;
    completedHandledRef.current = false;
    clearActiveTimer();

    setStatus('idle');
    setPhase('focus');
    const defaultSeconds = focusPresetMinutesRef.current * 60;
    setTotalDurationSeconds(defaultSeconds);
    setRemainingSeconds(defaultSeconds);
    setShowCompletionModal(false);
  }, [clearIntervalTimer]);

  // Transition to break
  const startBreak = useCallback(
    (customBreakMins?: number) => {
      clearIntervalTimer();
      const durationMins = customBreakMins ?? breakMinutes;
      const durationSecs = durationMins * 60;

      setPhase('break');
      setTotalDurationSeconds(durationSecs);
      setRemainingSeconds(durationSecs);
      setShowCompletionModal(false);

      const now = Date.now();
      const targetEnd = now + durationSecs * 1000;
      targetEndAtRef.current = targetEnd;
      startedAtRef.current = now;
      completedHandledRef.current = false;

      setStatus('running');
      startInterval();

      persistState({
        phase: 'break',
        status: 'running',
        totalDurationSeconds: durationSecs,
        remainingSeconds: durationSecs,
        targetEndAt: targetEnd,
        startedAt: now,
      });
    },
    [breakMinutes, clearIntervalTimer, startInterval, persistState]
  );

  // Skip break or restart new focus session
  const startNextFocusSession = useCallback(() => {
    clearIntervalTimer();
    clearActiveTimer();

    setPhase('focus');
    setStatus('idle');
    const focusSecs = focusPresetMinutesRef.current * 60;
    setTotalDurationSeconds(focusSecs);
    setRemainingSeconds(focusSecs);
    setShowCompletionModal(false);
    targetEndAtRef.current = null;
    startedAtRef.current = null;
    completedHandledRef.current = false;
  }, [clearIntervalTimer]);

  // Calculate percentage progress (0 to 100)
  const progressPercent =
    totalDurationSeconds > 0
      ? Math.min(100, Math.max(0, ((totalDurationSeconds - remainingSeconds) / totalDurationSeconds) * 100))
      : 0;

  return {
    phase,
    status,
    remainingSeconds,
    totalDurationSeconds,
    progressPercent,
    focusPresetMinutes,
    breakMinutes,
    taskTitle,
    setTaskTitle,
    setBreakMinutes,
    selectPreset,
    setCustomDuration,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    startBreak,
    startNextFocusSession,
    showCompletionModal,
    setShowCompletionModal,
    breakSuggestion,
  };
};
