import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { subscribeToForegroundPush, syncExistingPushToken } from '@/lib/push-notifications';

export default function PushTokenSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return undefined;

    void syncExistingPushToken().catch((error) => {
      console.warn('[S2B Services] Unable to refresh push token:', error);
    });

    let unsubscribe: (() => void) | null = null;
    let active = true;

    void subscribeToForegroundPush((payload) => {
      const title = payload.notification?.title || payload.data?.title || 'S2B Services';
      const description = payload.notification?.body || payload.data?.body;
      toast(title, description ? { description } : undefined);
    }).then((listener) => {
      if (!active) listener?.();
      else unsubscribe = listener;
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [user]);

  return null;
}
