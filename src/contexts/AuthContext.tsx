import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { deactivateCurrentPushTokenForSignOut } from '@/lib/push-notifications';
import type { AppProfile } from '@/types/auth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchProfile = useCallback(async (userId: string): Promise<AppProfile | null> => {
    if (!isSupabaseConfigured) {
      setProfile(null);
      return null;
    }

    setProfileLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, full_name, phone, email, avatar_path, role, account_status, default_service_area_id, address_text, latitude, longitude, created_at, updated_at, last_seen_at'
      )
      .eq('id', userId)
      .maybeSingle();

    setProfileLoading(false);

    if (error) {
      console.error('[S2B Services] Unable to load profile:', error.message);
      setProfile(null);
      return null;
    }

    const nextProfile = (data ?? null) as AppProfile | null;
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        console.error('[S2B Services] Unable to restore session:', error.message);
      }

      const nextSession = data.session ?? null;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);

      if (nextSession?.user) {
        void fetchProfile(nextSession.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        window.setTimeout(() => {
          if (active) void fetchProfile(nextSession.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      return null;
    }
    return fetchProfile(user.id);
  }, [fetchProfile, user]);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    await deactivateCurrentPushTokenForSignOut();
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      loading,
      profileLoading,
      configured: isSupabaseConfigured,
      refreshProfile,
      signOut,
    }),
    [session, user, profile, loading, profileLoading, refreshProfile, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
