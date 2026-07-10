import { useState } from 'react';
import { Search, Phone, MapPin } from 'lucide-react';
import { mockProviders } from '@/data';
import StatusBadge from '@/components/common/StatusBadge';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import { cn } from '@/lib/utils';

export default function AdminProviders() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = mockProviders.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.businessName.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.availabilityStatus === filter;
    return matchesSearch && matchesFilter;
  });

  const filters = ['all', 'available', 'busy', 'offline', 'emergency_only'];

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-3">
        <Search className="h-4 w-4 text-foreground-subtle" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search providers..."
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>

      <div className="mb-3 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
              filter === f ? 'bg-primary text-white' : 'bg-muted text-foreground-muted'
            )}
          >
            {f === 'all' ? 'All' : f === 'emergency_only' ? 'Emergency' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((provider) => (
          <div key={provider.id} className="rounded-xl bg-white p-4 shadow-card">
            <div className="flex items-start gap-3">
              <img src={provider.photo} alt={provider.name} className="h-10 w-10 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-foreground">{provider.name}</h3>
                  {provider.isVerified && <VerifiedBadge size="sm" />}
                </div>
                <p className="text-xs text-foreground-muted">{provider.categoryName} &middot; {provider.businessName}</p>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={provider.availabilityStatus} size="sm" />
                  <StatusBadge status={provider.subscriptionStatus} size="sm" />
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-foreground-muted">
                  <span className="flex items-center gap-0.5">
                    <Phone className="h-3 w-3" />
                    {provider.phone}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" />
                    {provider.location}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
