import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Camera, Edit3, LoaderCircle, Save, X } from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import RatingStars from '@/components/common/RatingStars';
import StatusBadge from '@/components/common/StatusBadge';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { publicStorageUrl } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';

interface ProviderProfileRow {
  id: string;
  display_name: string;
  business_name: string;
  bio: string;
  profile_photo_path: string | null;
  primary_category_id: string | null;
  location_text: string;
  experience_years: number;
  skills: string[];
  visit_charge: number | string;
  hourly_charge: number | string | null;
  opening_hours: string;
  phone_public: string;
  whatsapp_public: string;
  availability_status: string;
  approval_status: string;
  is_verified: boolean;
  average_rating: number | string;
  review_count: number;
}

interface EditForm {
  displayName: string;
  businessName: string;
  bio: string;
  location: string;
  experience: string;
  skills: string;
  visitCharge: string;
  hourlyCharge: string;
  openingHours: string;
  phone: string;
  whatsapp: string;
}

function toForm(provider: ProviderProfileRow): EditForm {
  return {
    displayName: provider.display_name,
    businessName: provider.business_name,
    bio: provider.bio,
    location: provider.location_text,
    experience: String(provider.experience_years),
    skills: provider.skills.join(', '),
    visitCharge: String(provider.visit_charge),
    hourlyCharge: provider.hourly_charge == null ? '' : String(provider.hourly_charge),
    openingHours: provider.opening_hours,
    phone: provider.phone_public.replace(/^\+975/, ''),
    whatsapp: provider.whatsapp_public.replace(/^\+975/, ''),
  };
}

