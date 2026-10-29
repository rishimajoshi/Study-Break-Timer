'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Sparkles, LogOut } from 'lucide-react';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
} from '@/lib/notifications';
import { TimerPhase } from '@/types';

interface AppHeaderProps {
  phase: TimerPhase;
  isLoggedIn: boolean;
  userEmail?: string;
  onSignOut?: () => void;
  isLocalMode?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  phase,
  isLoggedIn,
  userEmail,
  onSignOut,
  isLocalMode,
}) => {
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (isNotificationSupported()) {
      setNotificationStatus(getNotificationPermission());
    }
  }, []);

  const handleToggleNotifications = async () => {
    if (!isNotificationSupported()) {
      alert('Browser notifications are not supported by your current browser.');
      return;
    }

    if (notificationStatus === 'granted') {
      alert('Notifications are enabled! You will be alerted when your study or break sessions end.');
      return;
    }

    const perm = await requestNotificationPermission();
    setNotificationStatus(perm);
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur sticky top-0 z-30 border-b border-brand-border/60">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-brand-blue flex items-center justify-center text-white font-bold text-sm shadow-subtle">
            ⏱
          </div>
          <span className="font-bold text-brand-navy tracking-tight text-base">
            Study Break
          </span>
          <span
            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full transition-colors ${
              phase === 'focus'
                ? 'bg-brand-blue-soft text-brand-blue'
                : 'bg-brand-teal-soft text-brand-teal'
            }`}
          >
            {phase}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isNotificationSupported() && (
            <button
              type="button"
              onClick={handleToggleNotifications}
              title={
                notificationStatus === 'granted'
                  ? 'Notifications active'
                  : 'Enable browser notifications for timer alerts'
              }
              aria-label="Toggle notifications"
              className={`p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1 ${
                notificationStatus === 'granted'
                  ? 'bg-brand-blue-soft text-brand-blue border-brand-blue/30'
                  : 'bg-white text-brand-muted hover:text-brand-navy border-brand-border hover:bg-slate-50'
              }`}
            >
              {notificationStatus === 'granted' ? (
                <Bell className="w-4 h-4 text-brand-blue" />
              ) : (
                <BellOff className="w-4 h-4 text-brand-muted" />
              )}
            </button>
          )}

          {isLoggedIn && onSignOut && (
            <button
              type="button"
              onClick={onSignOut}
              title={`Sign out (${userEmail || 'Account'})`}
              aria-label="Sign out"
              className="p-1.5 text-brand-muted hover:text-brand-rose hover:bg-brand-rose-soft/40 rounded-lg border border-transparent hover:border-brand-rose/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isLocalMode && (
        <div className="bg-amber-50 border-b border-amber-200/70 px-4 py-1 text-center">
          <p className="text-[11px] text-amber-800 font-medium inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            Local Demo Mode — Connect Supabase in .env.local for full cloud sync.
          </p>
        </div>
      )}
    </header>
  );
};
