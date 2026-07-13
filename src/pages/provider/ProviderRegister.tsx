import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  LoaderCircle,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import AuthNotice from '@/components/auth/AuthNotice';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { fetchServiceAreas, fetchServiceCategories } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';
import type { ServiceArea, ServiceCategory } from '@/types';

interface ExistingApplication {
  id: string;
  display_name: string;
  business_name: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejection_reason: string | null;
  created_at: string;
}

interface ProviderForm {
  name: string;
  phone: string;
  whatsapp: string;
  businessName: string;
  categoryId: string;
  serviceAreaId: string;
  location: string;
  experience: string;
  skills: string;
  visitCharge: string;
  hourlyCharge: string;
  openingHours: string;
  bio: string;
}

function safeFileName(fileName: string): string {
  return fileName.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function ProviderRegister() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [existingApplication, setExistingApplication] = useState<ExistingApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [form, setForm] = useState<ProviderForm>({
    name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    whatsapp: profile?.phone ?? '',
    businessName: '',
    categoryId: '',
    serviceAreaId: profile?.default_service_area_id ?? '',
    location: profile?.address_text ?? '',
    experience: '',
    skills: '',
    visitCharge: '',
    hourlyCharge: '',
    openingHours: '8:00 AM - 6:00 PM',
    bio: '',
  });

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === form.categoryId) ?? null,
    [categories, form.categoryId]
  );

  useEffect(() => {
    if (!user) return;
    let active = true;
    void Promise.all([
      fetchServiceCategories(),
      fetchServiceAreas(),
      supabase
        .from('provider_profiles')
        .select('id, display_name, business_name, approval_status, rejection_reason, created_at')
        .eq('user_id', user.id)
        .maybeSingle(),
    ])
      .then(([nextCategories, nextAreas, applicationResult]) => {
        if (!active) return;
        setCategories(nextCategories);
        setAreas(nextAreas);
        setForm((current) => ({
          ...current,
          name: current.name || profile?.full_name || '',
          phone: current.phone || profile?.phone || '',
          whatsapp: current.whatsapp || profile?.phone || '',
          serviceAreaId: current.serviceAreaId || profile?.default_service_area_id || '',
          location: current.location || profile?.address_text || '',
        }));
        if (applicationResult.error) throw applicationResult.error;
        setExistingApplication((applicationResult.data ?? null) as ExistingApplication | null);
      })
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load provider application.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [profile, user]);

  const updateForm = (field: keyof ProviderForm, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleFile = (setter: (file: File | null) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(event.target.files?.[0] ?? null);
  };

  const validateStep = (): boolean => {
    setErrorMessage('');
    if (step === 1) {
      const phone = form.phone.replace(/\D/g, '');
      if (!form.name.trim() || phone.length !== 8) {
        setErrorMessage('Enter your full name and a valid 8-digit Bhutan phone number.');
        return false;
      }
    }
    if (step === 2 && (!form.categoryId || !form.serviceAreaId || !form.location.trim())) {
      setErrorMessage('Select your service category, service area and location.');
      return false;
    }
    return true;
  };

  const continueStep = () => {
    if (validateStep()) setStep((current) => Math.min(3, current + 1));
  };

  const uploadDocument = async (file: File, label: string): Promise<string> => {
    if (!user) throw new Error('You must be signed in.');
    const objectPath = `${user.id}/${Date.now()}-${label}-${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from('provider-documents').upload(objectPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) throw error;
    return objectPath;
  };

  const submitApplication = async () => {
    if (!user || existingApplication) return;
    setErrorMessage('');
    const phone = form.phone.replace(/\D/g, '');
    const whatsapp = form.whatsapp.replace(/\D/g, '') || phone;
    const visitCharge = Number(form.visitCharge);
    const experience = Number(form.experience || 0);
    const hourlyCharge = form.hourlyCharge ? Number(form.hourlyCharge) : null;

    if (!form.skills.trim() || !Number.isFinite(visitCharge) || visitCharge < 0 || !idDocument) {
      setErrorMessage('Add your skills, a valid visit charge and an identity document.');
      return;
    }
    if (selectedCategory?.certificateRequired && !certificate) {
      setErrorMessage('A certificate is required for this service category.');
      return;
    }

    setSubmitting(true);
    const uploadedPaths: string[] = [];
    let providerCreated = false;
    try {
      const idPath = await uploadDocument(idDocument, 'identity');
      uploadedPaths.push(idPath);
      const certificatePath = certificate ? await uploadDocument(certificate, 'certificate') : null;
      if (certificatePath) uploadedPaths.push(certificatePath);

      const selectedArea = areas.find((area) => area.id === form.serviceAreaId);
      const skills = form.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

      const { data: providerData, error: providerError } = await supabase
        .from('provider_profiles')
        .insert({
          user_id: user.id,
          display_name: form.name.trim(),
          business_name: form.businessName.trim(),
          bio: form.bio.trim(),
          primary_category_id: form.categoryId,
          primary_service_area_id: form.serviceAreaId,
          location_text: form.location.trim() || `${selectedArea?.name ?? ''}, ${selectedArea?.city ?? ''}`,
          experience_years: experience,
          skills,
          visit_charge: visitCharge,
          hourly_charge: hourlyCharge,
          opening_hours: form.openingHours.trim(),
          phone_public: `+975${phone}`,
          whatsapp_public: `+975${whatsapp}`,
          availability_status: 'offline',
          approval_status: 'pending',
        })
        .select('id, display_name, business_name, approval_status, rejection_reason, created_at')
        .single();
      if (providerError) throw providerError;

      const providerId = providerData.id as string;
      providerCreated = true;
      const relatedResults = await Promise.all([
        supabase.from('provider_service_areas').insert({
          provider_id: providerId,
          service_area_id: form.serviceAreaId,
        }),
        supabase.from('provider_services').insert({
          provider_id: providerId,
          category_id: form.categoryId,
          title: selectedCategory?.name ?? 'Primary Service',
          description: form.bio.trim(),
          visit_charge: visitCharge,
          hourly_charge: hourlyCharge,
          is_primary: true,
          is_active: true,
        }),
        supabase.from('provider_documents').insert([
          { provider_id: providerId, document_type: 'identity', file_path: idPath },
          ...(certificatePath
            ? [{ provider_id: providerId, document_type: 'certificate', file_path: certificatePath }]
            : []),
        ]),
        supabase.from('profiles').update({
          full_name: form.name.trim(),
          phone,
          default_service_area_id: form.serviceAreaId,
          address_text: form.location.trim(),
        }).eq('id', user.id),
      ]);

      const relatedError = relatedResults.find((result) => result.error)?.error;
      if (relatedError) throw relatedError;

      setExistingApplication(providerData as ExistingApplication);
      await refreshProfile();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      if (!providerCreated && uploadedPaths.length > 0) {
        await supabase.storage.from('provider-documents').remove(uploadedPaths);
      }
      setErrorMessage(error instanceof Error ? error.message : 'Unable to submit provider application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Become a Provider" />
        <LoadingSkeleton variant="profile" />
      </div>
    );
  }

  if (existingApplication) {
    const approved = existingApplication.approval_status === 'approved';
    const rejected = existingApplication.approval_status === 'rejected';
    return (
      <div>
        <PageHeader title="Provider Application" />
        <div className="px-4 py-6">
          <div className="rounded-2xl bg-white p-6 text-center shadow-card">
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${approved ? 'bg-success-light' : rejected ? 'bg-error-light' : 'bg-warning-light'}`}>
              {approved ? (
                <ShieldCheck className="h-8 w-8 text-success" />
              ) : rejected ? (
                <XCircle className="h-8 w-8 text-error" />
              ) : (
                <Clock3 className="h-8 w-8 text-warning" />
              )}
            </div>
            <h2 className="mt-4 text-xl font-bold text-foreground">
              {approved ? 'Application Approved' : rejected ? 'Application Needs Attention' : 'Application Under Review'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
              {approved
                ? 'Your provider account is active. You can now manage your services and receive customer requests.'
                : rejected
                  ? existingApplication.rejection_reason || 'Please contact S2B Services support for more information.'
                  : 'Our admin team will verify your details and documents. You will receive an update after review.'}
            </p>
            <div className="mt-5 rounded-xl bg-muted p-4 text-left">
              <p className="text-sm font-semibold text-foreground">{existingApplication.display_name}</p>
              <p className="mt-0.5 text-xs text-foreground-muted">
                {existingApplication.business_name || 'Individual service provider'}
              </p>
              <p className="mt-2 text-xs text-foreground-subtle">
                Submitted {new Date(existingApplication.created_at).toLocaleDateString()}
              </p>
            </div>
            <Button
              onClick={() => navigate(approved ? '/provider/dashboard' : '/')}
              className="mt-5 h-12 w-full bg-primary text-white hover:bg-primary-dark"
            >
              {approved ? 'Open Provider Dashboard' : 'Return Home'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Become a Provider" />

      <div className="px-4 py-4">
        {errorMessage && <div className="mb-4"><AuthNotice type="error" message={errorMessage} /></div>}

        <div className="mb-6 flex items-center justify-center">
          {[1, 2, 3].map((currentStep) => (
            <div key={currentStep} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  currentStep <= step ? 'bg-primary text-white' : 'bg-muted text-foreground-muted'
                }`}
              >
                {currentStep < step ? <CheckCircle2 className="h-4 w-4" /> : currentStep}
              </div>
              {currentStep < 3 && (
                <div className={`h-0.5 w-16 ${currentStep < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">Full Name *</span>
              <input
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
                placeholder="Your full name"
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">Phone Number *</span>
              <div className="flex h-12 items-center rounded-lg border border-border bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <span className="mr-2 text-sm text-foreground-muted">+975</span>
                <input
                  inputMode="numeric"
                  maxLength={8}
                  value={form.phone}
                  onChange={(event) => updateForm('phone', event.target.value.replace(/\D/g, ''))}
                  placeholder="17XXXXXX"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">WhatsApp Number</span>
              <div className="flex h-12 items-center rounded-lg border border-border bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <span className="mr-2 text-sm text-foreground-muted">+975</span>
                <input
                  inputMode="numeric"
                  maxLength={8}
                  value={form.whatsapp}
                  onChange={(event) => updateForm('whatsapp', event.target.value.replace(/\D/g, ''))}
                  placeholder="Same as phone"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">Business Name</span>
              <input
                value={form.businessName}
                onChange={(event) => updateForm('businessName', event.target.value)}
                placeholder="Optional"
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Service Details</h2>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">Service Category *</span>
              <select
                value={form.categoryId}
                onChange={(event) => updateForm('categoryId', event.target.value)}
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">Primary Service Area *</span>
              <select
                value={form.serviceAreaId}
                onChange={(event) => updateForm('serviceAreaId', event.target.value)}
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select an area</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>{area.name}, {area.city}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">Location / Address *</span>
              <input
                value={form.location}
                onChange={(event) => updateForm('location', event.target.value)}
                placeholder="Street, building or landmark"
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">Experience (years)</span>
              <input
                type="number"
                min="0"
                max="80"
                value={form.experience}
                onChange={(event) => updateForm('experience', event.target.value)}
                placeholder="Years of experience"
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">About Your Service</span>
              <textarea
                rows={3}
                value={form.bio}
                onChange={(event) => updateForm('bio', event.target.value)}
                placeholder="Briefly describe the service you provide"
                className="w-full rounded-lg border border-border bg-white px-3 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Skills, Pricing & Documents</h2>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">Skills *</span>
              <input
                value={form.skills}
                onChange={(event) => updateForm('skills', event.target.value)}
                placeholder="Wiring, installation, repair"
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="mt-1 block text-xs text-foreground-muted">Separate skills with commas.</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-foreground">Visit Charge *</span>
                <input
                  type="number"
                  min="0"
                  value={form.visitCharge}
                  onChange={(event) => updateForm('visitCharge', event.target.value)}
                  placeholder="Nu. 200"
                  className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-foreground">Hourly Charge</span>
                <input
                  type="number"
                  min="0"
                  value={form.hourlyCharge}
                  onChange={(event) => updateForm('hourlyCharge', event.target.value)}
                  placeholder="Optional"
                  className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-foreground">Working Hours</span>
              <input
                value={form.openingHours}
                onChange={(event) => updateForm('openingHours', event.target.value)}
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>

            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-border bg-white p-5 text-center">
              {idDocument ? <FileCheck2 className="mx-auto h-8 w-8 text-success" /> : <Upload className="mx-auto h-8 w-8 text-foreground-subtle" />}
              <p className="mt-2 text-sm font-medium text-foreground">Identity Document *</p>
              <p className="mt-1 text-xs text-foreground-muted">{idDocument?.name ?? 'CID, driving licence or other valid ID'}</p>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleFile(setIdDocument)} className="hidden" />
            </label>

            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-border bg-white p-5 text-center">
              {certificate ? <FileCheck2 className="mx-auto h-8 w-8 text-success" /> : <FileText className="mx-auto h-8 w-8 text-foreground-subtle" />}
              <p className="mt-2 text-sm font-medium text-foreground">
                Certificate {selectedCategory?.certificateRequired ? '*' : '(optional)'}
              </p>
              <p className="mt-1 text-xs text-foreground-muted">{certificate?.name ?? 'Trade, skill or professional certificate'}</p>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={handleFile(setCertificate)} className="hidden" />
            </label>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => { setErrorMessage(''); setStep((current) => current - 1); }} className="flex-1">
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={continueStep} className="flex-1 bg-primary text-white hover:bg-primary-dark">
              Continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => void submitApplication()}
              disabled={submitting}
              className="flex-1 bg-primary text-white hover:bg-primary-dark"
            >
              {submitting ? <LoaderCircle className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />}
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
