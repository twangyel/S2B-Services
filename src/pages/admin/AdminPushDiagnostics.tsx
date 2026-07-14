import { useCallback, useEffect, useMemo, useState } from 'react';
import { BellRing, CheckCircle2, CircleOff, RefreshCw, TriangleAlert } from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import PageHeader from '@/components/common/PageHeader';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface PushTokenRow {
  id: string;
  platform: string;
  device_name: string | null;
  is_active: boolean;
  failure_count: number;
  last_seen_at: string;
  last_success_at: string | null;
  last_failed_at: string | null;
  last_error: string | null;
}

interface DeliveryLogRow {
  id: number;
  platform: string;
  delivery_status: 'sent' | 'failed' | 'skipped';
  response_code: number | null;
  error_code: string | null;
  error_message: string | null;
  attempted_at: string;
  notifications: { title: string } | { title: string }[] | null;
}

function formatDate(value: string | null): string {
  if (!value) return 'Never';
  return new Intl.DateTimeFormat('en-BT', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function notificationTitle(value: DeliveryLogRow['notifications']): string {
  if (Array.isArray(value)) return value[0]?.title ?? 'Notification';
  return value?.title ?? 'Notification';
}

export default function AdminPushDiagnostics() {
  const [tokens, setTokens] = useState<PushTokenRow[]>([]);
  const [logs, setLogs] = useState<DeliveryLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [referenceTime, setReferenceTime] = useState(0);

  const loadData = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    setErrorMessage('');

    try {
      const [tokenResult, logResult] = await Promise.all([
        supabase
          .from('push_tokens')
          .select('id, platform, device_name, is_active, failure_count, last_seen_at, last_success_at, last_failed_at, last_error')
          .order('last_seen_at', { ascending: false }),
        supabase
          .from('push_delivery_logs')
          .select('id, platform, delivery_status, response_code, error_code, error_message, attempted_at, notifications(title)')
          .order('attempted_at', { ascending: false })
          .limit(50),
      ]);

      if (tokenResult.error) throw tokenResult.error;
      if (logResult.error) throw logResult.error;

      setTokens((tokenResult.data ?? []) as PushTokenRow[]);
      setLogs((logResult.data ?? []) as unknown as DeliveryLogRow[]);
      setReferenceTime(Date.now());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load push diagnostics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  const metrics = useMemo(() => {
    const dayAgo = referenceTime - 24 * 60 * 60 * 1000;
    return {
      active: tokens.filter((token) => token.is_active).length,
      disabled: tokens.filter((token) => !token.is_active).length,
      sent: logs.filter((log) => log.delivery_status === 'sent' && new Date(log.attempted_at).getTime() >= dayAgo).length,
      failed: logs.filter((log) => log.delivery_status === 'failed' && new Date(log.attempted_at).getTime() >= dayAgo).length,
    };
  }, [logs, referenceTime, tokens]);

  if (loading) return <LoadingSkeleton variant="list" />;

  return (
    <div>
      <PageHeader
        title="Push Diagnostics"
        rightAction={(
          <button
            type="button"
            onClick={() => void loadData(true)}
            disabled={refreshing}
            className="flex h-9 w-9 items-center justify-center rounded-full text-primary disabled:opacity-50"
            aria-label="Refresh push diagnostics"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          </button>
        )}
      />

      <div className="space-y-4 px-4 py-4">
        {errorMessage && <AuthNotice type="error" message={errorMessage} />}

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Active devices', value: metrics.active, icon: BellRing, className: 'bg-primary-light text-primary' },
            { label: 'Disabled tokens', value: metrics.disabled, icon: CircleOff, className: 'bg-muted text-foreground-muted' },
            { label: 'Sent in 24h', value: metrics.sent, icon: CheckCircle2, className: 'bg-success-light text-success' },
            { label: 'Failed in 24h', value: metrics.failed, icon: TriangleAlert, className: 'bg-error-light text-error' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-white p-3.5 shadow-sm">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', item.className)}>
                <item.icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{item.value}</p>
              <p className="mt-0.5 text-xs text-foreground-muted">{item.label}</p>
            </div>
          ))}
        </div>

        <section className="rounded-xl border border-border bg-white shadow-sm">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-bold text-foreground">Recent delivery attempts</h2>
            <p className="mt-1 text-xs text-foreground-muted">Latest 50 FCM delivery results recorded by the Edge Function.</p>
          </div>

          {logs.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-foreground-muted">
              No delivery attempts yet. Enable push on a device and use Send test from Notifications.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 px-4 py-3">
                  <span className={cn(
                    'mt-1 h-2.5 w-2.5 flex-none rounded-full',
                    log.delivery_status === 'sent' ? 'bg-success' : 'bg-error'
                  )} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-foreground">{notificationTitle(log.notifications)}</p>
                      <span className="flex-none text-[10px] text-foreground-subtle">{formatDate(log.attempted_at)}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-foreground-muted">
                      {log.delivery_status === 'sent'
                        ? `${log.platform.toUpperCase()} · HTTP ${log.response_code ?? 200}`
                        : `${log.error_code ?? `HTTP ${log.response_code ?? 'error'}`} · ${log.error_message ?? 'Delivery failed'}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-white p-4 shadow-sm">
          <h2 className="text-sm font-bold text-foreground">Registered devices</h2>
          <p className="mt-1 text-xs text-foreground-muted">Tokens are automatically refreshed on sign-in and disabled when Firebase reports them as unregistered.</p>
          <div className="mt-3 space-y-2">
            {tokens.slice(0, 20).map((token) => (
              <div key={token.id} className="rounded-lg bg-muted/60 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold text-foreground">{token.device_name || `${token.platform} device`}</p>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-[10px] font-bold',
                    token.is_active ? 'bg-success-light text-success' : 'bg-error-light text-error'
                  )}>
                    {token.is_active ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-foreground-subtle">Last seen {formatDate(token.last_seen_at)} · Last success {formatDate(token.last_success_at)}</p>
                {token.last_error && <p className="mt-1 line-clamp-2 text-[10px] text-error">{token.last_error}</p>}
              </div>
            ))}
            {tokens.length === 0 && <p className="py-3 text-center text-xs text-foreground-muted">No push-enabled devices yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
