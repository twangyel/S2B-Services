import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, ChevronRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import AuthNotice from '@/components/auth/AuthNotice';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import PageHeader from '@/components/common/PageHeader';
import { useAuth } from '@/hooks/use-auth';
import {
  deleteNotification,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

function formatDate(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return new Intl.DateTimeFormat('en-BT', {
    ...(sameDay ? {} : { day: 'numeric', month: 'short' }),
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setErrorMessage('');
    try {
      setItems(await fetchNotifications(user.id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotifications();
    }, 0);
    if (!user) return () => window.clearTimeout(timer);

    const channel = supabase
      .channel(`notification-page-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => void loadNotifications()
      )
      .subscribe();

    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [loadNotifications, user]);

  const unreadCount = useMemo(() => items.filter((item) => !item.isRead).length, [items]);

  const openNotification = async (item: AppNotification) => {
    if (!item.isRead) {
      try {
        await markNotificationRead(item.id);
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, isRead: true } : entry));
      } catch (error) {
        console.error('[S2B Services] Unable to mark notification read:', error);
      }
    }
    if (item.actionPath) navigate(item.actionPath);
  };

  const markAll = async () => {
    if (!user || unreadCount === 0) return;
    setBusy(true);
    try {
      await markAllNotificationsRead(user.id);
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to mark notifications read.');
    } finally {
      setBusy(false);
    }
  };

  const removeItem = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setItems((current) => current.filter((item) => item.id !== notificationId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete notification.');
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg bg-white">
      <PageHeader
        title="Notifications"
        rightAction={unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => void markAll()}
            disabled={busy}
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-primary disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all
          </button>
        ) : undefined}
      />

      <div className="px-4 py-4">
        {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}
        {loading ? (
          <LoadingSkeleton variant="list" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="Booking, provider, subscription and support updates will appear here."
          />
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'group flex items-start gap-3 rounded-xl border p-3.5 transition-colors',
                  item.isRead ? 'border-border bg-white' : 'border-primary/20 bg-primary-light/40'
                )}
              >
                <button
                  type="button"
                  onClick={() => void openNotification(item)}
                  className="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  <span className={cn(
                    'mt-1 h-2 w-2 flex-none rounded-full',
                    item.isRead ? 'bg-border' : 'bg-primary'
                  )} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{item.title}</span>
                      <span className="flex-none text-[10px] text-foreground-subtle">{formatDate(item.createdAt)}</span>
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-foreground-muted">{item.message}</span>
                  </span>
                  {item.actionPath && <ChevronRight className="mt-1 h-4 w-4 flex-none text-foreground-subtle" />}
                </button>
                <button
                  type="button"
                  onClick={() => void removeItem(item.id)}
                  className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full text-foreground-subtle transition-colors hover:bg-error-light hover:text-error"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
