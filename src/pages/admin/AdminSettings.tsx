import { useState } from 'react';
import { Bell, Shield, Globe, Smartphone } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';

export default function AdminSettings() {
  const [notifications, setNotifications] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);

  return (
    <div>
      <PageHeader title="Settings" />

      <div className="space-y-4 px-4 py-4">
        {/* App Settings */}
        <section className="rounded-xl bg-white shadow-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Smartphone className="h-4 w-4 text-primary" />
              App Settings
            </h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">App Name</p>
                <p className="text-xs text-foreground-muted">S2B Services</p>
              </div>
              <span className="text-xs text-foreground-subtle">Read only</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Currency</p>
                <p className="text-xs text-foreground-muted">Nu. (Bhutanese Ngultrum)</p>
              </div>
              <span className="text-xs text-foreground-subtle">Read only</span>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-xl bg-white shadow-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Bell className="h-4 w-4 text-primary" />
              Notifications
            </h2>
          </div>
          <div className="divide-y divide-border">
            <label className="flex cursor-pointer items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Email Alerts</p>
                <p className="text-xs text-foreground-muted">New provider applications</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative h-7 w-12 rounded-full transition-colors ${notifications ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
          </div>
        </section>

        {/* Security */}
        <section className="rounded-xl bg-white shadow-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Shield className="h-4 w-4 text-primary" />
              Security
            </h2>
          </div>
          <div className="divide-y divide-border">
            <label className="flex cursor-pointer items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Auto-approve Providers</p>
                <p className="text-xs text-foreground-muted">Skip manual approval step</p>
              </div>
              <button
                onClick={() => setAutoApprove(!autoApprove)}
                className={`relative h-7 w-12 rounded-full transition-colors ${autoApprove ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${autoApprove ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
          </div>
        </section>

        {/* Region */}
        <section className="rounded-xl bg-white shadow-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Globe className="h-4 w-4 text-primary" />
              Region
            </h2>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-foreground">Primary Service Area</p>
            <p className="text-xs text-foreground-muted">Bhutan (All 20 Dzongkhags)</p>
          </div>
        </section>

        <p className="text-center text-xs text-foreground-subtle">S2B Services Admin v1.0.0</p>
      </div>
    </div>
  );
}
