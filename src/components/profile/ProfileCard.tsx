'use client';

import React from 'react';
import { User, Mail, Phone, Edit3, LogIn } from 'lucide-react';
import { Profile } from '@/types';

interface ProfileCardProps {
  profile: Profile | null;
  userEmail?: string;
  isLoggedIn: boolean;
  onOpenEdit: () => void;
  onOpenAuth: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  userEmail,
  isLoggedIn,
  onOpenEdit,
  onOpenAuth,
}) => {
  const displayName = isLoggedIn
    ? profile?.full_name?.trim() || 'Student'
    : 'Guest Student';
  const displayEmail = isLoggedIn
    ? userEmail || profile?.email || 'student@example.com'
    : 'Not signed in';
  const displayPhone = profile?.contact_number?.trim();

  // Generate initials for avatar
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'G';

  return (
    <div className="bg-white rounded-3xl p-6 border border-brand-border shadow-card mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar Placeholder */}
          <div className="w-16 h-16 rounded-2xl bg-brand-blue-soft border-2 border-brand-blue/20 flex items-center justify-center text-brand-blue font-bold text-xl shadow-subtle">
            {initials}
          </div>

          <div>
            <h2 className="text-xl font-bold text-brand-navy leading-tight">
              {displayName}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-brand-muted mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{displayEmail}</span>
            </div>
            {isLoggedIn && displayPhone && (
              <div className="flex items-center gap-1.5 text-xs text-brand-muted mt-0.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{displayPhone}</span>
              </div>
            )}
          </div>
        </div>

        {isLoggedIn ? (
          <button
            type="button"
            onClick={onOpenEdit}
            className="p-2 text-brand-blue hover:bg-brand-blue-soft/50 rounded-xl border border-brand-blue/20 transition-colors flex items-center gap-1 text-xs font-semibold"
            aria-label="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="py-1.5 px-3 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs font-semibold shadow-subtle flex items-center gap-1 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {!isLoggedIn && (
        <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-between text-xs">
          <span className="text-brand-muted">Want to save your sessions permanently?</span>
          <button
            type="button"
            onClick={onOpenAuth}
            className="font-bold text-brand-blue hover:underline"
          >
            Create Free Account →
          </button>
        </div>
      )}
    </div>
  );
};
