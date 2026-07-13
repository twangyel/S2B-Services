import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  LoaderCircle,
  MapPin,
  Phone,
  X,
} from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { publicStorageUrl } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';

interface ProviderDocument {
  id: string;
  document_type: string;
  file_path: string;
  review_status: 'pending' | 'verified' | 'rejected';
  signedUrl?: string;
}

interface PendingProvider {
  id: string;
  user_id: string;
  display_name: string;
  business_name: string;
  profile_photo_path: string | null;
  primary_category_id: string | null;
  primary_service_area_id: string | null;
  location_text: string;
  experience_years: number;
  skills: string[];
  visit_charge: number;
  phone_public: string;
  approval_status: 'pending';
  created_at: string;
  categoryName: string;
  areaName: string;
  documents: ProviderDocument[];
}

interface PendingProviderRow {
  id: string;
  user_id: string;
  display_name: string;
  business_name: string;
  profile_photo_path: string | null;
  primary_category_id: string | null;
  primary_service_area_id: string | null;
  location_text: string;
  experience_years: number;
  skills: string[] | null;
  visit_charge: number | string;
  phone_public: string;
  approval_status: 'pending';
  created_at: string;
}

export default function AdminApprovals() {
  const { user } = useAuth();
  const [pendingProviders, setPendingProviders] = useState<PendingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const { data: providerRows, error: providerError } = await supabase
        .from('provider_profiles')
        .select('id, user_id, display_name, business_name, profile_photo_path, primary_category_id, primary_service_area_id, location_text, experience_years, skills, visit_charge, phone_public, approval_status, created_at')
        .eq('approval_status', 'pending')
        .order('created_at');
      if (providerError) throw providerError;

      const rows = (providerRows ?? []) as PendingProviderRow[];
      const categoryIds = [...new Set(rows.map((row) => row.primary_category_id).filter(Boolean))] as string[];
      const areaIds = [...new Set(rows.map((row) => row.primary_service_area_id).filter(Boolean))] as string[];
      const providerIds = rows.map((row) => row.id);

      const [categoryResult, areaResult, documentResult] = await Promise.all([
        categoryIds.length
          ? supabase.from('service_categories').select('id, name').in('id', categoryIds)
          : Promise.resolve({ data: [], error: null }),
        areaIds.length
          ? supabase.from('service_areas').select('id, name, city').in('id', areaIds)
          : Promise.resolve({ data: [], error: null }),
        providerIds.length
          ? supabase.from('provider_documents').select('id, provider_id, document_type, file_path, review_status').in('provider_id', providerIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (categoryResult.error) throw categoryResult.error;
      if (areaResult.error) throw areaResult.error;
      if (documentResult.error) throw documentResult.error;

      const categoryNames = new Map((categoryResult.data ?? []).map((row) => [row.id as string, row.name as string]));
      const areaNames = new Map(
        (areaResult.data ?? []).map((row) => [row.id as string, `${row.name as string}, ${row.city as string}`])
      );

      const documentsByProvider = new Map<string, ProviderDocument[]>();
      await Promise.all(
        (documentResult.data ?? []).map(async (row) => {
          const { data: signedData } = await supabase.storage
            .from('provider-documents')
            .createSignedUrl(row.file_path as string, 60 * 20);
          const document: ProviderDocument = {
            id: row.id as string,
            document_type: row.document_type as string,
            file_path: row.file_path as string,
            review_status: row.review_status as ProviderDocument['review_status'],
            signedUrl: signedData?.signedUrl,
          };
          const list = documentsByProvider.get(row.provider_id as string) ?? [];
          list.push(document);
          documentsByProvider.set(row.provider_id as string, list);
        })
      );

      setPendingProviders(
        rows.map((row) => ({
          ...row,
          skills: row.skills ?? [],
          visit_charge: Number(row.visit_charge),
          categoryName: row.primary_category_id ? categoryNames.get(row.primary_category_id) ?? 'Unknown category' : 'Not selected',
          areaName: row.primary_service_area_id ? areaNames.get(row.primary_service_area_id) ?? row.location_text : row.location_text,
          documents: documentsByProvider.get(row.id) ?? [],
        }))
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load provider applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadApplications();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadApplications]);

  const approveProvider = async (provider: PendingProvider) => {
    if (!user) return;
    setActionId(provider.id);
    setMessage('');
    setErrorMessage('');
    try {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + 14);

      if (provider.documents.length > 0) {
        const { error: documentError } = await supabase
          .from('provider_documents')
          .update({
            review_status: 'verified',
            reviewed_at: now.toISOString(),
            reviewed_by: user.id,
            review_note: null,
          })
          .eq('provider_id', provider.id);
        if (documentError) throw documentError;
      }

      const { error: approvalError } = await supabase
        .from('provider_profiles')
        .update({
          approval_status: 'approved',
          rejection_reason: null,
          is_verified: true,
          documents_verified: provider.documents.length > 0,
          availability_status: 'available',
          approved_at: now.toISOString(),
          approved_by: user.id,
        })
        .eq('id', provider.id);
      if (approvalError) throw approvalError;

      const { data: existingSubscription, error: subscriptionReadError } = await supabase
        .from('provider_subscriptions')
        .select('id')
        .eq('provider_id', provider.id)
        .limit(1)
        .maybeSingle();
      if (subscriptionReadError) throw subscriptionReadError;

      if (!existingSubscription) {
        const { error: subscriptionError } = await supabase.from('provider_subscriptions').insert({
          provider_id: provider.id,
          plan_id: 'plan-free',
          status: 'active',
          starts_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
        });
        if (subscriptionError) throw subscriptionError;
      }

      await supabase.from('admin_audit_logs').insert({
        admin_id: user.id,
        action: 'approve_provider',
        entity_type: 'provider',
        entity_id: provider.id,
        new_data: { provider_name: provider.display_name },
      });

      setPendingProviders((current) => current.filter((item) => item.id !== provider.id));
      setMessage(`${provider.display_name} is now an approved provider.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to approve provider.');
    } finally {
      setActionId(null);
    }
  };

  const rejectProvider = async (provider: PendingProvider) => {
    if (!user) return;
    const reason = window.prompt(`Reason for rejecting ${provider.display_name}'s application:`)?.trim();
    if (!reason) return;

    setActionId(provider.id);
    setMessage('');
    setErrorMessage('');
    try {
      const now = new Date().toISOString();
      if (provider.documents.length > 0) {
        const { error: documentError } = await supabase
          .from('provider_documents')
          .update({
            review_status: 'rejected',
            review_note: reason,
            reviewed_at: now,
            reviewed_by: user.id,
          })
          .eq('provider_id', provider.id);
        if (documentError) throw documentError;
      }

      const { error } = await supabase
        .from('provider_profiles')
        .update({
          approval_status: 'rejected',
          rejection_reason: reason,
          is_verified: false,
          documents_verified: false,
          approved_at: null,
          approved_by: null,
        })
        .eq('id', provider.id);
      if (error) throw error;

      await supabase.from('admin_audit_logs').insert({
        admin_id: user.id,
        action: 'reject_provider',
        entity_type: 'provider',
        entity_id: provider.id,
        new_data: { provider_name: provider.display_name, reason },
      });

      setPendingProviders((current) => current.filter((item) => item.id !== provider.id));
      setMessage(`${provider.display_name}'s application was rejected.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to reject provider.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="px-4 py-4">
      <h2 className="mb-3 text-lg font-bold text-foreground">
        Pending Approvals ({pendingProviders.length})
      </h2>

      {message && <div className="mb-3"><AuthNotice type="success" message={message} /></div>}
      {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}

      {loading ? (
        <LoadingSkeleton variant="card" count={4} />
      ) : (
        <div className="space-y-3">
          {pendingProviders.map((provider) => (
            <div key={provider.id} className="rounded-xl bg-white p-4 shadow-card">
              <div className="flex items-start gap-3">
                <img
                  src={publicStorageUrl('avatars', provider.profile_photo_path) || '/provider-placeholder.svg'}
                  alt={provider.display_name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{provider.display_name}</h3>
                  <p className="text-xs text-foreground-muted">
                    {provider.business_name || 'Individual service provider'}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {provider.categoryName} · {provider.experience_years} years
                  </p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-foreground-muted">
                    <MapPin className="h-3 w-3" />
                    {provider.areaName}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-foreground-muted">
                    <Phone className="h-3 w-3" />
                    {provider.phone_public || 'No public phone'}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {provider.skills.slice(0, 5).map((skill) => (
                      <span key={skill} className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-foreground-muted">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <StatusBadge status="pending" size="sm" />
                    <span className="text-xs font-semibold text-foreground">Visit Nu. {provider.visit_charge}</span>
                  </div>

                  {provider.documents.length > 0 && (
                    <div className="mt-3 rounded-lg bg-muted p-2.5">
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
                        Documents
                      </p>
                      <div className="space-y-1.5">
                        {provider.documents.map((document) => (
                          <a
                            key={document.id}
                            href={document.signedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between rounded-md bg-white px-2.5 py-2 text-xs font-medium text-primary"
                          >
                            <span className="flex items-center gap-1.5 capitalize">
                              <FileText className="h-3.5 w-3.5" />
                              {document.document_type.replace(/_/g, ' ')}
                            </span>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mt-2 text-[10px] text-foreground-subtle">
                    Submitted {new Date(provider.created_at).toLocaleString()}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      disabled={actionId === provider.id}
                      onClick={() => void approveProvider(provider)}
                      className="flex-1 bg-success text-white hover:bg-success/90"
                    >
                      {actionId === provider.id ? (
                        <LoaderCircle className="mr-1 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionId === provider.id}
                      onClick={() => void rejectProvider(provider)}
                      className="flex-1 border-error text-error hover:bg-error-light"
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {pendingProviders.length === 0 && (
            <div className="rounded-xl bg-white py-10 text-center shadow-card">
              <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
              <p className="mt-2 text-sm font-medium text-foreground">No pending approvals</p>
              <p className="mt-1 text-xs text-foreground-muted">New provider applications will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
