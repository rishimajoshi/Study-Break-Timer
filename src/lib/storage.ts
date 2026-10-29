import { ActiveTimerState, Profile, StudySession } from '@/types';

const TIMER_STORAGE_KEY = 'study_break_timer_active_state_v1';
const LOCAL_SESSIONS_KEY = 'study_break_timer_local_sessions_v1';
const LOCAL_PROFILE_KEY = 'study_break_timer_local_profile_v1';

export const saveActiveTimer = (state: ActiveTimerState | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (!state || state.status === 'idle') {
      window.localStorage.removeItem(TIMER_STORAGE_KEY);
    } else {
      window.localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.error('Failed to save timer state to localStorage:', err);
  }
};

export const getSavedActiveTimer = (): ActiveTimerState | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return null;
    const parsed: ActiveTimerState = JSON.parse(raw);

    // Validate structure
    if (!parsed || typeof parsed.remainingSeconds !== 'number') {
      window.localStorage.removeItem(TIMER_STORAGE_KEY);
      return null;
    }

    if (parsed.status === 'completed' || parsed.status === 'idle') {
      window.localStorage.removeItem(TIMER_STORAGE_KEY);
      return null;
    }

    // If timer was running, reconcile elapsed time using targetEndAt
    if (parsed.status === 'running' && parsed.targetEndAt) {
      const now = Date.now();
      const diffMs = parsed.targetEndAt - now;
      const calculatedRemaining = Math.max(0, Math.ceil(diffMs / 1000));

      if (calculatedRemaining <= 0) {
        window.localStorage.removeItem(TIMER_STORAGE_KEY);
        return null;
      }

      parsed.remainingSeconds = calculatedRemaining;
      parsed.lastUpdated = now;
    }

    return parsed;
  } catch (err) {
    console.error('Failed to retrieve timer state from localStorage:', err);
    return null;
  }
};

export const clearActiveTimer = (): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(TIMER_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear timer state:', err);
  }
};

// Local storage fallback for sessions when running in local-only demo mode
export const getLocalSessions = (): StudySession[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveLocalSession = (session: StudySession): void => {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalSessions();
    const updated = [session, ...existing.filter((s) => s.id !== session.id)];
    window.localStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save local session:', err);
  }
};

// Local storage fallback for user profile
export const getLocalProfile = (): Profile => {
  if (typeof window === 'undefined') {
    return {
      id: 'local-dev-user',
      email: 'student@studybreaktimer.com',
      full_name: 'Alex Rivera',
      contact_number: null,
    };
  }
  try {
    const raw = window.localStorage.getItem(LOCAL_PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    id: 'local-dev-user',
    email: 'student@studybreaktimer.com',
    full_name: 'Alex Rivera',
    contact_number: null,
  };
};

export const saveLocalProfile = (profile: Profile): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save local profile:', err);
  }
};
