import { ClipboardList, Phone, MapPin } from 'lucide-react';
import { mockRequests } from '@/data';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';

export default function ProviderRequests() {
  const requests = mockRequests.filter((r) => r.status === 'sent' || r.status === 'accepted');

  return (
    <div className="px-4 py-4">
      <h2 className="mb-3 text-lg font-bold text-foreground">Incoming Requests</h2>

      <div className="space-y-3">
        {requests.length > 0 ? (
          requests.map((req) => (
            <div key={req.id} className="rounded-xl bg-white p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{req.serviceName}</h3>
                  <p className="text-xs text-foreground-muted">{req.customerName} &middot; {req.customerPhone}</p>
                </div>
                <StatusBadge status={req.status} size="sm" />
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-foreground-muted">{req.issueDescription}</p>
              <div className="mt-1 flex items-center gap-1 text-[11px] text-foreground-subtle">
                <MapPin className="h-3 w-3" />
                {req.location}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1 bg-primary text-white hover:bg-primary-dark">
                  <Phone className="mr-1 h-3.5 w-3.5" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Accept
                </Button>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No new requests"
            description="Customer requests will appear here."
          />
        )}
      </div>
    </div>
  );
}
