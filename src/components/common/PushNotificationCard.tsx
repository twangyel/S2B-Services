import { useEffect, useState } from 'react';
import { BellOff, BellRing, CheckCircle2, Send, ShieldAlert } from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import {
  createTestPushNotification,
  disablePushNotifications,
  enablePushNotifications,
  getPushCapability,
  type PushCapability,
} from '@/lib/push-notifications';

const INITIAL_CAPABILITY: PushCapability = {
  supported: true,
  configured: true,
  permission: 'default',
  enabled: false,
};

export default function PushNotificationCard() {
  const [capability, setCapability] = useState<PushCapability>(INITIAL_CAPABILITY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refresh = async () => {
    setCapability(await getPushCapability());
    setLoading(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const enable = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await enablePushNotifications();
      setMessage({ type: 'success', text: 'Push notifications are enabled on this device.' });
      await refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to enable push notifications.' });
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await disablePushNotifications();
      setMessage({ type: 'success', text: 'Push notifications are disabled on this device.' });
      await refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to disable push notifications.' });
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    setBusy(true);
    setMessage(null);
    try {
      setMessage({ type: 'success', text: 'Test scheduled for about 8 seconds from now. Lock or leave the app immediately.' });
      await createTestPushNotification();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to create a test notification.' });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="mb-4 h-28 animate-pulse rounded-2xl bg-muted" />;
  }

  const unavailable = !capability.supported || !capability.configured;
  const blocked = capability.permission === 'denied';

  return (
    <div className="mb-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ${capability.enabled ? 'bg-success-light text-success' : 'bg-primary-light text-primary'}`}>
          {capability.enabled ? <CheckCircle2 className="h-5 w-5" /> : blocked ? <ShieldAlert className="h-5 w-5" /> : <BellRing className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-foreground">Closed-app notifications</h2>
          <p className="mt-1 text-xs leading-5 text-foreground-muted">
            {capability.enabled
              ? 'Booking, payment and support updates can reach this device even when the app is closed.'
              : blocked
                ? 'Notifications are blocked in browser settings. Allow them there, then reopen this page.'
                : unavailable
                  ? capability.configured
                    ? 'This browser does not support web push notifications.'
                    : 'Firebase push configuration has not been added to this deployment yet.'
                  : 'Enable alerts for important booking, provider, payment and support updates.'}
          </p>
        </div>
      </div>

      {message && <div className="mt-3"><AuthNotice type={message.type} message={message.text} /></div>}

      <div className="mt-4 flex gap-2">
        {!capability.enabled ? (
          <button
            type="button"
            onClick={() => void enable()}
            disabled={busy || unavailable || blocked}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BellRing className="h-4 w-4" />
            Enable notifications
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void sendTest()}
              disabled={busy}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-bold text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Send test
            </button>
            <button
              type="button"
              onClick={() => void disable()}
              disabled={busy}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-border px-3 text-xs font-semibold text-foreground-muted disabled:opacity-50"
            >
              <BellOff className="h-4 w-4" />
              Disable
            </button>
          </>
        )}
      </div>
    </div>
  );
}
