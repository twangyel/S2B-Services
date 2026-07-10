import { FolderOpen, Pencil, Trash2, Zap } from 'lucide-react';
import { mockCategories } from '@/data';

export default function AdminCategories() {
  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Categories</h2>
        <button className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark">
          + Add Category
        </button>
      </div>

      <div className="space-y-2">
        {mockCategories.sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-card">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-light">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
                {cat.isPopular && (
                  <span className="rounded-full bg-secondary-light px-1.5 py-0.5 text-[10px] text-secondary">Popular</span>
                )}
                {cat.isEmergencyEnabled && (
                  <span className="flex items-center gap-0.5 rounded-full bg-error-light px-1.5 py-0.5 text-[10px] text-error">
                    <Zap className="h-3 w-3" />
                    Emergency
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground-muted">
                {cat.providerCount} providers &middot; From Nu. {cat.startingPrice}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted">
                <Pencil className="h-4 w-4 text-foreground-muted" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-error-light">
                <Trash2 className="h-4 w-4 text-error" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
