import { supabase } from '@/lib/supabase';
import type { SubscriptionPlan } from '@/types';

export interface ProviderSubscriptionRecord {
  id: string;
  providerId: string;
  planId: string;
  planName: string;
  status: 'trial' | 'pending' | 'active' | 'expired' | 'cancelled';
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface SubscriptionPaymentRecord {
  id: string;
  providerId: string;
  providerName: string;
  planId: string;
  planName: string;
  amount: number;
  screenshotPath: string;
  screenshotUrl: string | null;
  bankName: string;
  transactionRef: string;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason: string | null;
  verifiedAt: string | null;
}

export interface SubscriptionPaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  instructions: string;
}

interface PlanRow {
  id: string;
  name: string;
  price: number | string;
  period_label: string;
  features: string[] | null;
  is_popular: boolean;
}

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('id, name, price, period_label, features, is_popular')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return ((data ?? []) as PlanRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    price: Number(row.price),
    period: row.period_label,
    features: row.features ?? [],
    isPopular: row.is_popular,
  }));
}

export async function fetchProviderIdForUser(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return String(data.id);
}

export async function fetchCurrentSubscription(providerId: string): Promise<ProviderSubscriptionRecord | null> {
  const { data, error } = await supabase
    .from('provider_subscriptions')
    .select('id, provider_id, plan_id, status, starts_at, expires_at, created_at, subscription_plans(name)')
    .eq('provider_id', providerId)
    .in('status', ['trial', 'active', 'pending'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const planRelation = data.subscription_plans as unknown as { name?: string } | { name?: string }[] | null;
  const planName = Array.isArray(planRelation) ? planRelation[0]?.name : planRelation?.name;
  return {
    id: String(data.id),
    providerId: String(data.provider_id),
    planId: String(data.plan_id),
    planName: planName ?? 'Subscription',
    status: data.status as ProviderSubscriptionRecord['status'],
    startsAt: data.starts_at ? String(data.starts_at) : null,
    expiresAt: data.expires_at ? String(data.expires_at) : null,
    createdAt: String(data.created_at),
  };
}

export async function fetchProviderPayments(providerId: string): Promise<SubscriptionPaymentRecord[]> {
  const { data, error } = await supabase
    .from('subscription_payment_proofs')
    .select('id, provider_id, plan_id, amount, screenshot_path, bank_name, transaction_ref, submitted_at, status, rejection_reason, verified_at, subscription_plans(name)')
    .eq('provider_id', providerId)
    .order('submitted_at', { ascending: false });
  if (error) throw error;

  return Promise.all((data ?? []).map(async (row) => {
    const planRelation = row.subscription_plans as unknown as { name?: string } | { name?: string }[] | null;
    const planName = Array.isArray(planRelation) ? planRelation[0]?.name : planRelation?.name;
    const { data: signedData } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(String(row.screenshot_path), 60 * 10);
    return {
      id: String(row.id),
      providerId: String(row.provider_id),
      providerName: '',
      planId: String(row.plan_id),
      planName: planName ?? 'Subscription',
      amount: Number(row.amount),
      screenshotPath: String(row.screenshot_path),
      screenshotUrl: signedData?.signedUrl ?? null,
      bankName: String(row.bank_name),
      transactionRef: String(row.transaction_ref),
      submittedAt: String(row.submitted_at),
      status: row.status as SubscriptionPaymentRecord['status'],
      rejectionReason: row.rejection_reason ? String(row.rejection_reason) : null,
      verifiedAt: row.verified_at ? String(row.verified_at) : null,
    };
  }));
}

export async function fetchAllSubscriptionPayments(): Promise<SubscriptionPaymentRecord[]> {
  const { data, error } = await supabase
    .from('subscription_payment_proofs')
    .select('id, provider_id, plan_id, amount, screenshot_path, bank_name, transaction_ref, submitted_at, status, rejection_reason, verified_at, provider_profiles(display_name), subscription_plans(name)')
    .order('submitted_at', { ascending: false });
  if (error) throw error;

  return Promise.all((data ?? []).map(async (row) => {
    const providerRelation = row.provider_profiles as unknown as { display_name?: string } | { display_name?: string }[] | null;
    const planRelation = row.subscription_plans as unknown as { name?: string } | { name?: string }[] | null;
    const providerName = Array.isArray(providerRelation) ? providerRelation[0]?.display_name : providerRelation?.display_name;
    const planName = Array.isArray(planRelation) ? planRelation[0]?.name : planRelation?.name;
    const { data: signedData } = await supabase.storage
      .from('payment-proofs')
      .createSignedUrl(String(row.screenshot_path), 60 * 10);
    return {
      id: String(row.id),
      providerId: String(row.provider_id),
      providerName: providerName ?? 'Provider',
      planId: String(row.plan_id),
      planName: planName ?? 'Subscription',
      amount: Number(row.amount),
      screenshotPath: String(row.screenshot_path),
      screenshotUrl: signedData?.signedUrl ?? null,
      bankName: String(row.bank_name),
      transactionRef: String(row.transaction_ref),
      submittedAt: String(row.submitted_at),
      status: row.status as SubscriptionPaymentRecord['status'],
      rejectionReason: row.rejection_reason ? String(row.rejection_reason) : null,
      verifiedAt: row.verified_at ? String(row.verified_at) : null,
    };
  }));
}

export async function fetchSubscriptionPaymentDetails(): Promise<SubscriptionPaymentDetails> {
  const fallback: SubscriptionPaymentDetails = {
    bankName: 'Not configured',
    accountName: 'S2B Services',
    accountNumber: 'Contact support',
    branch: '',
    instructions: 'Contact S2B Services before making payment.',
  };
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'subscription_payment_details')
    .maybeSingle();
  if (error) throw error;
  if (!data?.value || typeof data.value !== 'object') return fallback;
  const value = data.value as Record<string, unknown>;
  return {
    bankName: String(value.bank_name ?? fallback.bankName),
    accountName: String(value.account_name ?? fallback.accountName),
    accountNumber: String(value.account_number ?? fallback.accountNumber),
    branch: String(value.branch ?? ''),
    instructions: String(value.instructions ?? fallback.instructions),
  };
}

function safeExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

export async function submitSubscriptionPayment(input: {
  userId: string;
  providerId: string;
  plan: SubscriptionPlan;
  bankName: string;
  transactionRef: string;
  file: File;
}): Promise<void> {
  const paymentId = crypto.randomUUID();
  const objectPath = `${input.userId}/${paymentId}.${safeExtension(input.file)}`;
  const { error: uploadError } = await supabase.storage
    .from('payment-proofs')
    .upload(objectPath, input.file, {
      upsert: false,
      cacheControl: '3600',
      contentType: input.file.type || undefined,
    });
  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from('subscription_payment_proofs').insert({
    id: paymentId,
    provider_id: input.providerId,
    plan_id: input.plan.id,
    amount: input.plan.price,
    screenshot_path: objectPath,
    bank_name: input.bankName.trim(),
    transaction_ref: input.transactionRef.trim(),
    status: 'pending',
  });

  if (insertError) {
    await supabase.storage.from('payment-proofs').remove([objectPath]);
    throw insertError;
  }
}

export async function reviewSubscriptionPayment(
  paymentId: string,
  action: 'verify' | 'reject',
  rejectionReason?: string
): Promise<void> {
  const { error } = await supabase.rpc('review_subscription_payment', {
    p_payment_id: paymentId,
    p_action: action,
    p_rejection_reason: rejectionReason ?? null,
  });
  if (error) throw error;
}
