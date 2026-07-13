import { useEffect, useMemo, useState } from 'react';
import { Search, Wrench } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import ServiceCategoryCard from '@/components/cards/ServiceCategoryCard';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import EmptyState from '@/components/common/EmptyState';
import { fetchServiceCategories } from '@/lib/catalog';
import type { ServiceCategory } from '@/types';

export default function Services() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchServiceCategories()
      .then((data) => {
        if (active) setCategories(data);
      })
      .catch((error: unknown) => {
        console.error('[S2B Services] Unable to load service categories:', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [categories, searchQuery]
  );

  const popularCategories = filteredCategories.filter((category) => category.isPopular);
  const otherCategories = filteredCategories.filter((category) => !category.isPopular);

  return (
    <div>
      <PageHeader title="Services" showBack={false} />

      <div className="px-4 py-3">
        <div className="flex h-12 items-center gap-3 rounded-full bg-muted px-4">
          <Search className="h-5 w-5 text-foreground-subtle" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton variant="list" count={6} />
      ) : (
        <div className="space-y-4 px-4 pb-6">
          {popularCategories.length > 0 && (
            <section>
              <h2 className="mb-2 text-base font-bold text-foreground">Popular Services</h2>
              <div className="grid grid-cols-3 gap-2">
                {popularCategories.map((category) => (
                  <ServiceCategoryCard key={category.id} category={category} variant="grid" />
                ))}
              </div>
            </section>
          )}

          {otherCategories.length > 0 && (
            <section>
              <h2 className="mb-2 text-base font-bold text-foreground">All Services</h2>
              <div className="grid grid-cols-3 gap-2">
                {otherCategories.map((category) => (
                  <ServiceCategoryCard key={category.id} category={category} variant="grid" />
                ))}
              </div>
            </section>
          )}

          {filteredCategories.length === 0 && (
            <EmptyState
              icon={Wrench}
              title="No services found"
              description={
                searchQuery
                  ? `No services match “${searchQuery}”.`
                  : 'No active services are available yet.'
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
