import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  CalendarClock,
  Camera,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import PageHeader from '@/components/common/PageHeader';
import RatingStars from '@/components/common/RatingStars';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { fetchProvider, fetchServiceAreas } from '@/lib/catalog';
import { createServiceRequest } from '@/lib/requests';
import type { Provider, ServiceArea, UrgencyLevel } from '@/types';

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function localInputValue(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default function BookService() {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [serviceAreaId, setServiceAreaId] = useState(profile?.default_service_area_id ?? '');
  const [locationText, setLocationText] = useState(profile?.address_text ?? '');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');
  const [requestedFor, setRequestedFor] = useState(() => {
    const next = new Date(Date.now() + 60 * 60 * 1000);
    next.setMinutes(Math.ceil(next.getMinutes() / 15) * 15, 0, 0);
    return localInputValue(next);
  });
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!providerId) return;
    let active = true;
    void Promise.all([fetchProvider(providerId), fetchServiceAreas()])
      .then(([nextProvider, nextAreas]) => {
        if (!active) return;
        setProvider(nextProvider);
        setAreas(nextAreas);
      })
      .catch((error: unknown) => {
        if (active) setErrorMessage(error instanceof Error ? error.message : 'Unable to load booking form.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [providerId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (profile?.default_service_area_id) setServiceAreaId(profile.default_service_area_id);
      if (profile?.address_text) setLocationText(profile.address_text);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [profile]);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews]
  );

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';
    setErrorMessage('');

    const invalid = selected.find(
      (file) => !ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE
    );
    if (invalid) {
      setErrorMessage('Photos must be JPG, PNG or WebP and no larger than 10 MB each.');
      return;
    }
    setFiles((current) => [...current, ...selected].slice(0, MAX_FILES));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !profile || !provider) return;
    setErrorMessage('');

    const cleanedPhone = (profile.phone ?? '').replace(/\D/g, '');
    if (cleanedPhone.length !== 8) {
      setErrorMessage('Add a valid 8-digit Bhutan phone number in My Profile before booking.');
      return;
    }
    if (issueDescription.trim().length < 10) {
      setErrorMessage('Describe the work or problem in at least 10 characters.');
      return;
    }
    if (!serviceAreaId || !locationText.trim()) {
      setErrorMessage('Select a service area and enter your complete location or landmark.');
      return;
    }
    const requestedDate = new Date(requestedFor);
    if (!requestedFor || Number.isNaN(requestedDate.getTime()) || requestedDate.getTime() < Date.now()) {
      setErrorMessage('Choose a preferred service date and time in the future.');
      return;
    }

    setSubmitting(true);
    try {
      const requestId = await createServiceRequest({
        customerId: user.id,
        customerName: profile.full_name,
        customerPhone: cleanedPhone,
        providerId: provider.id,
        providerName: provider.name,
        categoryId: provider.categoryId,
        serviceName: provider.categoryName,
        issueDescription: issueDescription.trim(),
        serviceAreaId,
        locationText: locationText.trim(),
        latitude: profile.latitude,
        longitude: profile.longitude,
        urgency,
        requestedFor: requestedDate.toISOString(),
        files,
      });
      navigate(`/requests/${requestId}`, { replace: true, state: { created: true } });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to submit your booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Book Service" />
        <LoadingSkeleton variant="profile" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div>
        <PageHeader title="Book Service" />
        <EmptyState icon={ShieldCheck} title="Provider unavailable" description="This provider cannot receive bookings right now." />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <PageHeader title="Book Service" />
      <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
        {errorMessage && <AuthNotice type="error" message={errorMessage} />}

        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
          <img src={provider.photo} alt={provider.name} className="h-14 w-14 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-base font-bold text-foreground">{provider.name}</h2>
              {provider.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-xs text-foreground-muted">{provider.categoryName}</p>
            <RatingStars rating={provider.rating} reviewCount={provider.reviewCount} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="text-sm font-bold text-foreground">What service do you need?</h3>
          <textarea
            value={issueDescription}
            onChange={(event) => setIssueDescription(event.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Describe the problem, work required, appliance model, or anything the provider should know."
            className="mt-3 w-full resize-none rounded-xl border border-border px-3 py-3 text-sm outline-none placeholder:text-foreground-subtle focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <p className="mt-1 text-right text-[11px] text-foreground-subtle">{issueDescription.length}/1000</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="text-sm font-bold text-foreground">Preferred visit</h3>
          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-medium text-foreground-muted">Date and time</span>
            <div className="flex h-12 items-center rounded-xl border border-border px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
              <CalendarClock className="mr-2.5 h-4 w-4 text-foreground-subtle" />
              <input
                type="datetime-local"
                value={requestedFor}
                min={localInputValue(new Date())}
                onChange={(event) => setRequestedFor(event.target.value)}
                required
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </label>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as UrgencyLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setUrgency(level)}
                className={`rounded-xl border px-2 py-2 text-xs font-semibold capitalize ${
                  urgency === level
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border bg-white text-foreground-muted'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h3 className="text-sm font-bold text-foreground">Service location</h3>
          <select
            value={serviceAreaId}
            onChange={(event) => setServiceAreaId(event.target.value)}
            required
            className="mt-3 h-12 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            <option value="">Select service area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}, {area.city}
              </option>
            ))}
          </select>
          <div className="mt-3 flex min-h-24 items-start rounded-xl border border-border px-3 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <MapPin className="mr-2.5 mt-0.5 h-4 w-4 shrink-0 text-foreground-subtle" />
            <textarea
              value={locationText}
              onChange={(event) => setLocationText(event.target.value)}
              rows={3}
              placeholder="Building, street, landmark and any directions"
              className="min-w-0 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-foreground-subtle"
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">Photos</h3>
              <p className="mt-0.5 text-xs text-foreground-muted">Optional, up to {MAX_FILES} photos</p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-light px-3 py-2 text-xs font-semibold text-primary">
              <Camera className="h-4 w-4" /> Add
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} className="hidden" />
            </label>
          </div>
          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {previews.map(({ file, url }, index) => (
                <div key={`${file.name}-${file.lastModified}`} className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                  <img src={url} alt="Issue preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
                    aria-label="Remove photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-info-light px-3 py-2.5 text-xs leading-relaxed text-info">
          The provider will confirm availability and may share an estimated cost. Payment is arranged directly between you and the provider.
        </div>

        <Button type="submit" disabled={submitting} className="h-12 w-full bg-primary text-white hover:bg-primary-dark">
          {submitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          Send Booking Request
        </Button>
      </form>
    </div>
  );
}
