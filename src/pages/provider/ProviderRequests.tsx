import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CalendarClock, ClipboardList, MapPin, Phone } from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { fetchProviderIdForUser, fetchProviderRequests, updateRequestStatus } from '@/lib/requests';
import { supabase } from '@/lib/supabase';
import type { CustomerRequest } from '@/types';

type ProviderRequestTab = 'new' | 'active' | 'history';

function formatDateTime(value: string | null): string {
  if (!value) return 'Time not set';
  return new Intl.DateTimeFormat('en-BT', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Thimphu' }).format(new Date(value));
}

export default function ProviderRequests() {
  const { user } = useAuth();
  const [providerId, setProviderId] = useState('');
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [activeTab, setActiveTab] = useState<ProviderRequestTab>('new');
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadRequests = useCallback(async () => {
    if (!user) return;
    setErrorMessage('');
    try {
      const nextProviderId = providerId || await fetchProviderIdForUser(user.id);
      if (!providerId) setProviderId(nextProviderId);
      setRequests(await fetchProviderRequests(nextProviderId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load customer requests.');
    } finally {
      setLoading(false);
    }
  }, [providerId, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRequests();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadRequests]);

  useEffect(() => {
    if (!providerId) return undefined;
    const channel = supabase
      .channel(`provider-requests-${providerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests', filter: `provider_id=eq.${providerId}` }, () => {
        void loadRequests();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadRequests, providerId]);

  const filteredRequests = useMemo(() => requests.filter((request) => {
    if (activeTab === 'new') return request.status === 'sent';
    if (activeTab === 'active') return ['accepted', 'in_progress'].includes(request.status);
    return ['completed', 'cancelled', 'rejected'].includes(request.status);
  }), [activeTab, requests]);

  const counts = useMemo(() => ({
    new: requests.filter((request) => request.status === 'sent').length,
    active: requests.filter((request) => ['accepted', 'in_progress'].includes(request.status)).length,
    history: requests.filter((request) => ['completed', 'cancelled', 'rejected'].includes(request.status)).length,
  }), [requests]);

  const quickAccept = async (requestId: string) => {
    setWorkingId(requestId);
    setErrorMessage('');
    try {
      await updateRequestStatus(requestId, 'accepted');
      await loadRequests();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to accept request.');
    } finally {
      setWorkingId('');
    }
  };

  return (
    <div className="px-4 py-4">
      <h2 className="mb-3 text-lg font-bold text-foreground">Customer Requests</h2>
      {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}

      <div className="mb-3 flex items-center gap-2 rounded-xl bg-white p-1 shadow-card">
        {(['new', 'active', 'history'] as ProviderRequestTab[]).map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold capitalize ${activeTab === tab ? 'bg-primary text-white' : 'text-foreground-muted'}`}>
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton variant="list" />
      ) : filteredRequests.length > 0 ? (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <div key={request.id} className="rounded-xl bg-white p-4 shadow-card">
              <Link to={`/provider/requests/${request.id}`} className="block">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">{request.serviceName}</h3>
                    <p className="text-xs text-foreground-muted">{request.customerName} · +975 {request.customerPhone}</p>
                  </div>
                  <StatusBadge status={request.status} size="sm" />
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-foreground-muted">{request.issueDescription}</p>
                <div className="mt-2 space-y-1 text-[11px] text-foreground-subtle">
                  <div className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />{formatDateTime(request.requestedFor)}</div>
                  <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /><span className="truncate">{request.location}</span></div>
                </div>
              </Link>
              <div className="mt-3 flex gap-2">
                <a href={`tel:+975${request.customerPhone.replace(/\D/g, '')}`} className="flex h-9 flex-1 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-white"><Phone className="mr-1 h-3.5 w-3.5" />Call</a>
                {request.status === 'sent' ? (
                  <Button size="sm" variant="outline" disabled={workingId === request.id} onClick={() => void quickAccept(request.id)} className="h-9 flex-1">Accept</Button>
                ) : (
                  <Link to={`/provider/requests/${request.id}`} className="flex h-9 flex-1 items-center justify-center rounded-lg border border-border text-xs font-semibold text-foreground">Manage</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={ClipboardList} title={`No ${activeTab} requests`} description="Customer requests will appear here automatically." />
      )}
    </div>
  );
}
