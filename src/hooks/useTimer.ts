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

  // Timestamp tracking for accurate backgrounding/sleep recovery
  const targetEndAtRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completedHandledRef = useRef<boolean>(false);

  // Completion / Break suggestion state
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);
  const [breakSuggestion, setBreakSuggestion] = useState<BreakActivity | null>(null);

  // Reconcile and save state
  const syncStateToStorage = useCallback(
    (override?: Partial<ActiveTimerState>) => {
      if (status === 'idle') {
        clearActiveTimer();
        return;
      }

      const activeState: ActiveTimerState = {
        phase,
        status,
        taskTitle,
        presetMinutes: focusPresetMinutes,
        totalDurationSeconds,
        remainingSeconds,
        startedAt: startedAtRef.current,
        targetEndAt: targetEndAtRef.current,
        pausedRemainingSeconds: status === 'paused' ? remainingSeconds : null,
        lastUpdated: Date.now(),
        ...override,
      };

      saveActiveTimer(activeState);
    },
    [phase, status, taskTitle, focusPresetMinutes, totalDurationSeconds, remainingSeconds]
  );

  // Stop the ticking interval
  const clearIntervalRef = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // Handle completion when countdown reaches 0
  const handleCountdownFinished = useCallback(async () => {
    clearIntervalRef();
    if (completedHandledRef.current) return;
    completedHandledRef.current = true;

    setStatus('completed');
    setRemainingSeconds(0);
    playGentleChime();

    const currentPhase = phase;
    const currentTask = taskTitle.trim() || null;
    const planned = totalDurationSeconds;

    if (currentPhase === 'focus') {
      sendBrowserNotification('Focus session complete! 🎉', {
        body: currentTask
          ? `Great job completing "${currentTask}"! Time for a well-deserved break.`
          : 'Great job! Take a moment to rest and recharge.',
      });

      const suggestion = getRandomBreakSuggestion();
      setBreakSuggestion(suggestion);
      setShowCompletionModal(true);

      const completedSession: StudySession = {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `session-${Date.now()}`,
        task_title: currentTask,
        session_type: 'focus',
        planned_duration_seconds: planned,
        actual_duration_seconds: planned,
        started_at: new Date(startedAtRef.current || Date.now() - planned * 1000).toISOString(),
        ended_at: new Date().toISOString(),
        status: 'completed',
        created_at: new Date().toISOString(),
      };

      if (onSessionCompleted) {
        try {
          await onSessionCompleted(completedSession);
        } catch (err) {
          console.error('Failed to notify session completed callback:', err);
        }
      }
    } else {
      // Break finished
      sendBrowserNotification('Break time ended ⏰', {
        body: 'Feeling refreshed? Ready for your next focus session when you are!',
      });
      setShowCompletionModal(true);
    }

    clearActiveTimer();
  }, [clearIntervalRef, phase, taskTitle, totalDurationSeconds, onSessionCompleted]);

  // Tick calculation based on target timestamp
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

  // Start ticking interval
  const startInterval = useCallback(() => {
    clearIntervalRef();
    timerIntervalRef.current = setInterval(tick, 250);
  }, [clearIntervalRef, tick]);

  // Recover active session on initial mount
  useEffect(() => {
    const saved = getSavedActiveTimer();
    if (!saved) return;

    setPhase(saved.phase);
    setTaskTitle(saved.taskTitle || '');
    setFocusPresetMinutes(saved.presetMinutes || defaultFocusMinutes);
    setTotalDurationSeconds(saved.totalDurationSeconds);
    completedHandledRef.current = false;

    if (saved.status === 'running') {
      if (saved.remainingSeconds > 0 && saved.targetEndAt) {
        targetEndAtRef.current = saved.targetEndAt;
        startedAtRef.current = saved.startedAt;
        setRemainingSeconds(saved.remainingSeconds);
        setStatus('running');
        startInterval();
      } else {
        // Was running but completed while away
        setRemainingSeconds(0);
        setStatus('completed');
        handleCountdownFinished();
      }
    } else if (saved.status === 'paused') {
      setStatus('paused');
      setRemainingSeconds(saved.pausedRemainingSeconds || saved.remainingSeconds);
      startedAtRef.current = saved.startedAt;
    }

    return () => clearIntervalRef();
  }, [defaultFocusMinutes, startInterval, handleCountdownFinished, clearIntervalRef]);

  // Synchronize state changes to localStorage
  useEffect(() => {
    if (status !== 'idle') {
      syncStateToStorage();
    }
  }, [status, remainingSeconds, phase, syncStateToStorage]);

  // Select Preset (only allowed when idle)
  const selectPreset = useCallback((minutes: number) => {
    if (status !== 'idle') return;
    setFocusPresetMinutes(minutes);
    setTotalDurationSeconds(minutes * 60);
    setRemainingSeconds(minutes * 60);
  }, [status]);

  // Set Custom Duration in minutes
  const setCustomDuration = useCallback((minutes: number) => {
    if (status !== 'idle') return;
    const validMinutes = Math.max(1, Math.min(180, Math.round(minutes)));
    setFocusPresetMinutes(validMinutes);
    setTotalDurationSeconds(validMinutes * 60);
    setRemainingSeconds(validMinutes * 60);
  }, [status]);

  // Action: Start
  const startTimer = useCallback(() => {
    const now = Date.now();
    const duration = remainingSeconds > 0 ? remainingSeconds : totalDurationSeconds;
    const targetEnd = now + duration * 1000;

    targetEndAtRef.current = targetEnd;
    if (!startedAtRef.current) {
      startedAtRef.current = now;
    }
    completedHandledRef.current = false;

    setStatus('running');
    startInterval();
  }, [remainingSeconds, totalDurationSeconds, startInterval]);

  // Action: Pause
  const pauseTimer = useCallback(() => {
    clearIntervalRef();
    targetEndAtRef.current = null;
    setStatus('paused');
  }, [clearIntervalRef]);

  // Action: Resume
  const resumeTimer = useCallback(() => {
    const now = Date.now();
    const targetEnd = now + remainingSeconds * 1000;
    targetEndAtRef.current = targetEnd;
    setStatus('running');
    startInterval();
  }, [remainingSeconds, startInterval]);

  // Action: Stop / Cancel early (not counted as completed)
  const stopTimer = useCallback(() => {
    clearIntervalRef();
    targetEndAtRef.current = null;
    startedAtRef.current = null;
    completedHandledRef.current = false;
    clearActiveTimer();

    setStatus('idle');
    setPhase('focus');
    const defaultSeconds = focusPresetMinutes * 60;
    setTotalDurationSeconds(defaultSeconds);
    setRemainingSeconds(defaultSeconds);
    setShowCompletionModal(false);
  }, [clearIntervalRef, focusPresetMinutes]);

  // Transition to break
  const startBreak = useCallback((customBreakMins?: number) => {
    clearIntervalRef();
    const durationMins = customBreakMins ?? breakMinutes;
    const durationSecs = durationMins * 60;

    setPhase('break');
    setTotalDurationSeconds(durationSecs);
    setRemainingSeconds(durationSecs);
    setShowCompletionModal(false);

    const now = Date.now();
    targetEndAtRef.current = now + durationSecs * 1000;
    startedAtRef.current = now;
    completedHandledRef.current = false;

    setStatus('running');
    startInterval();
  }, [breakMinutes, clearIntervalRef, startInterval]);

  // Skip break or restart new focus session
  const startNextFocusSession = useCallback(() => {
    clearIntervalRef();
    clearActiveTimer();

    setPhase('focus');
    setStatus('idle');
    const focusSecs = focusPresetMinutes * 60;
    setTotalDurationSeconds(focusSecs);
    setRemainingSeconds(focusSecs);
    setShowCompletionModal(false);
    targetEndAtRef.current = null;
    startedAtRef.current = null;
    completedHandledRef.current = false;
  }, [focusPresetMinutes, clearIntervalRef]);

  // Calculate percentage progress (0 to 100)
  const progressPercent = totalDurationSeconds > 0
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
