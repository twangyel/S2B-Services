import { ClipboardList } from 'lucide-react';
import { mockRequests } from '@/data';
import PageHeader from '@/components/common/PageHeader';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';

const statusOrder = ['in_progress', 'accepted', 'sent', 'completed', 'draft', 'cancelled', 'rejected'];

export default function Requests() {
  const sortedRequests = [...mockRequests].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
  );

  return (
    <div>
      <PageHeader title="My Bookings" showBack={false} />

      <div className="space-y-2 px-4 py-3">
        {sortedRequests.length > 0 ? (
          sortedRequests.map((req) => (
            <div key={req.id} className="rounded-xl bg-white p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{req.serviceName}</h3>
                  <p className="mt-0.5 text-xs text-foreground-muted">{req.providerName}</p>
                </div>
                <StatusBadge status={req.status} size="sm" />
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-foreground-muted">{req.issueDescription}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] text-foreground-subtle">
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>
                {req.rating && (
                  <div className="flex items-center gap-0.5">
                    <span className="text-[11px] font-medium text-warning">{req.rating}</span>
                    <span className="text-[11px] text-foreground-muted">/5</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No bookings yet"
            description="Your service bookings will appear here."
          />
        )}
      </div>
    </div>
  );
}
