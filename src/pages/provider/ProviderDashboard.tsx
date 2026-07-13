import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ClipboardList,
  LoaderCircle,
  MapPin,
  Star,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import StatusBadge from '@/components/common/StatusBadge';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import type { RequestStatus } from '@/types';

interface ProviderSummary {
  id: string;
  display_name: string;
  availability_status: 'available' | 'busy' | 'offline' | 'emergency_only';
  average_rating: number | string;
  review_count: number;
}

interface RecentRequest {
  id: string;
  customer_name_snapshot: string;
  issue_description: string;
  location_text: string;
  status: RequestStatus;
  created_at: string;
}

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [provider, setProvider] = useState<ProviderSummary | null>(null);
  const [requests, setRequests] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const { data: providerData, error: providerError } = await supabase
        .from('provider_profiles')
        .select('id, display_name, availability_status, average_rating, review_count')
        .eq('user_id', user.id)
        .single();
      if (providerError) throw providerError;
      const nextProvider = providerData as ProviderSummary;

      const { data: requestData, error: requestError } = await supabase
        .from('service_requests')
        .select('id, customer_name_snapshot, issue_description, location_text, status, created_at')
        .eq('provider_id', nextProvider.id)
        .order('created_at', { ascending: false });
      if (requestError) throw requestError;

      setProvider(nextProvider);
      setRequests((requestData ?? []) as RecentRequest[]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load provider dashboard.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const activeRequests = useMemo(
    () => requests.filter((request) => ['sent', 'accepted', 'in_progress'].includes(request.status)).length,
    [requests]
  );

  const toggleAvailability = async () => {
    if (!provider) return;
    const nextStatus = provider.availability_status === 'offline' ? 'available' : 'offline';
    setUpdatingStatus(true);
    setErrorMessage('');
    const { error } = await supabase
      .from('provider_profiles')
      .update({ availability_status: nextStatus })
      .eq('id', provider.id);
    setUpdatingStatus(false);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setProvider({ ...provider, availability_status: nextStatus });
  };

  if (loading) return <LoadingSkeleton variant="stats" />;
  if (!provider) return <div className="p-4"><AuthNotice type="error" message={errorMessage || 'Provider profile not found.'} /></div>;

  const isOnline = provider.availability_status !== 'offline';
  const stats = [
    { icon: ClipboardList, label: 'Total Requests', value: String(requests.length), color: 'text-primary', bg: 'bg-primary-light' },
    { icon: TrendingUp, label: 'Active Requests', value: String(activeRequests), color: 'text-success', bg: 'bg-success-light' },
    { icon: Star, label: 'Rating', value: Number(provider.average_rating).toFixed(1), color: 'text-warning', bg: 'bg-warning-light' },
    { icon: Star, label: 'Reviews', value: String(provider.review_count), color: 'text-info', bg: 'bg-info-light' },
  ];

  return (
    <div className="px-4 py-4">
      {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}

      <div className="mb-4 flex items-center justify-between rounded-xl bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className={cn('h-3 w-3 rounded-full', isOnline ? 'bg-success' : 'bg-error')} />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isOnline ? 'You are Online' : 'You are Offline'}
            </p>
            <p className="text-xs text-foreground-muted">
              {isOnline ? 'Customers can find your profile' : 'Your profile is hidden by availability filters'}
            </p>
          </div>
        </div>
        <button onClick={() => void toggleAvailability()} disabled={updatingStatus} aria-label="Toggle availability">
          {updatingStatus ? (
            <LoaderCircle className="h-7 w-7 animate-spin text-primary" />
          ) : isOnline ? (
            <ToggleRight className="h-8 w-8 text-success" />
          ) : (
            <ToggleLeft className="h-8 w-8 text-foreground-subtle" />
          )}
        </button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white p-4 shadow-card">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.bg)}>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-xs text-foreground-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-sm font-bold text-foreground">Recent Requests</h2>
          <span className="text-xs font-medium text-primary">Latest 5</span>
        </div>
        <div className="divide-y divide-border">
          {requests.length > 0 ? (
            requests.slice(0, 5).map((request) => (
              <div key={request.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{request.customer_name_snapshot}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-foreground-muted">{request.issue_description}</p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-foreground-subtle">
                    <MapPin className="h-3 w-3" />
                    {request.location_text}
                  </div>
                </div>
                <StatusBadge status={request.status} size="sm" />
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-foreground-muted">No customer requests yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