export default function ProviderProfileMgmt() {
  const { user } = useAuth();
  const [provider, setProvider] = useState<ProviderProfileRow | null>(null);
  const [categoryName, setCategoryName] = useState('Service Provider');
  const [subscriptionStatus, setSubscriptionStatus] = useState('trial');
  const [subscriptionPlan, setSubscriptionPlan] = useState('Free Trial');
  const [form, setForm] = useState<EditForm | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadProvider = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('provider_profiles')
        .select('id, display_name, business_name, bio, profile_photo_path, primary_category_id, location_text, experience_years, skills, visit_charge, hourly_charge, opening_hours, phone_public, whatsapp_public, availability_status, approval_status, is_verified, average_rating, review_count')
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      const nextProvider = data as ProviderProfileRow;

      const [categoryResult, subscriptionResult] = await Promise.all([
        nextProvider.primary_category_id
          ? supabase.from('service_categories').select('name').eq('id', nextProvider.primary_category_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        supabase
          .from('provider_subscriptions')
          .select('status, plan_id, created_at')
          .eq('provider_id', nextProvider.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (categoryResult.error) throw categoryResult.error;
      if (subscriptionResult.error) throw subscriptionResult.error;

      let nextPlanName = 'Free Trial';
      if (subscriptionResult.data?.plan_id) {
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('name')
          .eq('id', subscriptionResult.data.plan_id)
          .maybeSingle();
        if (planError) throw planError;
        nextPlanName = planData?.name ?? nextPlanName;
      }

      setProvider(nextProvider);
      setForm(toForm(nextProvider));
      setCategoryName(categoryResult.data?.name ?? 'Service Provider');
      setSubscriptionStatus(subscriptionResult.data?.status ?? 'trial');
      setSubscriptionPlan(nextPlanName);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load provider profile.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadProvider();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadProvider]);

  const updateForm = (field: keyof EditForm, value: string) => {
    setForm((current) => current ? { ...current, [field]: value } : current);
  };

  const uploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !provider) return;
    setSubmitting(true);
    setMessage('');
    setErrorMessage('');
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${user.id}/provider-${Date.now()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, {
        contentType: file.type || undefined,
        cacheControl: '3600',
      });
      if (uploadError) throw uploadError;

      const { error: updateError } = await supabase
        .from('provider_profiles')
        .update({ profile_photo_path: path })
        .eq('id', provider.id);
      if (updateError) {
        await supabase.storage.from('avatars').remove([path]);
        throw updateError;
      }

      if (provider.profile_photo_path) {
        await supabase.storage.from('avatars').remove([provider.profile_photo_path]);
      }
      setMessage('Profile photo updated.');
      await loadProvider();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to upload profile photo.');
    } finally {
      setSubmitting(false);
      event.target.value = '';
    }
  };

  const saveProfile = async () => {
    if (!provider || !form) return;
    setMessage('');
    setErrorMessage('');
    const phone = form.phone.replace(/\D/g, '');
    const whatsapp = form.whatsapp.replace(/\D/g, '');
    if (!form.displayName.trim() || phone.length !== 8 || (whatsapp && whatsapp.length !== 8)) {
      setErrorMessage('Enter a provider name and valid 8-digit phone numbers.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('provider_profiles')
        .update({
          display_name: form.displayName.trim(),
          business_name: form.businessName.trim(),
          bio: form.bio.trim(),
          location_text: form.location.trim(),
          experience_years: Number(form.experience || 0),
          skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
          visit_charge: Number(form.visitCharge || 0),
          hourly_charge: form.hourlyCharge ? Number(form.hourlyCharge) : null,
          opening_hours: form.openingHours.trim(),
          phone_public: `+975${phone}`,
          whatsapp_public: `+975${whatsapp || phone}`,
        })
        .eq('id', provider.id);
      if (error) throw error;
      setEditing(false);
      setMessage('Provider profile updated.');
      await loadProvider();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update provider profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="profile" />;

  if (!provider || !form) {
    return <div className="p-4"><AuthNotice type="error" message={errorMessage || 'Provider profile not found.'} /></div>;
  }

  return (
    <div className="px-4 py-4">
      {message && <div className="mb-3"><AuthNotice type="success" message={message} /></div>}
      {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}

      <div className="rounded-xl bg-white p-5 shadow-card">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={publicStorageUrl('avatars', provider.profile_photo_path) || '/provider-placeholder.svg'}
              alt={provider.display_name}
              className="h-24 w-24 rounded-full object-cover"
            />
            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-button">
              {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto} className="hidden" disabled={submitting} />
            </label>
          </div>
          <h2 className="mt-3 text-lg font-bold text-foreground">{provider.display_name}</h2>
          <p className="text-sm text-foreground-muted">{provider.business_name || 'Individual provider'}</p>
          <div className="mt-1">
            <RatingStars rating={Number(provider.average_rating)} reviewCount={provider.review_count} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            {provider.is_verified && <VerifiedBadge size="md" />}
            <StatusBadge status={provider.approval_status} size="sm" />
            <StatusBadge status={subscriptionStatus} size="sm" />
          </div>
          <p className="mt-2 text-xs text-foreground-muted">{subscriptionPlan}</p>
        </div>

        {editing ? (
          <div className="mt-5 space-y-3">
            {[
              { key: 'displayName' as const, label: 'Provider Name', type: 'text' },
              { key: 'businessName' as const, label: 'Business Name', type: 'text' },
              { key: 'location' as const, label: 'Location', type: 'text' },
              { key: 'experience' as const, label: 'Experience (years)', type: 'number' },
              { key: 'skills' as const, label: 'Skills (comma separated)', type: 'text' },
              { key: 'visitCharge' as const, label: 'Visit Charge', type: 'number' },
              { key: 'hourlyCharge' as const, label: 'Hourly Charge', type: 'number' },
              { key: 'openingHours' as const, label: 'Working Hours', type: 'text' },
              { key: 'phone' as const, label: 'Phone', type: 'tel' },
              { key: 'whatsapp' as const, label: 'WhatsApp', type: 'tel' },
            ].map((item) => (
              <label key={item.key} className="block">
                <span className="mb-1 block text-xs font-medium text-foreground-muted">{item.label}</span>
                <input
                  type={item.type}
                  value={form[item.key]}
                  onChange={(event) => updateForm(item.key, event.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
            ))}
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-foreground-muted">About</span>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(event) => updateForm('bio', event.target.value)}
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </label>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => { setEditing(false); setForm(toForm(provider)); }} className="flex-1" disabled={submitting}>
                <X className="mr-1 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={() => void saveProfile()} className="flex-1 bg-primary text-white hover:bg-primary-dark" disabled={submitting}>
                {submitting ? <LoaderCircle className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              {[
                { label: 'Phone', value: provider.phone_public },
                { label: 'Location', value: provider.location_text || 'Not specified' },
                { label: 'Category', value: categoryName },
                { label: 'Experience', value: `${provider.experience_years} years` },
                { label: 'Visit Charge', value: `Nu. ${provider.visit_charge}` },
                { label: 'Hours', value: provider.opening_hours || 'Not specified' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                  <span className="text-sm text-foreground-muted">{item.label}</span>
                  <span className="max-w-[60%] text-right text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>

            <Button onClick={() => setEditing(true)} className="mt-5 w-full bg-primary text-white hover:bg-primary-dark">
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
