export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return 'denied';
  }
};

export const sendBrowserNotification = (title: string, options?: NotificationOptions): void => {
  if (!isNotificationSupported()) return;
  if (Notification.permission !== 'granted') return;

  try {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  } catch (err) {
    console.error('Error dispatching browser notification:', err);
  }
};

// Subtle and gentle audio chime using standard Web Audio API (no external mp3 files needed)
export const playGentleChime = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic two-tone gentle chime (E5 -> G#5)
    const notes = [659.25, 830.61]; // E5, G#5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0, now + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.18 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 1.3);
    });
  } catch (err) {
    // Audio may be blocked until user interacts with the page
    console.warn('Audio playback silent fallback:', err);
  }
};
