import { useCallback, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { fetchUnreadNotificationCount } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
  iconClassName?: string;
}

export default function NotificationBell({ className, iconClassName }: NotificationBellProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const loadCount = useCallback(async () => {
    if (!user) {
      setCount(0);
      return;
    }
    try {
      setCount(await fetchUnreadNotificationCount(user.id));
    } catch (error) {
      console.error('[S2B Services] Unable to load notification count:', error);
    }
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCount();
    }, 0);
    if (!user) return () => window.clearTimeout(timer);

    const channel = supabase
      .channel(`notification-bell-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => void loadCount()
      )
      .subscribe();

    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [loadCount, user]);

  if (!user) return null;

  return (
    <button
      type="button"
      onClick={() => navigate('/notifications')}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-full transition-colors active:bg-muted',
        className
      )}
      aria-label={count > 0 ? `${count} unread notifications` : 'Notifications'}
    >
      <Bell className={cn('h-5 w-5 text-foreground', iconClassName)} />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
