import { useState } from 'react';
import { CheckCircle2, ChevronRight, Upload } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';

export default function ProviderRegister() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    businessName: '',
    categoryId: '',
    location: '',
    experience: '',
    skills: '',
    visitCharge: '',
  });

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      <PageHeader title="Become a Provider" />

      <div className="px-4 py-4">
        {/* Progress Steps */}
        <div className="mb-6 flex items-center justify-between">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  s <= step ? 'bg-primary text-white' : 'bg-muted text-foreground-muted'
                }`}
              >
                {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-12 ${s < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                placeholder="Your full name"
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Phone Number *</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                placeholder="+975-XXXXXXXXX"
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Business Name</label>
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => updateForm('businessName', e.target.value)}
                placeholder="Your business name (optional)"
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Service Details</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Service Category *</label>
              <input
                type="text"
                value={form.categoryId}
                onChange={(e) => updateForm('categoryId', e.target.value)}
                placeholder="e.g., Electrician, Plumber"
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Location *</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateForm('location', e.target.value)}
                placeholder="Your primary service area"
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Experience (years)</label>
              <input
                type="number"
                value={form.experience}
                onChange={(e) => updateForm('experience', e.target.value)}
                placeholder="Years of experience"
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Skills & Pricing</h2>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Skills (comma separated)</label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => updateForm('skills', e.target.value)}
                placeholder="e.g., Wiring, Installation, Repair"
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Visit Charge (Nu.) *</label>
              <input
                type="number"
                value={form.visitCharge}
                onChange={(e) => updateForm('visitCharge', e.target.value)}
                placeholder="e.g., 200"
                className="h-12 w-full rounded-lg border border-border bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-foreground-subtle" />
              <p className="mt-2 text-sm font-medium text-foreground">Upload Documents</p>
              <p className="mt-1 text-xs text-foreground-muted">ID proof, certificates (optional)</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="flex-1 bg-primary text-white hover:bg-primary-dark">
              Continue
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button className="flex-1 bg-primary text-white hover:bg-primary-dark">
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
