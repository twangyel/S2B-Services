import {
  Bell,
  ChevronRight,
  FileText,
  HelpCircle,
  MessageSquareWarning,
  LayoutDashboard,
  LogIn,
  LogOut,
  Phone,
  Shield,
  User,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export default function Account() {
  const navigate = useNavigate();
  const { user, profile, profileLoading, signOut, configured } = useAuth();

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
  const isProvider = profile?.role === 'provider';

  const menuItems = [
    ...(user ? [{ icon: User, label: 'My Profile', path: '/account/profile' }] : []),
    ...(user ? [{ icon: Bell, label: 'Notifications', path: '/notifications' }] : []),
    { icon: Phone, label: 'My Bookings', path: '/requests' },
    ...(!isProvider && !isAdmin
      ? [{ icon: Wrench, label: 'Become a Provider', path: '/become-provider' }]
      : []),
    ...(isProvider
      ? [{ icon: LayoutDashboard, label: 'Provider Portal', path: '/provider/dashboard' }]
      : []),
    ...(isAdmin
      ? [{ icon: LayoutDashboard, label: 'Admin Panel', path: '/admin/dashboard' }]
      : []),
    ...(user ? [{ icon: MessageSquareWarning, label: 'Complaints', path: '/complaints' }] : []),
    { icon: HelpCircle, label: 'Support & FAQ', path: '/support' },
    { icon: FileText, label: 'Terms of Service', path: '/terms' },
    { icon: Shield, label: 'Privacy Policy', path: '/privacy' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('[S2B Services] Sign out failed:', error);
    }
  };

  const displayName = profile?.full_name?.trim() || user?.email?.split('@')[0] || 'S2B User';
  const detail = profile?.phone
    ? `+975 ${profile.phone}`
    : profile?.email ?? user?.email ?? 'Complete your profile';

  return (
    <div>
      <PageHeader title="Account" showBack={false} />

      <div className="px-4 py-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light">
            <User className="h-10 w-10 text-primary" />
          </div>

          {profileLoading ? (
            <>
              <div className="mt-3 h-5 w-28 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-4 w-44 animate-pulse rounded bg-muted" />
            </>
          ) : user ? (
            <>
              <h2 className="mt-3 text-lg font-bold text-foreground">{displayName}</h2>
              <p className="mt-0.5 text-sm text-foreground-muted">{detail}</p>
              {profile?.role && (
                <span className="mt-2 rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-semibold capitalize text-primary">
                  {profile.role.replace('_', ' ')}
                </span>
              )}
            </>
          ) : (
            <>
              <h2 className="mt-3 text-lg font-bold text-foreground">Guest User</h2>
              <p className="mt-0.5 text-sm text-foreground-muted">
                Sign in to manage bookings and provider applications
              </p>
              <div className="mt-4 grid w-full grid-cols-2 gap-3">
                <Button
                  onClick={() => navigate('/login')}
                  className="h-11 bg-primary text-white hover:bg-primary-dark"
                >
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Sign In
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/register')}
                  className="h-11"
                >
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Register
                </Button>
              </div>
              {!configured && (
                <p className="mt-3 text-xs leading-5 text-foreground-subtle">
                  Backend environment variables are not configured in this build yet.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="space-y-1 px-4 pb-6">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3.5 shadow-card transition-colors active:bg-muted"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <item.icon className="h-5 w-5 text-foreground" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-foreground-subtle" />
          </button>
        ))}

        {user && (
          <button
            onClick={handleSignOut}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-error/30 py-3 text-sm font-medium text-error transition-colors hover:bg-error-light"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
