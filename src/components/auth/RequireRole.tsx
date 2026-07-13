import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import type { AppRole } from '@/types/auth';
import AuthLoadingScreen from './AuthLoadingScreen';

interface RequireRoleProps {
  children: ReactNode;
  allowed: AppRole[];
}

export default function RequireRole({ children, allowed }: RequireRoleProps) {
  const { user, profile, loading, profileLoading, configured } = useAuth();

  if (loading || profileLoading) return <AuthLoadingScreen />;
  if (!configured || !user) return <Navigate to="/login" replace />;
  if (!profile || profile.account_status !== 'active' || !allowed.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
