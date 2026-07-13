import { useEffect, useState } from 'react';
import { AlertTriangle, Clock3, HelpCircle, Mail, MessageCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router';
import AuthNotice from '@/components/auth/AuthNotice';
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { fetchSupportContacts, type SupportContacts } from '@/lib/complaints';

export default function Support() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<SupportContacts | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    void fetchSupportContacts()
      .then(setContacts)
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load support contacts.');
      });
  }, []);

  const items = contacts ? [
    { icon: Phone, label: 'Call Us', value: contacts.phone, href: `tel:${contacts.phone}` },
    { icon: Mail, label: 'Email Us', value: contacts.email, href: `mailto:${contacts.email}` },
    { icon: MessageCircle, label: 'WhatsApp', value: contacts.whatsapp, href: `https://wa.me/${contacts.whatsapp.replace(/\D/g, '')}` },
  ] : [];

  return (
    <div className="mx-auto min-h-screen w-full max-w-lg bg-white">
      <PageHeader title="Support" />
      <div className="px-4 py-6">
        {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}

        <div className="rounded-xl bg-primary-light p-5 text-center">
          <HelpCircle className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-3 text-lg font-bold text-foreground">How can we help?</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Contact our support team or submit a complaint linked to one of your bookings.
          </p>
          {contacts?.hours && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-foreground-muted">
              <Clock3 className="h-3.5 w-3.5 text-primary" />
              {contacts.hours}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target={item.label === 'WhatsApp' ? '_blank' : undefined}
              rel={item.label === 'WhatsApp' ? 'noreferrer' : undefined}
              className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="truncate text-xs text-foreground-muted">{item.value}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-error/20 bg-error-light/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-white">
              <AlertTriangle className="h-5 w-5 text-error" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Problem with a service?</h3>
              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                Submit a formal complaint with evidence. You will receive status and resolution updates in the app.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => user ? navigate('/complaints') : navigate('/login', { state: { from: { pathname: '/complaints' } } })}
            className="mt-3 h-10 w-full bg-error text-white hover:bg-error/90"
          >
            {user ? 'View or Submit Complaint' : 'Sign In to Submit Complaint'}
          </Button>
        </div>
      </div>
    </div>
  );
}
