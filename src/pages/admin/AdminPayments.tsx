import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  fetchAllSubscriptionPayments,
  reviewSubscriptionPayment,
  type SubscriptionPaymentRecord,
} from '@/lib/subscriptions';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const filters = ['all', 'pending', 'verified', 'rejected'] as const;
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

export default function AdminPayments() {
  const [payments, setPayments] = useState<SubscriptionPaymentRecord[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');
  const [rejecting, setRejecting] = useState<SubscriptionPaymentRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadPayments = useCallback(async () => {
    setErrorMessage('');
    try {
      setPayments(await fetchAllSubscriptionPayments());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load payment proofs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPayments();
    }, 0);
    const channel = supabase
      .channel('admin-subscription-payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscription_payment_proofs' }, () => void loadPayments())
      .subscribe();
    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [loadPayments]);

  const visiblePayments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return payments.filter((payment) => {
      if (filter !== 'all' && payment.status !== filter) return false;
      if (!query) return true;
      return [payment.providerName, payment.planName, payment.transactionRef, payment.bankName]
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [filter, payments, search]);

  const verifyPayment = async (payment: SubscriptionPaymentRecord) => {
    if (!window.confirm(`Verify Nu. ${payment.amount.toLocaleString()} for ${payment.providerName}?`)) return;
    setProcessingId(payment.id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await reviewSubscriptionPayment(payment.id, 'verify');
      setSuccessMessage(`${payment.providerName}'s ${payment.planName} subscription is now active.`);
      await loadPayments();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to verify payment.');
    } finally {
      setProcessingId('');
    }
  };

  const submitRejection = async () => {
    if (!rejecting || !rejectionReason.trim()) return;
    setProcessingId(rejecting.id);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await reviewSubscriptionPayment(rejecting.id, 'reject', rejectionReason);
      setSuccessMessage('Payment proof rejected and the provider was notified.');
      setRejecting(null);
      setRejectionReason('');
      await loadPayments();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to reject payment.');
    } finally {
      setProcessingId('');
    }
  };

  if (loading) return <LoadingSkeleton variant="list" />;

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">Payment Verifications</h2>
          <p className="mt-0.5 text-xs text-foreground-muted">Review provider subscription transfers</p>
        </div>
        <button
          type="button"
          onClick={() => void loadPayments()}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white"
          aria-label="Refresh payments"
        >
          <RefreshCw className="h-4 w-4 text-foreground-muted" />
        </button>
      </div>

      {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}
      {successMessage && <div className="mb-3"><AuthNotice type="success" message={successMessage} /></div>}

      <div className="mb-3 flex h-11 items-center gap-2 rounded-xl border border-border bg-white px-3">
        <Search className="h-4 w-4 text-foreground-subtle" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search provider, plan or reference"
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
              {item === 'all' ? payments.length : payments.filter((payment) => payment.status === item).length}
            </span>
          </button>
        ))}
      </div>

      {visiblePayments.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No payment proofs"
          description="There are no subscription payments matching this filter."
        />
      ) : (
        <div className="space-y-3">
          {visiblePayments.map((payment) => (
            <div key={payment.id} className="rounded-xl bg-white p-4 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-foreground">{payment.providerName}</h3>
                  <p className="text-xs text-foreground-muted">{payment.planName} Plan</p>
                </div>
                <StatusBadge status={payment.status} size="sm" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div><span className="text-foreground-muted">Amount</span><p className="font-semibold text-foreground">Nu. {payment.amount.toLocaleString()}</p></div>
                <div><span className="text-foreground-muted">Bank</span><p className="truncate font-medium text-foreground">{payment.bankName}</p></div>
                <div><span className="text-foreground-muted">Reference</span><p className="break-all font-medium text-foreground">{payment.transactionRef}</p></div>
                <div><span className="text-foreground-muted">Submitted</span><p className="font-medium text-foreground">{formatDate(payment.submittedAt)}</p></div>
              </div>

              {payment.screenshotUrl && (
                <a
                  href={payment.screenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold text-primary"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Payment Proof
                </a>
              )}

              {payment.rejectionReason && (
                <p className="mt-3 rounded-lg bg-error-light p-2.5 text-xs leading-5 text-error">{payment.rejectionReason}</p>
              )}

              {payment.status === 'pending' && (
                <div className="mt-3 flex gap-2">
                  <Button
                    type="button"
                    onClick={() => void verifyPayment(payment)}
                    disabled={processingId === payment.id}
                    className="h-10 flex-1 bg-success text-white hover:bg-success/90"
                  >
                    {processingId === payment.id ? <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-4 w-4" />}
                    Verify
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setRejecting(payment);
                      setRejectionReason('');
                    }}
                    disabled={processingId === payment.id}
                    className="h-10 flex-1 bg-error text-white hover:bg-error/90"
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {rejecting && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Reject Payment Proof</h3>
                <p className="mt-1 text-xs text-foreground-muted">{rejecting.providerName} · {rejecting.planName} Plan</p>
              </div>
              <button
                type="button"
                onClick={() => setRejecting(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full active:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Explain what needs to be corrected, such as an unclear screenshot or invalid reference."
              className="mt-4 min-h-28"
            />
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="outline" onClick={() => setRejecting(null)} className="h-11 flex-1">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void submitRejection()}
                disabled={!rejectionReason.trim() || processingId === rejecting.id}
                className="h-11 flex-1 bg-error text-white hover:bg-error/90"
              >
                {processingId === rejecting.id && <LoaderCircle className="mr-1.5 h-4 w-4 animate-spin" />}
                Reject Proof
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
