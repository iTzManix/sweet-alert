import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ApiError } from '@/lib/api';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { ProfileOut } from '@/types/api';

type ProfileStatus = 'checking' | 'missing' | 'ready';

interface AuthContextValue {
  session: Session | null;
  initializing: boolean;
  profile: ProfileOut | null;
  profileStatus: ProfileStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profile, setProfile] = useState<ProfileOut | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('checking');

  async function refreshProfile() {
    setProfileStatus('checking');
    try {
      const result = await api.getProfile();
      setProfile(result);
      setProfileStatus('ready');
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setProfile(null);
        setProfileStatus('missing');
        return;
      }
      throw err;
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setProfileStatus('missing');
      return;
    }
    refreshProfile().catch(() => setProfileStatus('missing'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      initializing,
      profile,
      profileStatus,
      refreshProfile,
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signUp(email, password) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return { needsEmailConfirmation: !data.session };
      },
      async signOut() {
        await supabase.auth.signOut();
      },
    }),
    [session, initializing, profile, profileStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
