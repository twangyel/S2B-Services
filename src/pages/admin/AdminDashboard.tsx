import {
  Users,
  UserCheck,
  ClipboardList,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { mockAdminAnalytics } from '@/data';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const stats = [
    { icon: Users, label: 'Total Providers', value: mockAdminAnalytics.totalProviders, color: 'text-primary', bg: 'bg-primary-light' },
    { icon: UserCheck, label: 'Active Providers', value: mockAdminAnalytics.activeProviders, color: 'text-success', bg: 'bg-success-light' },
    { icon: ClipboardList, label: 'Total Requests', value: mockAdminAnalytics.totalRequests, color: 'text-info', bg: 'bg-info-light' },
    { icon: DollarSign, label: 'Monthly Revenue', value: `Nu. ${mockAdminAnalytics.monthlyRevenue.toLocaleString()}`, color: 'text-secondary', bg: 'bg-secondary-light' },
    { icon: UserCheck, label: 'Pending Approvals', value: mockAdminAnalytics.pendingApprovals, color: 'text-warning', bg: 'bg-warning-light' },
    { icon: AlertTriangle, label: 'Open Complaints', value: mockAdminAnalytics.openComplaints, color: 'text-error', bg: 'bg-error-light' },
    { icon: Star, label: 'Pending Reviews', value: mockAdminAnalytics.pendingReviews, color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: TrendingUp, label: 'Active Subs', value: mockAdminAnalytics.activeSubscriptions, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="px-4 py-4">
      <h2 className="mb-4 text-lg font-bold text-foreground">Dashboard Overview</h2>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white p-4 shadow-card">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.bg)}>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </div>
            <p className="mt-2 text-xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-xs text-foreground-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 shadow-card">
        <h3 className="text-sm font-bold text-foreground">Most Used Service</h3>
        <p className="mt-1 text-lg font-semibold text-primary">{mockAdminAnalytics.mostUsedService}</p>
      </div>
    </div>
  );
}
