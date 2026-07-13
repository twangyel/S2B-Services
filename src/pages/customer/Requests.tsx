import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { CalendarClock, ClipboardList, MapPin, RefreshCw } from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import { useAuth } from '@/hooks/use-auth';
import { fetchCustomerRequests } from '@/lib/requests';
import { supabase } from '@/lib/supabase';
import type { CustomerRequest } from '@/types';

type RequestTab = 'active' | 'completed' | 'closed';

const activeStatuses = ['sent', 'accepted', 'in_progress'];
const closedStatuses = ['cancelled', 'rejected'];

function formatDateTime(value: string | null): string {
  if (!value) return 'Time not set';
  return new Intl.DateTimeFormat('en-BT', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Thimphu',
  }).format(new Date(value));
}

export default function Requests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [activeTab, setActiveTab] = useState<RequestTab>('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadRequests = useCallback(async (background = false) => {
    if (!user) return;
    if (background) setRefreshing(true);
    else setLoading(true);
    setErrorMessage('');
    try {
      setRequests(await fetchCustomerRequests(user.id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load your bookings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRequests();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadRequests]);

  useEffect(() => {
    if (!user) return undefined;
    const channel = supabase
      .channel(`customer-requests-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests', filter: `customer_id=eq.${user.id}` }, () => {
        void loadRequests(true);
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadRequests, user]);

  const filteredRequests = useMemo(() => requests.filter((request) => {
    if (activeTab === 'active') return activeStatuses.includes(request.status);
    if (activeTab === 'completed') return request.status === 'completed';
    return closedStatuses.includes(request.status);
  }), [activeTab, requests]);

  const counts = useMemo(() => ({
    active: requests.filter((request) => activeStatuses.includes(request.status)).length,
    completed: requests.filter((request) => request.status === 'completed').length,
    closed: requests.filter((request) => closedStatuses.includes(request.status)).length,
  }), [requests]);

  return (
    <div>
      <PageHeader title="My Bookings" showBack={false} />
      <div className="px-4 py-3">
        {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}

        <div className="mb-3 flex items-center gap-2 rounded-xl bg-white p-1 shadow-card">
          {(['active', 'completed', 'closed'] as RequestTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold capitalize ${
                activeTab === tab ? 'bg-primary text-white' : 'text-foreground-muted'
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSkeleton variant="list" />
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-2">
            {filteredRequests.map((request) => (
              <Link key={request.id} to={`/requests/${request.id}`} className="block rounded-xl bg-white p-4 shadow-card transition active:scale-[0.99]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">{request.serviceName}</h3>
                    <p className="mt-0.5 truncate text-xs text-foreground-muted">{request.providerName}</p>
                  </div>
                  <StatusBadge status={request.status} size="sm" />
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground-muted">{request.issueDescription}</p>
                <div className="mt-2 space-y-1 text-[11px] text-foreground-subtle">
                  <div className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />{formatDateTime(request.requestedFor)}</div>
                  <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /><span className="truncate">{request.location}</span></div>
                </div>
                {request.estimatedAmount != null && (
                  <p className="mt-2 text-xs font-semibold text-primary">Estimate: Nu. {request.estimatedAmount.toLocaleString()}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title={activeTab === 'active' ? 'No active bookings' : `No ${activeTab} bookings`}
            description={activeTab === 'active' ? 'Choose a verified provider and send your first service request.' : 'Bookings will appear here when their status changes.'}
            action={activeTab === 'active' ? { label: 'Browse Services', onClick: () => navigate('/services') } : undefined}
          />
        )}

        {!loading && requests.length > 0 && (
          <button type="button" onClick={() => void loadRequests(true)} disabled={refreshing} className="mx-auto mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />Refresh bookings
          </button>
        )}
      </div>
    </div>
  );
}
