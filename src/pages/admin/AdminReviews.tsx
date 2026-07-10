import { MessageSquare, AlertTriangle } from 'lucide-react';
import { mockReviews, mockComplaints } from '@/data';
import ReviewCard from '@/components/cards/ReviewCard';
import StatusBadge from '@/components/common/StatusBadge';

export default function AdminReviews() {
  return (
    <div className="px-4 py-4">
      {/* Complaints Section */}
      <h2 className="mb-3 text-lg font-bold text-foreground flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-error" />
        Complaints ({mockComplaints.length})
      </h2>

      <div className="mb-6 space-y-2">
        {mockComplaints.map((comp) => (
          <div key={comp.id} className="rounded-xl bg-white p-4 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{comp.customerName}</h3>
                <p className="text-xs text-foreground-muted">vs {comp.providerName}</p>
              </div>
              <StatusBadge status={comp.status} size="sm" />
            </div>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={comp.type} size="sm" />
            </div>
            <p className="mt-2 text-xs text-foreground-muted">{comp.description}</p>
            <div className="mt-1 text-[11px] text-foreground-subtle">
              {new Date(comp.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Reviews Section */}
      <h2 className="mb-3 text-lg font-bold text-foreground flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        Reviews ({mockReviews.length})
      </h2>

      <div className="space-y-2">
        {mockReviews.slice(0, 8).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
