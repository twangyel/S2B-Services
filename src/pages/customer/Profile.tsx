import { useEffect, useState, type FormEvent } from 'react';
import { LoaderCircle, MapPin, Phone, Save, User } from 'lucide-react';
import AuthLoadingScreen from '@/components/auth/AuthLoadingScreen';
import AuthNotice from '@/components/auth/AuthNotice';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import type { AppProfile, AuthServiceArea } from '@/types/auth';

interface ProfileFormProps {
  profile: AppProfile;
  userEmail: string | null;
  refreshProfile: () => Promise<AppProfile | null>;
}

function ProfileForm({ profile, userEmail, refreshProfile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [serviceAreaId, setServiceAreaId] = useState(profile.default_service_area_id ?? '');
  const [address, setAddress] = useState(profile.address_text ?? '');
  const [areas, setAreas] = useState<AuthServiceArea[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    void supabase
      .from('service_areas')
      .select('id, name, city, dzongkhag')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data, error }) => {
        if (error) {
          console.error('[S2B Services] Unable to load service areas:', error.message);
          return;
        }
        setAreas((data ?? []) as AuthServiceArea[]);
      });
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setErrorMessage('');

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone && cleanedPhone.length !== 8) {
      setErrorMessage('Enter a valid 8-digit Bhutan phone number.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: cleanedPhone || null,
        default_service_area_id: serviceAreaId || null,
        address_text: address.trim() || null,
      })
      .eq('id', profile.id);

    setSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    await refreshProfile();
    setMessage('Your profile has been updated.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-4 py-5">
      {message && <AuthNotice type="success" message={message} />}
      {errorMessage && <AuthNotice type="error" message={errorMessage} />}

      <div className="rounded-2xl bg-primary-light p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Signed-in email</p>
        <p className="mt-1 break-all text-sm font-medium text-foreground">
          {profile.email ?? userEmail ?? '—'}
        </p>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">Full name</span>
        <div className="flex h-12 items-center rounded-xl border border-border px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <User className="mr-2.5 h-4 w-4 text-foreground-subtle" />
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">Phone number</span>
        <div className="flex h-12 items-center rounded-xl border border-border px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <Phone className="mr-2.5 h-4 w-4 text-foreground-subtle" />
          <span className="mr-2 text-sm text-foreground-muted">+975</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="numeric"
            maxLength={8}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">Default service area</span>
        <select
          value={serviceAreaId}
          onChange={(event) => setServiceAreaId(event.target.value)}
          className="h-12 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="">Select an area</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}, {area.city} — {area.dzongkhag}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">Address details</span>
        <div className="flex min-h-24 items-start rounded-xl border border-border px-3 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <MapPin className="mr-2.5 mt-0.5 h-4 w-4 shrink-0 text-foreground-subtle" />
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            rows={3}
            placeholder="Building, street or landmark"
            className="min-w-0 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
          />
        </div>
      </label>

      <Button
        type="submit"
        disabled={submitting}
        className="h-12 w-full bg-primary text-white hover:bg-primary-dark"
      >
        {submitting ? (
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save Profile
      </Button>
    </form>
  );
}

export default function Profile() {
  const { user, profile, profileLoading, refreshProfile } = useAuth();

  return (
    <div>
      <PageHeader title="My Profile" />
      {profileLoading || !profile ? (
        <AuthLoadingScreen />
      ) : (
        <ProfileForm
          key={profile.updated_at}
          profile={profile}
          userEmail={user?.email ?? null}
          refreshProfile={refreshProfile}
        />
      )}
    </div>
  );
}
