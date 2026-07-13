import { useCallback, useEffect, useState } from 'react';
import { FolderOpen, LoaderCircle, Power, RefreshCw, Zap } from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { fetchServiceCategories } from '@/lib/catalog';
import { supabase } from '@/lib/supabase';
import type { ServiceCategory } from '@/types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, description, icon, starting_price, is_popular, is_emergency_enabled, certificate_required, sort_order, is_active')
        .order('sort_order');
      if (error) throw error;
      const providerCounts = await fetchServiceCategories();
      const counts = new Map(providerCounts.map((category) => [category.id, category.providerCount]));
      setCategories((data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        icon: row.icon,
        providerCount: counts.get(row.id) ?? 0,
        startingPrice: Number(row.starting_price),
        isPopular: row.is_popular,
        isEmergencyEnabled: row.is_emergency_enabled,
        certificateRequired: row.certificate_required,
        sortOrder: row.sort_order,
        isActive: row.is_active,
      })));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCategories();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCategories]);

  const toggleCategory = async (category: ServiceCategory) => {
    setActionId(category.id);
    setMessage('');
    setErrorMessage('');
    const { error } = await supabase
      .from('service_categories')
      .update({ is_active: !category.isActive })
      .eq('id', category.id);
    setActionId(null);
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    setCategories((current) => current.map((item) => (
      item.id === category.id ? { ...item, isActive: !item.isActive } : item
    )));
    setMessage(`${category.name} is now ${category.isActive ? 'hidden' : 'active'}.`);
  };

  return (
    <div className="px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Categories</h2>
        <Button variant="outline" size="sm" onClick={() => void loadCategories()} disabled={loading}>
          <RefreshCw className="mr-1 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {message && <div className="mb-3"><AuthNotice type="success" message={message} /></div>}
      {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}

      {loading ? (
        <LoadingSkeleton variant="list" count={8} />
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className={`flex items-center gap-3 rounded-xl bg-white p-3 shadow-card ${category.isActive ? '' : 'opacity-60'}`}>
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-light">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
                  {category.isPopular && (
                    <span className="rounded-full bg-secondary-light px-1.5 py-0.5 text-[10px] text-secondary">Popular</span>
                  )}
                  {category.isEmergencyEnabled && (
                    <span className="flex items-center gap-0.5 rounded-full bg-error-light px-1.5 py-0.5 text-[10px] text-error">
                      <Zap className="h-3 w-3" />
                      Emergency
                    </span>
                  )}
                  {!category.isActive && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-foreground-muted">Hidden</span>
                  )}
                </div>
                <p className="text-xs text-foreground-muted">
                  {category.providerCount} providers · From Nu. {category.startingPrice}
                </p>
              </div>
              <button
                onClick={() => void toggleCategory(category)}
                disabled={actionId === category.id}
                title={category.isActive ? 'Hide category' : 'Activate category'}
                className={`flex h-9 w-9 items-center justify-center rounded-full ${category.isActive ? 'hover:bg-error-light' : 'hover:bg-success-light'}`}
              >
                {actionId === category.id ? (
                  <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Power className={`h-4 w-4 ${category.isActive ? 'text-error' : 'text-success'}`} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
