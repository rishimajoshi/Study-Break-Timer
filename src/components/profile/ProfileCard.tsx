'use client';

import React from 'react';
import { User, Mail, Phone, Edit3 } from 'lucide-react';
import { Profile } from '@/types';

interface ProfileCardProps {
  profile: Profile | null;
  userEmail?: string;
  onOpenEdit: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  userEmail,
  onOpenEdit,
}) => {
  const displayName = profile?.full_name?.trim() || 'Student';
  const displayEmail = userEmail || profile?.email || 'student@example.com';
  const displayPhone = profile?.contact_number?.trim();

  // Generate initials for avatar
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'S';

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
            {displayPhone && (
              <div className="flex items-center gap-1.5 text-xs text-brand-muted mt-0.5">
                <Phone className="w-3.5 h-3.5" />
                <span>{displayPhone}</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenEdit}
          className="p-2 text-brand-blue hover:bg-brand-blue-soft/50 rounded-xl border border-brand-blue/20 transition-colors flex items-center gap-1 text-xs font-semibold"
          aria-label="Edit Profile"
        >
          <Edit3 className="w-4 h-4" />
          <span className="hidden sm:inline">Edit</span>
        </button>
      </div>
    </div>
  );
};
