import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileImage,
  LoaderCircle,
  MapPin,
  MessageSquareText,
  Phone,
  Star,
  UserRound,
  XCircle,
} from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { fetchProvider } from '@/lib/catalog';
import {
  fetchRequest,
  fetchRequestAttachments,
  fetchRequestHistory,
  fetchReviewForRequest,
  submitRequestReview,
  updateRequestStatus,
  type RequestAttachment,
  type RequestHistoryItem,
  type RequestReview,
} from '@/lib/requests';
import { supabase } from '@/lib/supabase';
import type { CustomerRequest, Provider, RequestStatus } from '@/types';

const statusLabels: Record<RequestStatus, string> = {
  draft: 'Draft',
  sent: 'Request sent',
  accepted: 'Accepted by provider',
  rejected: 'Rejected by provider',
  in_progress: 'Work in progress',
  completed: 'Service completed',
  cancelled: 'Booking cancelled',
};

const allStatuses: RequestStatus[] = ['draft', 'sent', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'];

function formatDateTime(value: string | null): string {
  if (!value) return 'Not specified';
  return new Intl.DateTimeFormat('en-BT', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Thimphu',
  }).format(new Date(value));
}

export default function RequestDetails() {
  const { requestId } = useParams<{ requestId: string }>();
  const location = useLocation();
  const { user, profile } = useAuth();
  const [request, setRequest] = useState<CustomerRequest | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [currentProviderId, setCurrentProviderId] = useState('');
  const [attachments, setAttachments] = useState<RequestAttachment[]>([]);
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [review, setReview] = useState<RequestReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    (location.state as { created?: boolean } | null)?.created ? 'Your booking request was sent successfully.' : ''
  );
  const [providerNote, setProviderNote] = useState('');
  const [estimatedAmount, setEstimatedAmount] = useState('');
  const [adminStatus, setAdminStatus] = useState<RequestStatus>('sent');
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const role = profile?.role ?? 'customer';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isProviderRole = role === 'provider';
  const isProvider = isProviderRole && currentProviderId !== '' && currentProviderId === request?.providerId;
  const isCustomerOwner = Boolean(user && request?.customerId === user.id);

  const backPath = useMemo(() => {
    if (location.pathname.startsWith('/provider/')) return '/provider/requests';
    if (location.pathname.startsWith('/admin/')) return '/admin/requests';
    return '/requests';
  }, [location.pathname]);

  const loadDetails = useCallback(async () => {
    if (!requestId) return;
    setErrorMessage('');
    try {
      const nextRequest = await fetchRequest(requestId);
      setRequest(nextRequest);
      if (!nextRequest) return;
      setProviderNote(nextRequest.providerNote ?? '');
      setEstimatedAmount(nextRequest.estimatedAmount == null ? '' : String(nextRequest.estimatedAmount));
      setAdminStatus(nextRequest.status);

      const [nextAttachments, nextHistory, nextReview, nextProvider] = await Promise.all([
        fetchRequestAttachments(requestId),
        fetchRequestHistory(requestId),
        fetchReviewForRequest(requestId),
        fetchProvider(nextRequest.providerId),
      ]);
      setAttachments(nextAttachments);
      setHistory(nextHistory);
      setReview(nextReview);
      setProvider(nextProvider);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load booking details.');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDetails();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadDetails]);

  useEffect(() => {
    if (!user || !isProviderRole) return undefined;
    let active = true;
    void supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setCurrentProviderId(data?.id ? String(data.id) : '');
      });
    return () => {
      active = false;
    };
  }, [isProviderRole, user]);

  useEffect(() => {
    if (!requestId) return undefined;
    const channel = supabase
      .channel(`request-details-${requestId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests', filter: `id=eq.${requestId}` }, () => {
        void loadDetails();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'request_status_history', filter: `request_id=eq.${requestId}` }, () => {
        void loadDetails();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `request_id=eq.${requestId}` }, () => {
        void loadDetails();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadDetails, requestId]);

  const runStatusUpdate = async (status: RequestStatus, note?: string) => {
    if (!request) return;
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const amount = estimatedAmount.trim() === '' ? null : Number(estimatedAmount);
      if (estimatedAmount.trim() !== '' && (!Number.isFinite(amount) || Number(amount) < 0)) {
        throw new Error('Enter a valid estimated amount.');
      }
      await updateRequestStatus(request.id, status, {
        providerNote: note ?? providerNote,
        estimatedAmount: isProvider || isAdmin ? amount : undefined,
      });
      setSuccessMessage(`Booking updated to ${statusLabels[status].toLowerCase()}.`);
      await loadDetails();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update this booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitReview = async () => {
    if (!request || !user || !profile) return;
    setSubmitting(true);
    setErrorMessage('');
    try {
      await submitRequestReview(request.id, user.id, request.providerId, profile.full_name, rating, reviewComment);
      setSuccessMessage('Thank you. Your review has been published.');
      await loadDetails();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to submit your review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Booking Details" />
        <LoadingSkeleton variant="profile" />
      </div>
    );
  }

  if (!request) {
    return (
      <div>
        <PageHeader title="Booking Details" />
        <EmptyState icon={FileImage} title="Booking not found" description="This booking is unavailable or you do not have access to it." />
      </div>
    );
  }

  const customerPhone = request.customerPhone.replace(/\D/g, '');
  const providerPhone = provider?.phone?.replace(/\D/g, '') ?? '';

  return (
    <div className="pb-8">
      <PageHeader title="Booking Details" />
      <div className="space-y-3 px-4 py-4">
        <Link to={backPath} className="inline-flex text-xs font-semibold text-primary">← Back to bookings</Link>
        {successMessage && <AuthNotice type="success" message={successMessage} />}
        {errorMessage && <AuthNotice type="error" message={errorMessage} />}

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{request.serviceName}</p>
              <h1 className="mt-1 text-lg font-bold text-foreground">{isProvider ? request.customerName : request.providerName}</h1>
              <p className="mt-0.5 text-xs text-foreground-muted">Booking #{request.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <StatusBadge status={request.status} size="md" />
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground-muted">{request.issueDescription}</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="text-sm font-bold text-foreground">Visit details</h2>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex items-start gap-2.5">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div><p className="text-xs text-foreground-muted">Preferred service time</p><p className="font-medium text-foreground">{formatDateTime(request.requestedFor)}</p></div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div><p className="text-xs text-foreground-muted">Location</p><p className="font-medium text-foreground">{request.location}</p></div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div><p className="text-xs text-foreground-muted">Urgency</p><p className="font-medium capitalize text-foreground">{request.urgency}</p></div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light"><UserRound className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-xs text-foreground-muted">{isProvider ? 'Customer' : 'Service provider'}</p>
                <p className="text-sm font-semibold text-foreground">{isProvider ? request.customerName : request.providerName}</p>
              </div>
            </div>
            {(isProvider ? customerPhone : providerPhone) && (
              <a href={`tel:+975${isProvider ? customerPhone : providerPhone}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-success-light text-success" aria-label="Call">
                <Phone className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {(request.estimatedAmount != null || request.providerNote) && (
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="text-sm font-bold text-foreground">Provider update</h2>
            {request.estimatedAmount != null && <p className="mt-2 text-sm text-foreground">Estimated cost: <span className="font-bold text-primary">Nu. {request.estimatedAmount.toLocaleString()}</span></p>}
            {request.providerNote && <p className="mt-2 whitespace-pre-wrap text-sm text-foreground-muted">{request.providerNote}</p>}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="text-sm font-bold text-foreground">Attached photos</h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {attachments.map((attachment) => (
                <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer" className="aspect-square overflow-hidden rounded-xl bg-muted">
                  <img src={attachment.url} alt="Booking attachment" className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {isProvider && ['sent', 'accepted', 'in_progress'].includes(request.status) && (
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="text-sm font-bold text-foreground">Manage booking</h2>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-medium text-foreground-muted">Estimated amount (optional)</span>
              <input type="number" min="0" value={estimatedAmount} onChange={(event) => setEstimatedAmount(event.target.value)} placeholder="Nu." className="h-11 w-full rounded-xl border border-border px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </label>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-xs font-medium text-foreground-muted">Note to customer</span>
              <textarea value={providerNote} onChange={(event) => setProviderNote(event.target.value)} rows={3} placeholder="Confirm timing, materials or other details" className="w-full resize-none rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {request.status === 'sent' && (
                <>
                  <Button disabled={submitting} onClick={() => void runStatusUpdate('accepted')} className="bg-success text-white hover:bg-success/90"><CheckCircle2 className="mr-1.5 h-4 w-4" />Accept</Button>
                  <Button disabled={submitting} variant="outline" onClick={() => void runStatusUpdate('rejected')} className="border-error text-error"><XCircle className="mr-1.5 h-4 w-4" />Reject</Button>
                </>
              )}
              {request.status === 'accepted' && (
                <>
                  <Button disabled={submitting} onClick={() => void runStatusUpdate('in_progress')} className="bg-primary text-white hover:bg-primary-dark">Start Work</Button>
                  <Button disabled={submitting} variant="outline" onClick={() => void runStatusUpdate('cancelled')} className="border-error text-error">Cancel</Button>
                </>
              )}
              {request.status === 'in_progress' && (
                <>
                  <Button disabled={submitting} onClick={() => void runStatusUpdate('completed')} className="bg-success text-white hover:bg-success/90">Complete</Button>
                  <Button disabled={submitting} variant="outline" onClick={() => void runStatusUpdate('cancelled')} className="border-error text-error">Cancel</Button>
                </>
              )}
            </div>
          </div>
        )}

        {isCustomerOwner && ['sent', 'accepted'].includes(request.status) && (
          <Button disabled={submitting} variant="outline" onClick={() => void runStatusUpdate('cancelled')} className="h-11 w-full border-error text-error">Cancel Booking</Button>
        )}

        {isCustomerOwner && ['accepted', 'in_progress', 'completed', 'cancelled'].includes(request.status) && (
          <Link
            to={`/complaints?requestId=${request.id}`}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-warning/40 bg-warning-light text-sm font-semibold text-warning"
          >
            <AlertTriangle className="h-4 w-4" />
            Report a Problem
          </Link>
        )}

        {isAdmin && (
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="text-sm font-bold text-foreground">Admin control</h2>
            <div className="mt-3 flex gap-2">
              <select value={adminStatus} onChange={(event) => setAdminStatus(event.target.value as RequestStatus)} className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-white px-3 text-sm outline-none">
                {allStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
              </select>
              <Button disabled={submitting || adminStatus === request.status} onClick={() => void runStatusUpdate(adminStatus)} className="bg-primary text-white hover:bg-primary-dark">Update</Button>
            </div>
          </div>
        )}

        {isCustomerOwner && request.status === 'completed' && !review && (
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <h2 className="text-sm font-bold text-foreground">Rate this service</h2>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" onClick={() => setRating(value)} className="p-1" aria-label={`${value} stars`}>
                  <Star className={`h-7 w-7 ${value <= rating ? 'fill-warning text-warning' : 'text-border'}`} />
                </button>
              ))}
            </div>
            <textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} rows={3} placeholder="Share your experience (optional)" className="mt-3 w-full resize-none rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
            <Button disabled={submitting} onClick={() => void submitReview()} className="mt-3 w-full bg-primary text-white hover:bg-primary-dark">Submit Review</Button>
          </div>
        )}

        {review && (
          <div className="rounded-2xl bg-white p-4 shadow-card">
            <div className="flex items-center gap-2"><MessageSquareText className="h-4 w-4 text-primary" /><h2 className="text-sm font-bold text-foreground">Customer review</h2></div>
            <div className="mt-2 flex items-center gap-1">{[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-4 w-4 ${value <= review.rating ? 'fill-warning text-warning' : 'text-border'}`} />)}</div>
            {review.comment && <p className="mt-2 text-sm text-foreground-muted">{review.comment}</p>}
          </div>
        )}

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="text-sm font-bold text-foreground">Status history</h2>
          <div className="mt-3 space-y-0">
            {history.map((item, index) => (
              <div key={item.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  {index < history.length - 1 && <div className="min-h-10 w-px flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-foreground">{statusLabels[item.newStatus]}</p>
                  <p className="text-[11px] text-foreground-subtle">{formatDateTime(item.createdAt)}</p>
                  {item.note && <p className="mt-1 text-xs text-foreground-muted">{item.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {submitting && <div className="flex items-center justify-center gap-2 py-2 text-xs text-primary"><LoaderCircle className="h-4 w-4 animate-spin" />Updating booking…</div>}
      </div>
    </div>
  );
}
