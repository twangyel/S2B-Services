import { useState } from 'react';
import {
  TrendingUp,
  ClipboardList,
  Phone,
  Star,
  MapPin,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { mockRequests } from '@/data';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/common/StatusBadge';

export default function ProviderDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const myRequests = mockRequests.filter((r) => r.providerId === 'prov-001').slice(0, 5);

  const stats = [
    { icon: ClipboardList, label: 'Total Requests', value: '24', color: 'text-primary', bg: 'bg-primary-light' },
    { icon: Phone, label: 'Calls Today', value: '8', color: 'text-success', bg: 'bg-success-light' },
    { icon: Star, label: 'Rating', value: '4.8', color: 'text-warning', bg: 'bg-warning-light' },
    { icon: TrendingUp, label: 'Views', value: '156', color: 'text-info', bg: 'bg-info-light' },
  ];

  return (
    <div className="px-4 py-4">
      {/* Status Toggle */}
      <div className="mb-4 flex items-center justify-between rounded-xl bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <div className={cn('h-3 w-3 rounded-full', isOnline ? 'bg-success' : 'bg-error')} />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isOnline ? 'You are Online' : 'You are Offline'}
            </p>
            <p className="text-xs text-foreground-muted">
              {isOnline ? 'Customers can find you' : 'You are hidden from customers'}
            </p>
          </div>
        </div>
        <button onClick={() => setIsOnline(!isOnline)}>
          {isOnline ? (
            <ToggleRight className="h-8 w-8 text-success" />
          ) : (
            <ToggleLeft className="h-8 w-8 text-foreground-subtle" />
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white p-4 shadow-card">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.bg)}>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-xs text-foreground-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="rounded-xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-sm font-bold text-foreground">Recent Requests</h2>
          <button className="text-xs font-medium text-primary">View All</button>
        </div>
        <div className="divide-y divide-border">
          {myRequests.length > 0 ? (
            myRequests.map((req) => (
              <div key={req.id} className="flex items-start justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{req.customerName}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-foreground-muted">{req.issueDescription}</p>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-foreground-subtle">
                    <MapPin className="h-3 w-3" />
                    {req.location}
                  </div>
                </div>
                <StatusBadge status={req.status} size="sm" />
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-foreground-muted">No recent requests</div>
          )}
        </div>
      </div>
    </div>
  );
}
