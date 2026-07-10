import { Phone, MapPin, User } from 'lucide-react';
import { mockRequests } from '@/data';
import StatusBadge from '@/components/common/StatusBadge';

export default function AdminRequests() {
  return (
    <div className="px-4 py-4">
      <h2 className="mb-3 text-lg font-bold text-foreground">All Requests</h2>

      <div className="space-y-2">
        {mockRequests.map((req) => (
          <div key={req.id} className="rounded-xl bg-white p-4 shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{req.customerName}</h3>
                  <p className="text-xs text-foreground-muted">{req.serviceName}</p>
                </div>
              </div>
              <StatusBadge status={req.status} size="sm" />
            </div>

            <p className="mt-2 line-clamp-2 text-xs text-foreground-muted">{req.issueDescription}</p>

            <div className="mt-2 flex items-center gap-3 text-[11px] text-foreground-muted">
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3 w-3" />
                {req.location}
              </span>
              <span className="flex items-center gap-0.5">
                <Phone className="h-3 w-3" />
                {req.customerPhone}
              </span>
            </div>

            <div className="mt-2 text-[11px] text-foreground-subtle">
              Provider: {req.providerName} &middot; {new Date(req.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
