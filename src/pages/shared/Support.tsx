import { HelpCircle, Phone, Mail, MessageCircle } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';

export default function Support() {
  return (
    <div>
      <PageHeader title="Support" />
      <div className="px-4 py-6">
        <div className="rounded-xl bg-primary-light p-5 text-center">
          <HelpCircle className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-3 text-lg font-bold text-foreground">How can we help?</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            Our support team is here to assist you with any issues.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {[
            { icon: Phone, label: 'Call Us', value: '+975-2-123456' },
            { icon: Mail, label: 'Email Us', value: 'support@s2bservices.bt' },
            { icon: MessageCircle, label: 'WhatsApp', value: '+975-17123456' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.label === 'Email Us' ? `mailto:${item.value}` : item.label === 'Call Us' ? `tel:${item.value}` : `https://wa.me/${item.value.replace(/\D/g, '')}`}
              className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-foreground-muted">{item.value}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
