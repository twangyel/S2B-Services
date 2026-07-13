import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Filter } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import ProviderCard from '@/components/cards/ProviderCard';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';
import { fetchProviderDirectory, fetchServiceCategories } from '@/lib/catalog';
import type { Provider, ServiceCategory } from '@/types';

type FilterType = 'all' | 'available' | 'verified' | 'emergency';

export default function ProviderList() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchParams] = useSearchParams();
  const emergencyFilter = searchParams.get('emergency') === 'true';
  const [activeFilter, setActiveFilter] = useState<FilterType>(emergencyFilter ? 'emergency' : 'all');
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(Boolean(categoryId));

  useEffect(() => {
    if (!categoryId) return;
    let active = true;
    void Promise.all([fetchServiceCategories(), fetchProviderDirectory(categoryId)])
      .then(([categories, providers]) => {
        if (!active) return;
        setCategory(categories.find((item) => item.id === categoryId) ?? null);
        setAllProviders(providers);
      })
      .catch((error: unknown) => {
        console.error('[S2B Services] Unable to load providers:', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [categoryId]);

  const providers = useMemo(() => {
    let filtered = [...allProviders];
    if (activeFilter === 'available') {
      filtered = filtered.filter((provider) => provider.availabilityStatus === 'available');
    } else if (activeFilter === 'verified') {
      filtered = filtered.filter((provider) => provider.isVerified);
    } else if (activeFilter === 'emergency') {
      filtered = filtered.filter((provider) => provider.emergencyAvailable);
    }
    return filtered.sort((a, b) => b.rating - a.rating);
  }, [activeFilter, allProviders]);

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
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={cn(
              'flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              activeFilter === filter.key
                ? 'bg-primary text-white'
                : 'bg-muted text-foreground-muted'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton variant="card" count={4} />
      ) : (
        <div className="space-y-3 px-4 pb-6">
          {providers.length > 0 ? (
            providers.map((provider) => <ProviderCard key={provider.id} provider={provider} />)
          ) : (
            <EmptyState
              icon={Filter}
              title="No providers found"
              description={`No ${activeFilter === 'all' ? '' : `${activeFilter} `}providers are currently available in this category.`}
            />
          )}
        </div>
      )}
    </div>
  );
}
