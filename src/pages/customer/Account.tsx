import {
  User,
  Phone,
  HelpCircle,
  FileText,
  Shield,
  Wrench,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import PageHeader from '@/components/common/PageHeader';

export default function Account() {
  const navigate = useNavigate();

  const menuItems = [
    { icon: User, label: 'My Profile', path: '#' },
    { icon: Phone, label: 'My Requests', path: '/requests' },
    { icon: Wrench, label: 'Become a Provider', path: '/become-provider' },
    { icon: HelpCircle, label: 'Support & FAQ', path: '/faq' },
    { icon: FileText, label: 'Terms of Service', path: '/terms' },
    { icon: Shield, label: 'Privacy Policy', path: '/privacy' },
  ];

  return (
    <div>
      <PageHeader title="Account" showBack={false} />

      <div className="px-4 py-6">
        <div className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-light">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h2 className="mt-3 text-lg font-bold text-foreground">Guest User</h2>
          <p className="text-sm text-foreground-muted">Sign in to access all features</p>
        </div>
      </div>

      <div className="space-y-1 px-4">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex w-full items-center gap-3 rounded-xl bg-white px-4 py-3.5 shadow-card transition-colors active:bg-muted"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <item.icon className="h-5 w-5 text-foreground" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
            <ChevronRight className="h-4 w-4 text-foreground-subtle" />
          </button>
        ))}

        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-error/30 py-3 text-sm font-medium text-error transition-colors hover:bg-error-light">
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
