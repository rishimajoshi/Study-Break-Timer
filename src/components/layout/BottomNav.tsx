'use client';

import React from 'react';
import { Timer, User } from 'lucide-react';

export type ActiveTab = 'timer' | 'profile';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-brand-border py-2 px-6 safe-bottom"
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        <button
          type="button"
          onClick={() => onChangeTab('timer')}
          aria-label="Timer Screen"
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all duration-200 ${
            activeTab === 'timer'
              ? 'text-brand-blue font-semibold scale-105'
              : 'text-brand-muted hover:text-brand-navy hover:bg-slate-50'
          }`}
        >
          <div
            className={`p-1.5 rounded-full mb-1 transition-colors ${
              activeTab === 'timer' ? 'bg-brand-blue-soft text-brand-blue' : 'text-brand-muted'
            }`}
          >
            <Timer className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-xs tracking-wide">Timer</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeTab('profile')}
          aria-label="Profile Screen"
          className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all duration-200 ${
            activeTab === 'profile'
              ? 'text-brand-blue font-semibold scale-105'
              : 'text-brand-muted hover:text-brand-navy hover:bg-slate-50'
          }`}
        >
          <div
            className={`p-1.5 rounded-full mb-1 transition-colors ${
              activeTab === 'profile' ? 'bg-brand-blue-soft text-brand-blue' : 'text-brand-muted'
            }`}
          >
            <User className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-xs tracking-wide">Profile</span>
        </button>
      </div>
    </nav>
  );
};
