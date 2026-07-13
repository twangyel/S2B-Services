import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import AuthLoadingScreen from './AuthLoadingScreen';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation();
  const { user, loading, configured } = useAuth();

  if (loading) return <AuthLoadingScreen />;

  if (!configured || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
