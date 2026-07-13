import { useEffect, useMemo, useState } from 'react';
import { MapPin, Phone, Search, Users } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import StatusBadge from '@/components/common/StatusBadge';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import { cn } from '@/lib/utils';
import { publicStorageUrl } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';
import type { AvailabilityStatus, ProviderStatus } from '@/types';

interface AdminProviderRow {
  id: string;
  display_name: string;
  business_name: string;
  profile_photo_path: string | null;
  primary_category_id: string | null;
  location_text: string;
  phone_public: string;
  availability_status: AvailabilityStatus;
  approval_status: Exclude<ProviderStatus, 'trial'>;
  is_verified: boolean;
  average_rating: number | string;
  review_count: number;
  created_at: string;
  categoryName: string;
}

export default function AdminProviders() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [providers, setProviders] = useState<AdminProviderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const { data, error } = await supabase
            .from('provider_profiles')
            .select('id, display_name, business_name, profile_photo_path, primary_category_id, location_text, phone_public, availability_status, approval_status, is_verified, average_rating, review_count, created_at')
            .order('created_at', { ascending: false });
          if (error) throw error;
          const rows = (data ?? []) as Omit<AdminProviderRow, 'categoryName'>[];
          const categoryIds = [...new Set(rows.map((row) => row.primary_category_id).filter(Boolean))] as string[];
          const categoryResult = categoryIds.length
            ? await supabase.from('service_categories').select('id, name').in('id', categoryIds)
            : { data: [], error: null };
          if (categoryResult.error) throw categoryResult.error;
          const names = new Map((categoryResult.data ?? []).map((row) => [row.id as string, row.name as string]));
          if (active) {
            setProviders(rows.map((row) => ({
              ...row,
              categoryName: row.primary_category_id ? names.get(row.primary_category_id) ?? 'Unknown category' : 'Not selected',
            })));
          }
        } catch (error) {
          console.error('[S2B Services] Unable to load admin providers:', error);
        } finally {
          if (active) setLoading(false);
        }
      })();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const filtered = useMemo(
    () =>
      providers.filter((provider) => {
        const query = search.toLowerCase();
        const matchesSearch =
          provider.display_name.toLowerCase().includes(query) ||
          provider.business_name.toLowerCase().includes(query) ||
          provider.categoryName.toLowerCase().includes(query);
        const matchesFilter =
          filter === 'all' ||
          provider.approval_status === filter ||
          provider.availability_status === filter;
        return matchesSearch && matchesFilter;
      }),
    [filter, providers, search]
  );

  const filters = ['all', 'approved', 'pending', 'rejected', 'available', 'busy', 'offline'];

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex h-10 items-center gap-2 rounded-lg border border-border bg-white px-3">
        <Search className="h-4 w-4 text-foreground-subtle" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search providers..."
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>

      <div className="mb-3 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
        {filters.map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={cn(
              'flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors',
              filter === item ? 'bg-primary text-white' : 'bg-muted text-foreground-muted'
            )}
          >
            {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton variant="list" count={6} />
      ) : (
        <div className="space-y-2">
          {filtered.map((provider) => (
            <div key={provider.id} className="rounded-xl bg-white p-4 shadow-card">
              <div className="flex items-start gap-3">
                <img
                  src={publicStorageUrl('avatars', provider.profile_photo_path) || '/provider-placeholder.svg'}
                  alt={provider.display_name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground">{provider.display_name}</h3>
                    {provider.is_verified && <VerifiedBadge size="sm" />}
                  </div>
                  <p className="text-xs text-foreground-muted">
                    {provider.categoryName} · {provider.business_name || 'Individual provider'}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <StatusBadge status={provider.approval_status} size="sm" />
                    <StatusBadge status={provider.availability_status} size="sm" />
                    {provider.review_count > 0 && (
                      <span className="text-[11px] text-foreground-muted">
                        {Number(provider.average_rating).toFixed(1)} ★ ({provider.review_count})
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-foreground-muted">
                    <span className="flex items-center gap-0.5">
                      <Phone className="h-3 w-3" />
                      {provider.phone_public || 'No phone'}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {provider.location_text || 'No location'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <EmptyState
              icon={Users}
              title="No providers found"
              description="No provider accounts match the current search and filter."
            />
          )}
        </div>
      )}
    </div>
  );
}
