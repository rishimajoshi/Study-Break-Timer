'use client';

import React, { useState } from 'react';
import { X, Check, User, Phone } from 'lucide-react';
import { Profile } from '@/types';

interface EditProfileModalProps {
  isOpen: boolean;
  profile: Profile | null;
  onClose: () => void;
  onSave: (updates: { full_name?: string; contact_number?: string | null }) => Promise<{ success: boolean; error?: string }>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState<string>(profile?.full_name || '');
  const [contactNumber, setContactNumber] = useState<string>(profile?.contact_number || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    const result = await onSave({
      full_name: fullName.trim(),
      contact_number: contactNumber.trim() || null,
    });

    setIsSaving(false);
    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.error || 'Failed to update profile');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-card border border-brand-border">
        <div className="flex items-center justify-between mb-4">
          <h3 id="edit-profile-title" className="text-base font-bold text-brand-navy">
            Edit Profile
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-brand-muted hover:text-brand-navy rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-brand-rose-soft text-brand-rose text-xs rounded-xl border border-brand-rose/20">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-xs font-semibold text-brand-navy mb-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-brand-muted">
                <User className="w-4 h-4" />
              </div>
              <input
                id="edit-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full pl-9 pr-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-phone" className="block text-xs font-semibold text-brand-navy mb-1">
              Contact Number <span className="text-[11px] font-normal text-brand-muted">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-2.5 text-brand-muted">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="edit-phone"
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+1 555-0199"
                className="w-full pl-9 pr-3 py-2 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 py-2.5 px-3 text-sm font-semibold text-brand-muted hover:text-brand-navy rounded-xl border border-brand-border hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 px-3 text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover rounded-xl shadow-subtle flex items-center justify-center gap-1.5 transition-colors disabled:opacity-60"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
