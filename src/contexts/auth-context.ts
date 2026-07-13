import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { AppProfile } from '@/types/auth';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: AppProfile | null;
  loading: boolean;
  profileLoading: boolean;
  configured: boolean;
  refreshProfile: () => Promise<AppProfile | null>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
