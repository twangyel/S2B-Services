import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Filter } from 'lucide-react';
import { mockProviders, mockCategories } from '@/data';
import PageHeader from '@/components/common/PageHeader';
import ProviderCard from '@/components/cards/ProviderCard';
import EmptyState from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'available' | 'verified' | 'emergency';

export default function ProviderList() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const emergencyFilter = searchParams.get('emergency') === 'true';

  const [activeFilter, setActiveFilter] = useState<FilterType>(emergencyFilter ? 'emergency' : 'all');

  const category = mockCategories.find((c) => c.id === categoryId);

  const providers = useMemo(() => {
    let filtered = mockProviders.filter((p) => p.categoryId === categoryId);

    if (activeFilter === 'available') {
      filtered = filtered.filter((p) => p.availabilityStatus === 'available');
    } else if (activeFilter === 'verified') {
      filtered = filtered.filter((p) => p.isVerified);
    } else if (activeFilter === 'emergency') {
      filtered = filtered.filter((p) => p.emergencyAvailable);
    }

    return filtered.sort((a, b) => b.rating - a.rating);
  }, [categoryId, activeFilter]);

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available' },
    { key: 'verified', label: 'Verified' },
    { key: 'emergency', label: 'Emergency' },
  ];

  return (
    <div>
      <PageHeader title={category?.name || 'Providers'} />

      <div className="flex items-center gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
        <Filter className="h-4 w-4 flex-shrink-0 text-foreground-muted" />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              'flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              activeFilter === f.key
                ? 'bg-primary text-white'
                : 'bg-muted text-foreground-muted'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 px-4 pb-6">
        {providers.length > 0 ? (
          providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))
        ) : (
          <EmptyState
            icon={Filter}
            title="No providers found"
            description={`No ${activeFilter} providers available in this category.`}
          />
        )}
      </div>
    </div>
  );
}
