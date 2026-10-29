'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, KeyRound, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AuthCardProps {
  onSignIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onSignUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  onResetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  authError: string | null;
  authMessage: string | null;
  isLoading: boolean;
  isConfigured: boolean;
  onContinueAsGuest?: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  onSignIn,
  onSignUp,
  onResetPassword,
  authError,
  authMessage,
  isLoading,
  isConfigured,
  onContinueAsGuest,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localValidation, setLocalValidation] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalValidation(null);

    if (!email || !email.includes('@')) {
      setLocalValidation('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      await onResetPassword(email);
      return;
    }

    if (!password || password.length < 6) {
      setLocalValidation('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setLocalValidation('Please enter your name.');
        return;
      }
      await onSignUp(email, password, fullName.trim());
    } else {
      await onSignIn(email, password);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-brand-border shadow-card">
      {/* Stopwatch illustration header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 rounded-3xl bg-brand-blue-soft border-2 border-brand-blue/20 flex items-center justify-center text-brand-blue mb-3 shadow-subtle">
          <svg
            className="w-8 h-8 stroke-brand-blue"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="14" r="8" />
            <line x1="12" y1="10" x2="12" y2="14" />
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="10" y1="2" x2="14" y2="2" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-brand-navy tracking-tight">
          Study Break Timer
        </h1>
        <p className="text-xs text-brand-muted mt-1 leading-relaxed">
          Sign in or create an account to focus better.
        </p>
      </div>

      {/* Segmented Sign In / Sign Up toggle */}
      {mode !== 'forgot' && (
        <div className="bg-brand-bg p-1 rounded-2xl flex items-center mb-6 border border-brand-border/70">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setLocalValidation(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-white text-brand-blue shadow-subtle'
                : 'text-brand-muted hover:text-brand-navy'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setLocalValidation(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-white text-brand-blue shadow-subtle'
                : 'text-brand-muted hover:text-brand-navy'
            }`}
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Status alerts */}
      {(authError || localValidation) && (
        <div className="mb-4 p-3 bg-brand-rose-soft text-brand-rose text-xs rounded-xl border border-brand-rose/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{authError || localValidation}</span>
        </div>
      )}

      {authMessage && (
        <div className="mb-4 p-3 bg-brand-teal-soft text-brand-teal text-xs rounded-xl border border-brand-teal/20 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{authMessage}</span>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label htmlFor="auth-name" className="block text-xs font-semibold text-brand-navy mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-brand-muted">
                <User className="w-4 h-4" />
              </div>
              <input
                id="auth-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full pl-9 pr-3 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="block text-xs font-semibold text-brand-navy mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute left-3 top-3 text-brand-muted">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@university.edu"
              className="w-full pl-9 pr-3 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
            />
          </div>
        </div>

        {mode !== 'forgot' && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="auth-pass" className="block text-xs font-semibold text-brand-navy">
                Password
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] font-medium text-brand-blue hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute left-3 top-3 text-brand-muted">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="auth-pass"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-brand-muted hover:text-brand-navy"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 bg-brand-blue hover:bg-brand-blue-hover text-white font-bold text-sm rounded-2xl shadow-subtle flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-60"
        >
          {isLoading ? (
            <span>Please wait...</span>
          ) : mode === 'signin' ? (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : mode === 'signup' ? (
            <>
              <span>Create Account</span>
              <Sparkles className="w-4 h-4" />
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>Send Password Reset</span>
            </>
          )}
        </button>

        {mode === 'forgot' && (
          <button
            type="button"
            onClick={() => setMode('signin')}
            className="w-full py-2 text-xs font-semibold text-brand-muted hover:text-brand-navy"
          >
            ← Back to Sign In
          </button>
        )}
      </form>

      {/* Guest/Demo Mode Fast-Path */}
      {onContinueAsGuest && (
        <div className="mt-5 pt-4 border-t border-brand-border/60 text-center">
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="text-xs font-semibold text-brand-muted hover:text-brand-blue transition-colors"
          >
            Or start studying now as Guest →
          </button>
        </div>
      )}

      {/* Supabase Notice */}
      {!isConfigured && (
        <div className="mt-4 p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 leading-snug">
          <strong>Tip:</strong> In local mode, accounts are saved safely to your local browser. Once you add Supabase keys to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env.local</code>, real email auth & PostgreSQL will activate automatically!
        </div>
      )}
    </div>
  );
};
