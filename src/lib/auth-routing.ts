import type { AppRole } from '@/types/auth';

export function homeForRole(role?: AppRole | null) {
  if (role === 'admin' || role === 'super_admin') return '/admin/dashboard';
  if (role === 'provider') return '/provider/dashboard';
  return '/account';
}
