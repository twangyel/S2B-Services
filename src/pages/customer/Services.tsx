import { useState } from 'react';
import { Search } from 'lucide-react';
import { mockCategories } from '@/data';
import PageHeader from '@/components/common/PageHeader';
import ServiceCategoryCard from '@/components/cards/ServiceCategoryCard';

export default function Services() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = mockCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularCategories = filteredCategories.filter((c) => c.isPopular);
  const otherCategories = filteredCategories.filter((c) => !c.isPopular);

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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-4 px-4 pb-6">
        {popularCategories.length > 0 && (
          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">Popular Services</h2>
            <div className="grid grid-cols-3 gap-2">
              {popularCategories.map((cat) => (
                <ServiceCategoryCard key={cat.id} category={cat} variant="grid" />
              ))}
            </div>
          </section>
        )}

        {otherCategories.length > 0 && (
          <section>
            <h2 className="mb-2 text-base font-bold text-foreground">All Services</h2>
            <div className="grid grid-cols-3 gap-2">
              {otherCategories.map((cat) => (
                <ServiceCategoryCard key={cat.id} category={cat} variant="grid" />
              ))}
            </div>
          </section>
        )}

        {filteredCategories.length === 0 && (
          <div className="py-12 text-center text-sm text-foreground-muted">
            No services found matching &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}
