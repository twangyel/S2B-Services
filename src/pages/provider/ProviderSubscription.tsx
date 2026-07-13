import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  Crown,
  FileImage,
  LoaderCircle,
  ReceiptText,
  X,
} from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import StatusBadge from '@/components/common/StatusBadge';
import SubscriptionPlanCard from '@/components/cards/SubscriptionPlanCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import {
  fetchCurrentSubscription,
  fetchProviderIdForUser,
  fetchProviderPayments,
  fetchSubscriptionPaymentDetails,
  fetchSubscriptionPlans,
  submitSubscriptionPayment,
  type ProviderSubscriptionRecord,
  type SubscriptionPaymentDetails,
  type SubscriptionPaymentRecord,
} from '@/lib/subscriptions';
import { supabase } from '@/lib/supabase';
import type { SubscriptionPlan } from '@/types';

function formatDate(value: string | null): string {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en-BT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function daysRemaining(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

export default function ProviderSubscription() {
  const { user } = useAuth();
  const [providerId, setProviderId] = useState('');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [current, setCurrent] = useState<ProviderSubscriptionRecord | null>(null);
  const [payments, setPayments] = useState<SubscriptionPaymentRecord[]>([]);
  const [paymentDetails, setPaymentDetails] = useState<SubscriptionPaymentDetails | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [bankName, setBankName] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadData = useCallback(async () => {
    if (!user) return;
    setErrorMessage('');
    try {
      const nextProviderId = providerId || await fetchProviderIdForUser(user.id);
      const [nextPlans, nextCurrent, nextPayments, nextPaymentDetails] = await Promise.all([
        fetchSubscriptionPlans(),
        fetchCurrentSubscription(nextProviderId),
        fetchProviderPayments(nextProviderId),
        fetchSubscriptionPaymentDetails(),
      ]);
      setProviderId(nextProviderId);
      setPlans(nextPlans);
      setCurrent(nextCurrent);
      setPayments(nextPayments);
      setPaymentDetails(nextPaymentDetails);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load subscription details.');
    } finally {
      setLoading(false);
    }
  }, [providerId, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 0);
    if (!user) return () => window.clearTimeout(timer);
    const channel = supabase
      .channel(`provider-subscription-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'provider_subscriptions' }, () => void loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscription_payment_proofs' }, () => void loadData())
      .subscribe();
    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [loadData, user]);

  const pendingPayment = useMemo(
    () => payments.find((payment) => payment.status === 'pending') ?? null,
    [payments]
  );
  const remaining = daysRemaining(current?.expiresAt ?? null);

  const choosePlan = (plan: SubscriptionPlan) => {
    setSuccessMessage('');
    setErrorMessage('');
    if (plan.price === 0) {
      setErrorMessage('The free trial is assigned automatically when a provider is approved.');
      return;
    }
    if (pendingPayment) {
      setErrorMessage('A payment proof is already awaiting verification.');
      return;
    }
    setSelectedPlan(plan);
    setBankName('');
    setTransactionRef('');
    setFile(null);
  };

  const submitPayment = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !providerId || !selectedPlan || !file) return;
    if (!bankName.trim() || !transactionRef.trim()) {
      setErrorMessage('Enter the bank name and transaction reference.');
      return;
    }
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await submitSubscriptionPayment({
        userId: user.id,
        providerId,
        plan: selectedPlan,
        bankName,
        transactionRef,
        file,
      });
      setSuccessMessage('Payment proof submitted. An administrator will review it shortly.');
      setSelectedPlan(null);
      await loadData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to submit payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="list" />;

  return (
    <div className="px-4 py-4">
      {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}
      {successMessage && <div className="mb-3"><AuthNotice type="success" message={successMessage} /></div>}

      <div className="mb-4 rounded-xl bg-primary p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              <h2 className="text-base font-bold">
                {current ? `Current Plan: ${current.planName}` : 'No active subscription'}
              </h2>
            </div>
            {current ? (
              <>
                <p className="mt-1 text-sm text-white/80">
                  {current.status === 'pending'
                    ? 'This subscription is pending activation.'
                    : `Active until ${formatDate(current.expiresAt)}`}
                </p>
                {remaining !== null && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-white/75">
                    <Clock className="h-3.5 w-3.5" />
                    {remaining} day{remaining === 1 ? '' : 's'} remaining
                  </div>
                )}
              </>
            ) : (
              <p className="mt-1 text-sm text-white/80">Choose a paid plan to continue provider benefits.</p>
            )}
          </div>
          {current && <StatusBadge status={current.status} size="md" />}
        </div>
      </div>

      {pendingPayment && (
        <div className="mb-4 rounded-xl border border-warning/30 bg-warning-light p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            <p className="text-sm font-semibold text-foreground">Payment verification pending</p>
          </div>
          <p className="mt-1 text-xs leading-5 text-foreground-muted">
            {pendingPayment.planName} plan · Nu. {pendingPayment.amount.toLocaleString()} · Ref {pendingPayment.transactionRef}
          </p>
        </div>
      )}

      <h3 className="mb-3 text-base font-bold text-foreground">Choose a Plan</h3>
      <div className="space-y-4">
        {plans.map((plan) => (
          <SubscriptionPlanCard
            key={plan.id}
            plan={plan}
            isCurrent={current?.planId === plan.id && ['trial', 'active'].includes(current.status)}
            onSelect={() => choosePlan(plan)}
          />
        ))}
      </div>

      {selectedPlan && paymentDetails && (
        <section className="mt-5 rounded-xl border border-primary/20 bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-foreground">Pay for {selectedPlan.name}</h3>
              <p className="mt-0.5 text-sm text-foreground-muted">Exact amount: Nu. {selectedPlan.price.toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              className="flex h-8 w-8 items-center justify-center rounded-full active:bg-muted"
              aria-label="Close payment form"
            >
              <X className="h-4 w-4 text-foreground-muted" />
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-muted p-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">Bank Transfer Details</p>
            </div>
            <dl className="mt-2 grid grid-cols-[100px_1fr] gap-x-2 gap-y-1 text-xs">
              <dt className="text-foreground-muted">Bank</dt><dd className="font-medium text-foreground">{paymentDetails.bankName}</dd>
              <dt className="text-foreground-muted">Account Name</dt><dd className="font-medium text-foreground">{paymentDetails.accountName}</dd>
              <dt className="text-foreground-muted">Account No.</dt><dd className="break-all font-semibold text-primary">{paymentDetails.accountNumber}</dd>
              {paymentDetails.branch && <><dt className="text-foreground-muted">Branch</dt><dd className="font-medium text-foreground">{paymentDetails.branch}</dd></>}
            </dl>
            <p className="mt-2 text-xs leading-5 text-foreground-muted">{paymentDetails.instructions}</p>
          </div>

          <form onSubmit={(event) => void submitPayment(event)} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="payment-bank">Bank used for transfer</Label>
              <Input
                id="payment-bank"
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
                placeholder="e.g. Bank of Bhutan"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="transaction-ref">Transaction reference</Label>
              <Input
                id="transaction-ref"
                value={transactionRef}
                onChange={(event) => setTransactionRef(event.target.value)}
                placeholder="Enter reference number"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="payment-proof">Payment screenshot or PDF</Label>
              <label
                htmlFor="payment-proof"
                className="mt-1.5 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-4 text-center"
              >
                <FileImage className="h-6 w-6 text-primary" />
                <span className="mt-1 text-sm font-medium text-foreground">{file?.name ?? 'Choose payment proof'}</span>
                <span className="mt-0.5 text-xs text-foreground-muted">JPG, PNG, WebP or PDF · up to 10 MB</span>
              </label>
              <input
                id="payment-proof"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={submitting || !file}
              className="h-11 w-full bg-primary text-white hover:bg-primary-dark"
            >
              {submitting ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Submit Payment Proof
            </Button>
          </form>
        </section>
      )}

      <section className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">Payment History</h3>
        </div>
        {payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-foreground-muted">
            No subscription payments submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-xl bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{payment.planName} Plan</p>
                    <p className="mt-0.5 text-xs text-foreground-muted">Nu. {payment.amount.toLocaleString()} · {formatDate(payment.submittedAt)}</p>
                  </div>
                  <StatusBadge status={payment.status} />
                </div>
                <p className="mt-2 text-xs text-foreground-muted">Transaction ref: <span className="font-medium text-foreground">{payment.transactionRef}</span></p>
                {payment.rejectionReason && (
                  <p className="mt-2 rounded-lg bg-error-light p-2 text-xs leading-5 text-error">{payment.rejectionReason}</p>
                )}
                {payment.screenshotUrl && (
                  <a
                    href={payment.screenshotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                  >
                    <FileImage className="h-3.5 w-3.5" />
                    View uploaded proof
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
