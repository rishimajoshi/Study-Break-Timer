'use client';

import { useState, useEffect, useCallback } from 'react';
import { Profile } from '@/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getLocalProfile, saveLocalProfile } from '@/lib/storage';

export const useAuth = () => {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string, userEmail?: string) => {
    const supabase = createClient();
    if (!supabase) {
      const local = getLocalProfile();
      setProfile(local);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setProfile({
          ...data,
          email: userEmail || data.email,
        });
      } else {
        // Create initial profile record if it doesn't exist
        const initialProfile: Profile = {
          id: userId,
          email: userEmail,
          full_name: '',
          contact_number: null,
        };
        await supabase.from('profiles').upsert(initialProfile);
        setProfile(initialProfile);
      }
    } catch (err) {
      console.error('Profile fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    const configured = isSupabaseConfigured();
    setIsConfigured(configured);

    if (!configured) {
      // In local mode, initialize with the local profile so the user can interact immediately
      const local = getLocalProfile();
      setUser({ id: local.id, email: local.email });
      setProfile(local);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get current session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({ id: user.id, email: user.email });
        fetchProfile(user.id, user.email);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string) => {
    setAuthError(null);
    setAuthMessage(null);
    setIsLoading(true);

    if (!isConfigured) {
      const newProfile: Profile = {
        id: `local-${Date.now()}`,
        email,
        full_name: fullName,
        contact_number: null,
      };
      saveLocalProfile(newProfile);
      setUser({ id: newProfile.id, email });
      setProfile(newProfile);
      setIsLoading(false);
      return { success: true };
    }

    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database client uninitialized' };

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data?.session) {
        setUser({ id: data.user!.id, email: data.user!.email });
        await fetchProfile(data.user!.id, data.user!.email);
      } else {
        setAuthMessage('Account created! Please check your email inbox to verify your address.');
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign up error occurred';
      setAuthError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthError(null);
    setAuthMessage(null);
    setIsLoading(true);

    if (!isConfigured) {
      const existing = getLocalProfile();
      const updated = { ...existing, email };
      saveLocalProfile(updated);
      setUser({ id: updated.id, email });
      setProfile(updated);
      setIsLoading(false);
      return { success: true };
    }

    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database client uninitialized' };

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setUser({ id: data.user.id, email: data.user.email });
        await fetchProfile(data.user.id, data.user.email);
      }

      setIsLoading(false);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in error occurred';
      setAuthError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    setAuthMessage(null);
    setIsLoading(true);

    if (!isConfigured) {
      setAuthError('Google sign in requires connecting your Supabase project in .env.local');
      setIsLoading(false);
      return { success: false, error: 'Supabase unconfigured' };
    }

    const supabase = createClient();
    if (!supabase) {
      setIsLoading(false);
      return { success: false, error: 'Supabase client unavailable' };
    }

    try {
      const redirectUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      // Supabase redirects to Google login page
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in error occurred';
      setAuthError(msg);
      setIsLoading(false);
      return { success: false, error: msg };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (!isConfigured) {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setIsLoading(false);
  };

  const resetPassword = async (email: string) => {
    setAuthError(null);
    setAuthMessage(null);

    if (!isConfigured) {
      setAuthMessage('In local mode: password reset simulated. Connect Supabase for real email recovery.');
      return { success: true };
    }

    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Supabase client unavailable' };

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/reset-password`,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      setAuthMessage('Password reset instructions have been sent to your email.');
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send reset link';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const updateProfile = async (updates: { full_name?: string; contact_number?: string | null }) => {
    if (!user) return { success: false, error: 'User not signed in' };

    if (!isConfigured) {
      const current = profile || getLocalProfile();
      const updated: Profile = {
        ...current,
        full_name: updates.full_name !== undefined ? updates.full_name : current.full_name,
        contact_number: updates.contact_number !== undefined ? updates.contact_number : current.contact_number,
      };
      saveLocalProfile(updated);
      setProfile(updated);
      return { success: true };
    }

    const supabase = createClient();
    if (!supabase) return { success: false, error: 'Database uninitialized' };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          contact_number: updates.contact_number,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: updates.full_name ?? prev.full_name,
              contact_number: updates.contact_number ?? prev.contact_number,
            }
          : null
      );

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile';
      return { success: false, error: msg };
    }
  };

  return {
    user,
    profile,
    isLoading,
    isConfigured,
    authError,
    authMessage,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    clearMessages: () => {
      setAuthError(null);
      setAuthMessage(null);
    },
  };
};
