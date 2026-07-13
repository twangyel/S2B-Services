import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertTriangle, FilePlus2, LoaderCircle, Paperclip, Plus, X } from 'lucide-react';
import { useSearchParams } from 'react-router';
import AuthNotice from '@/components/auth/AuthNotice';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import {
  createComplaint,
  fetchCustomerComplaintRequests,
  fetchCustomerComplaints,
  type ComplaintRecord,
  type ComplaintRequestOption,
} from '@/lib/complaints';
import { supabase } from '@/lib/supabase';
import type { ComplaintType } from '@/types';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-BT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function Complaints() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedRequestId = searchParams.get('requestId') ?? '';
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([]);
  const [requests, setRequests] = useState<ComplaintRequestOption[]>([]);
  const [showForm, setShowForm] = useState(Boolean(requestedRequestId));
  const [requestId, setRequestId] = useState(requestedRequestId);
  const [type, setType] = useState<ComplaintType>('general');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = useCallback(async () => {
    if (!user) return;
    setErrorMessage('');
    try {
      const [nextComplaints, nextRequests] = await Promise.all([
        fetchCustomerComplaints(user.id),
        fetchCustomerComplaintRequests(user.id),
      ]);
      setComplaints(nextComplaints);
      setRequests(nextRequests);
      if (requestedRequestId && nextRequests.some((item) => item.id === requestedRequestId)) {
        setRequestId((current) => current || requestedRequestId);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load complaints.');
    } finally {
      setLoading(false);
    }
  }, [requestedRequestId, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    if (!user) return () => window.clearTimeout(timer);
    const channel = supabase
      .channel(`customer-complaints-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints', filter: `customer_id=eq.${user.id}` }, () => void loadData())
      .subscribe();
    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [loadData, user]);

  const selectedRequest = useMemo(
    () => requests.find((item) => item.id === requestId) ?? null,
    [requestId, requests]
  );

  const submitComplaint = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !selectedRequest) {
      setErrorMessage('Select the booking related to this complaint.');
      return;
    }
    if (description.trim().length < 20) {
      setErrorMessage('Please provide at least 20 characters describing the issue.');
      return;
    }
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await createComplaint({
        customerId: user.id,
        request: selectedRequest,
        type,
        description,
        files,
      });
      setSuccessMessage('Complaint submitted. The S2B Services team has been notified.');
      setShowForm(false);
      setRequestId('');
      setType('general');
      setDescription('');
      setFiles([]);
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Complaints"
        rightAction={
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="flex h-9 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-white"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? 'Close' : 'New'}
          </button>
        }
      />

      <div className="px-4 py-4">
        {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}
        {successMessage && <div className="mb-3"><AuthNotice type="success" message={successMessage} /></div>}

        {showForm && (
          <form onSubmit={(event) => void submitComplaint(event)} className="mb-5 rounded-xl border border-primary/20 bg-white p-4 shadow-card">
            <div className="flex items-center gap-2">
              <FilePlus2 className="h-5 w-5 text-primary" />
              <div>
                <h2 className="text-base font-bold text-foreground">Submit a Complaint</h2>
                <p className="text-xs text-foreground-muted">Link it to a booking so our team can investigate quickly.</p>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="complaint-booking">Related booking</Label>
              <select
                id="complaint-booking"
                value={requestId}
                onChange={(event) => setRequestId(event.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-input bg-white px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a booking</option>
                {requests.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.serviceName} · {request.providerName} · {request.status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <Label htmlFor="complaint-type">Complaint type</Label>
              <select
                id="complaint-type"
                value={type}
                onChange={(event) => setType(event.target.value as ComplaintType)}
                className="mt-1.5 h-11 w-full rounded-lg border border-input bg-white px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="general">General issue</option>
                <option value="quality">Service quality</option>
                <option value="urgent">Urgent or safety concern</option>
              </select>
            </div>

            <div className="mt-4">
              <Label htmlFor="complaint-description">What happened?</Label>
              <Textarea
                id="complaint-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe the issue, what you expected, and any attempts made to resolve it."
                className="mt-1.5 min-h-32"
                required
              />
              <p className="mt-1 text-right text-[11px] text-foreground-subtle">{description.trim().length}/20 minimum</p>
            </div>

            <div className="mt-4">
              <Label htmlFor="complaint-files">Evidence (optional)</Label>
              <label
                htmlFor="complaint-files"
                className="mt-1.5 flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-4 text-center"
              >
                <Paperclip className="h-5 w-5 text-primary" />
                <span className="mt-1 text-xs font-medium text-foreground">
                  {files.length > 0 ? `${files.length} file${files.length === 1 ? '' : 's'} selected` : 'Attach images or PDF'}
                </span>
                <span className="text-[11px] text-foreground-muted">Up to 5 files, 10 MB each</span>
              </label>
              <input
                id="complaint-files"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple
                className="hidden"
                onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 5))}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || !selectedRequest || description.trim().length < 20}
              className="mt-4 h-11 w-full bg-primary text-white hover:bg-primary-dark"
            >
              {submitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Submit Complaint
            </Button>
          </form>
        )}

        {loading ? (
          <LoadingSkeleton variant="list" />
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No complaints"
            description="Complaints linked to your bookings will appear here with their resolution status."
            action={{ label: 'Submit a Complaint', onClick: () => setShowForm(true) }}
          />
        ) : (
          <div className="space-y-3">
            {complaints.map((complaint) => (
              <article key={complaint.id} className="rounded-xl bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{complaint.providerName}</p>
                    <p className="mt-0.5 text-xs capitalize text-foreground-muted">{complaint.type} complaint · {formatDate(complaint.createdAt)}</p>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground-muted">{complaint.description}</p>
                {complaint.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {complaint.attachments.map((attachment, index) => attachment.url && (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-primary"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        Evidence {index + 1}
                      </a>
                    ))}
                  </div>
                )}
                {complaint.resolution && (
                  <div className="mt-3 rounded-lg bg-success-light p-3">
                    <p className="text-xs font-semibold text-success">Resolution</p>
                    <p className="mt-1 text-xs leading-5 text-foreground-muted">{complaint.resolution}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
