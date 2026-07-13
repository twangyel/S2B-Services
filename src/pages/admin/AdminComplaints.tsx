import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, LoaderCircle, Search, ShieldAlert, X } from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { fetchAllComplaints, updateComplaintStatus, type ComplaintRecord } from '@/lib/complaints';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import type { ComplaintStatus } from '@/types';

const filters = ['all', 'open', 'escalated', 'resolved'] as const;
type Filter = (typeof filters)[number];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-BT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function AdminComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [filter, setFilter] = useState<Filter>('open');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ComplaintRecord | null>(null);
  const [nextStatus, setNextStatus] = useState<ComplaintStatus>('resolved');
  const [resolution, setResolution] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadComplaints = useCallback(async () => {
    setErrorMessage('');
    try {
      setComplaints(await fetchAllComplaints());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load complaints.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadComplaints();
    }, 0);
    const channel = supabase
      .channel('admin-complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => void loadComplaints())
      .subscribe();
    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [loadComplaints]);

  const visibleComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();
    return complaints.filter((complaint) => {
      if (filter !== 'all' && complaint.status !== filter) return false;
      if (!query) return true;
      return [complaint.providerName, complaint.customerName, complaint.customerPhone, complaint.description]
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [complaints, filter, search]);

  const openResolution = (complaint: ComplaintRecord, status: ComplaintStatus) => {
    setSelected(complaint);
    setNextStatus(status);
    setResolution(complaint.resolution ?? '');
  };

  const saveStatus = async () => {
    if (!selected || !user) return;
    if (nextStatus === 'resolved' && resolution.trim().length < 5) {
      setErrorMessage('Add a clear resolution before marking the complaint resolved.');
      return;
    }
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await updateComplaintStatus({
        complaintId: selected.id,
        adminId: user.id,
        status: nextStatus,
        resolution,
      });
      setSuccessMessage(`Complaint marked ${nextStatus}. Customer and provider were notified.`);
      setSelected(null);
      await loadComplaints();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update complaint.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="list" />;

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground">Complaints & Disputes</h2>
        <p className="mt-0.5 text-xs text-foreground-muted">Review customer issues and record resolutions</p>
      </div>

      {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}
      {successMessage && <div className="mb-3"><AuthNotice type="success" message={successMessage} /></div>}

      <div className="mb-3 flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3">
        <Search className="h-4 w-4 text-foreground-subtle" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search customer, provider or issue"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
        />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              'rounded-full px-3 py-1.5 text-xs font-semibold capitalize',
              filter === item ? 'bg-primary text-white' : 'bg-muted text-foreground-muted'
            )}
          >
            {item}
            <span className="ml-1 opacity-70">
              {item === 'all' ? complaints.length : complaints.filter((complaint) => complaint.status === item).length}
            </span>
          </button>
        ))}
      </div>

      {visibleComplaints.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No complaints found"
          description="There are no complaints matching the selected filter."
        />
      ) : (
        <div className="space-y-3">
          {visibleComplaints.map((complaint) => (
            <article key={complaint.id} className="rounded-xl bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className={cn('h-4 w-4', complaint.type === 'urgent' ? 'text-error' : 'text-warning')} />
                    <h3 className="truncate text-sm font-semibold text-foreground">{complaint.customerName}</h3>
                  </div>
                  <p className="mt-0.5 text-xs text-foreground-muted">Against {complaint.providerName} · {formatDate(complaint.createdAt)}</p>
                </div>
                <StatusBadge status={complaint.status} />
              </div>

              <div className="mt-3 rounded-lg bg-muted p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground-subtle">{complaint.type} complaint</p>
                <p className="mt-1 text-sm leading-6 text-foreground-muted">{complaint.description}</p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-foreground-muted">Customer</span><p className="font-medium text-foreground">{complaint.customerPhone || 'No phone'}</p></div>
                <div><span className="text-foreground-muted">Provider</span><p className="font-medium text-foreground">{complaint.providerName}</p></div>
              </div>

              {complaint.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {complaint.attachments.map((attachment, index) => attachment.url && (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-primary"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Evidence {index + 1}
                    </a>
                  ))}
                </div>
              )}

              {complaint.resolution && (
                <div className="mt-3 rounded-lg bg-success-light p-3">
                  <p className="text-xs font-semibold text-success">Recorded Resolution</p>
                  <p className="mt-1 text-xs leading-5 text-foreground-muted">{complaint.resolution}</p>
                </div>
              )}

              {complaint.status !== 'resolved' && (
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openResolution(complaint, 'escalated')}
                    className="h-10 flex-1"
                  >
                    Escalate
                  </Button>
                  <Button
                    type="button"
                    onClick={() => openResolution(complaint, 'resolved')}
                    className="h-10 flex-1 bg-success text-white hover:bg-success/90"
                  >
                    Resolve
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold capitalize text-foreground">{nextStatus} Complaint</h3>
                <p className="mt-1 text-xs text-foreground-muted">{selected.customerName} · {selected.providerName}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="flex h-8 w-8 items-center justify-center rounded-full active:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>
            <Textarea
              value={resolution}
              onChange={(event) => setResolution(event.target.value)}
              placeholder={nextStatus === 'resolved' ? 'Describe the final resolution and any action taken.' : 'Add an escalation note or next action.'}
              className="mt-4 min-h-28"
            />
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="outline" onClick={() => setSelected(null)} className="h-11 flex-1">Cancel</Button>
              <Button
                type="button"
                onClick={() => void saveStatus()}
                disabled={saving || (nextStatus === 'resolved' && resolution.trim().length < 5)}
                className="h-11 flex-1 bg-primary text-white hover:bg-primary-dark"
              >
                {saving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Save Status
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
