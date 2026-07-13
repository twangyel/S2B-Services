import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { CalendarClock, MapPin, Search, User } from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import StatusBadge from '@/components/common/StatusBadge';
import { fetchAdminRequests } from '@/lib/requests';
import { supabase } from '@/lib/supabase';
import type { CustomerRequest, RequestStatus } from '@/types';

const filters: Array<'all' | RequestStatus> = ['all', 'sent', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected'];

function formatDateTime(value: string | null): string {
  if (!value) return 'Time not set';
  return new Intl.DateTimeFormat('en-BT', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Thimphu' }).format(new Date(value));
}

export default function AdminRequests() {
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadRequests = useCallback(async () => {
    setErrorMessage('');
    try {
      setRequests(await fetchAdminRequests());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load platform requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRequests();
    }, 0);
    const channel = supabase
      .channel('admin-all-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => {
        void loadRequests();
      })
      .subscribe();
    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    return requests.filter((request) => {
      if (statusFilter !== 'all' && request.status !== statusFilter) return false;
      if (!query) return true;
      return [request.customerName, request.customerPhone, request.providerName, request.serviceName, request.location]
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [requests, search, statusFilter]);

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">All Requests</h2>
          <p className="text-xs text-foreground-muted">{requests.length} total bookings</p>
        </div>
      </div>
      {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}

      <div className="mb-3 rounded-xl bg-white p-3 shadow-card">
        <div className="flex h-10 items-center rounded-lg border border-border px-3">
          <Search className="mr-2 h-4 w-4 text-foreground-subtle" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer, provider or service" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map((filter) => (
            <button key={filter} type="button" onClick={() => setStatusFilter(filter)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusFilter === filter ? 'bg-primary text-white' : 'bg-muted text-foreground-muted'}`}>
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton variant="list" />
      ) : filteredRequests.length > 0 ? (
        <div className="space-y-2">
          {filteredRequests.map((request) => (
            <Link key={request.id} to={`/admin/requests/${request.id}`} className="block rounded-xl bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light"><User className="h-4 w-4 text-primary" /></div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">{request.customerName}</h3>
                    <p className="truncate text-xs text-foreground-muted">{request.serviceName} · {request.providerName}</p>
                  </div>
                </div>
                <StatusBadge status={request.status} size="sm" />
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-foreground-muted">{request.issueDescription}</p>
              <div className="mt-2 grid gap-1 text-[11px] text-foreground-subtle">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /><span className="truncate">{request.location}</span></span>
                <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />{formatDateTime(request.requestedFor)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={Search} title="No matching requests" description="Try a different status or search term." />
      )}
    </div>
  );
}
