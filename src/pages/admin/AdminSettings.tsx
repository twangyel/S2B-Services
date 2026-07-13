import { useCallback, useEffect, useState } from 'react';
import { Building2, Headphones, LoaderCircle, Save, Smartphone } from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';

interface SettingsForm {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  paymentInstructions: string;
  supportPhone: string;
  supportEmail: string;
  supportWhatsapp: string;
  supportHours: string;
}

const emptyForm: SettingsForm = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  branch: '',
  paymentInstructions: '',
  supportPhone: '',
  supportEmail: '',
  supportWhatsapp: '',
  supportHours: '',
};

export default function AdminSettings() {
  const { user } = useAuth();
  const [form, setForm] = useState<SettingsForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadSettings = useCallback(async () => {
    setErrorMessage('');
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['subscription_payment_details', 'support_contacts']);
      if (error) throw error;

      const byKey = new Map((data ?? []).map((item) => [String(item.key), item.value as Record<string, unknown>]));
      const payment = byKey.get('subscription_payment_details') ?? {};
      const support = byKey.get('support_contacts') ?? {};
      setForm({
        bankName: String(payment.bank_name ?? ''),
        accountName: String(payment.account_name ?? ''),
        accountNumber: String(payment.account_number ?? ''),
        branch: String(payment.branch ?? ''),
        paymentInstructions: String(payment.instructions ?? ''),
        supportPhone: String(support.phone ?? ''),
        supportEmail: String(support.email ?? ''),
        supportWhatsapp: String(support.whatsapp ?? ''),
        supportHours: String(support.hours ?? ''),
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSettings();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadSettings]);

  const setField = (key: keyof SettingsForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveSettings = async () => {
    if (!user) return;
    if (!form.bankName.trim() || !form.accountName.trim() || !form.accountNumber.trim()) {
      setErrorMessage('Bank name, account name and account number are required.');
      return;
    }
    if (!form.supportPhone.trim() || !form.supportEmail.trim() || !form.supportWhatsapp.trim()) {
      setErrorMessage('Phone, email and WhatsApp support contacts are required.');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const { error } = await supabase.from('app_settings').upsert([
        {
          key: 'subscription_payment_details',
          value: {
            bank_name: form.bankName.trim(),
            account_name: form.accountName.trim(),
            account_number: form.accountNumber.trim(),
            branch: form.branch.trim(),
            instructions: form.paymentInstructions.trim(),
          },
          description: 'Public bank-transfer instructions for provider subscriptions',
          is_public: true,
          updated_by: user.id,
        },
        {
          key: 'support_contacts',
          value: {
            phone: form.supportPhone.trim(),
            email: form.supportEmail.trim(),
            whatsapp: form.supportWhatsapp.trim(),
            hours: form.supportHours.trim(),
          },
          description: 'Public S2B Services support contacts',
          is_public: true,
          updated_by: user.id,
        },
      ], { onConflict: 'key' });
      if (error) throw error;
      setSuccessMessage('Payment and support settings updated successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton variant="list" />;

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="space-y-4 px-4 py-4">
        {errorMessage && <AuthNotice type="error" message={errorMessage} />}
        {successMessage && <AuthNotice type="success" message={successMessage} />}

        <section className="rounded-xl bg-white shadow-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Smartphone className="h-4 w-4 text-primary" />
              App Identity
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 text-sm">
            <div><p className="text-xs text-foreground-muted">App Name</p><p className="font-semibold text-foreground">S2B Services</p></div>
            <div><p className="text-xs text-foreground-muted">Currency</p><p className="font-semibold text-foreground">Nu. (BTN)</p></div>
          </div>
        </section>

        <section className="rounded-xl bg-white shadow-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Building2 className="h-4 w-4 text-primary" />
              Provider Subscription Payment
            </h2>
            <p className="mt-1 text-xs text-foreground-muted">Shown to providers before they upload payment proof.</p>
          </div>
          <div className="space-y-4 p-4">
            <div><Label htmlFor="bank-name">Bank Name</Label><Input id="bank-name" value={form.bankName} onChange={(event) => setField('bankName', event.target.value)} className="mt-1.5" /></div>
            <div><Label htmlFor="account-name">Account Name</Label><Input id="account-name" value={form.accountName} onChange={(event) => setField('accountName', event.target.value)} className="mt-1.5" /></div>
            <div><Label htmlFor="account-number">Account Number</Label><Input id="account-number" value={form.accountNumber} onChange={(event) => setField('accountNumber', event.target.value)} className="mt-1.5" /></div>
            <div><Label htmlFor="branch">Branch</Label><Input id="branch" value={form.branch} onChange={(event) => setField('branch', event.target.value)} className="mt-1.5" /></div>
            <div><Label htmlFor="payment-instructions">Payment Instructions</Label><Textarea id="payment-instructions" value={form.paymentInstructions} onChange={(event) => setField('paymentInstructions', event.target.value)} className="mt-1.5 min-h-24" /></div>
          </div>
        </section>

        <section className="rounded-xl bg-white shadow-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Headphones className="h-4 w-4 text-primary" />
              Customer Support Contacts
            </h2>
            <p className="mt-1 text-xs text-foreground-muted">Displayed on the public Support page.</p>
          </div>
          <div className="space-y-4 p-4">
            <div><Label htmlFor="support-phone">Phone</Label><Input id="support-phone" value={form.supportPhone} onChange={(event) => setField('supportPhone', event.target.value)} className="mt-1.5" /></div>
            <div><Label htmlFor="support-email">Email</Label><Input id="support-email" type="email" value={form.supportEmail} onChange={(event) => setField('supportEmail', event.target.value)} className="mt-1.5" /></div>
            <div><Label htmlFor="support-whatsapp">WhatsApp</Label><Input id="support-whatsapp" value={form.supportWhatsapp} onChange={(event) => setField('supportWhatsapp', event.target.value)} className="mt-1.5" /></div>
            <div><Label htmlFor="support-hours">Support Hours</Label><Input id="support-hours" value={form.supportHours} onChange={(event) => setField('supportHours', event.target.value)} className="mt-1.5" /></div>
          </div>
        </section>

        <Button
          type="button"
          onClick={() => void saveSettings()}
          disabled={saving}
          className="h-12 w-full bg-primary text-white hover:bg-primary-dark"
        >
          {saving ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Settings
        </Button>

        <p className="text-center text-xs text-foreground-subtle">S2B Services Admin v1.0.0</p>
      </div>
    </div>
  );
}
