import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ClipboardList,
  DollarSign,
  Star,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface DashboardData {
  totalProviders: number;
  activeProviders: number;
  totalRequests: number;
  monthlyRevenue: number;
  pendingApprovals: number;
  openComplaints: number;
  pendingReviews: number;
  activeSubscriptions: number;
  mostUsedService: string;
}

const emptyData: DashboardData = {
  totalProviders: 0,
  activeProviders: 0,
  totalRequests: 0,
  monthlyRevenue: 0,
  pendingApprovals: 0,
  openComplaints: 0,
  pendingReviews: 0,
  activeSubscriptions: 0,
  mostUsedService: 'No bookings yet',
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadDashboard = useCallback(async () => {
    setErrorMessage('');
    try {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const [
        totalProvidersResult,
        activeProvidersResult,
        pendingApprovalsResult,
        totalRequestsResult,
        requestsResult,
        activeSubscriptionsResult,
        paymentsResult,
        pendingReviewsResult,
        openComplaintsResult,
      ] = await Promise.all([
        supabase.from('provider_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('approval_status', 'approved'),
        supabase.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('approval_status', 'pending'),
        supabase.from('service_requests').select('*', { count: 'exact', head: true }),
        supabase.from('service_requests').select('service_name_snapshot'),
        supabase.from('provider_subscriptions').select('*', { count: 'exact', head: true }).in('status', ['trial', 'active']),
        supabase.from('subscription_payment_proofs').select('amount').eq('status', 'verified').gte('verified_at', monthStart.toISOString()),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
        supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      ]);

      const errors = [
        totalProvidersResult.error,
        activeProvidersResult.error,
        pendingApprovalsResult.error,
        totalRequestsResult.error,
        requestsResult.error,
        activeSubscriptionsResult.error,
        paymentsResult.error,
        pendingReviewsResult.error,
        openComplaintsResult.error,
      ].filter(Boolean);
      if (errors.length > 0) throw errors[0];

      const serviceCounts = new Map<string, number>();
      for (const request of requestsResult.data ?? []) {
        const name = String(request.service_name_snapshot || 'Other');
        serviceCounts.set(name, (serviceCounts.get(name) ?? 0) + 1);
      }
      const mostUsedService = [...serviceCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No bookings yet';
      const monthlyRevenue = (paymentsResult.data ?? []).reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

      setData({
        totalProviders: totalProvidersResult.count ?? 0,
        activeProviders: activeProvidersResult.count ?? 0,
        totalRequests: totalRequestsResult.count ?? 0,
        monthlyRevenue,
        pendingApprovals: pendingApprovalsResult.count ?? 0,
        openComplaints: openComplaintsResult.count ?? 0,
        pendingReviews: pendingReviewsResult.count ?? 0,
        activeSubscriptions: activeSubscriptionsResult.count ?? 0,
        mostUsedService,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load dashboard analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadDashboard();
    }, 0);
    const channel = supabase
      .channel('admin-dashboard-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => void loadDashboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'provider_profiles' }, () => void loadDashboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => void loadDashboard())
      .subscribe();
    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [loadDashboard]);

  const stats = useMemo(() => [
    { icon: Users, label: 'Total Providers', value: data.totalProviders, color: 'text-primary', bg: 'bg-primary-light' },
    { icon: UserCheck, label: 'Active Providers', value: data.activeProviders, color: 'text-success', bg: 'bg-success-light' },
    { icon: ClipboardList, label: 'Total Requests', value: data.totalRequests, color: 'text-info', bg: 'bg-info-light' },
    { icon: DollarSign, label: 'Monthly Revenue', value: `Nu. ${data.monthlyRevenue.toLocaleString()}`, color: 'text-secondary', bg: 'bg-secondary-light' },
    { icon: UserCheck, label: 'Pending Approvals', value: data.pendingApprovals, color: 'text-warning', bg: 'bg-warning-light' },
    { icon: AlertTriangle, label: 'Open Complaints', value: data.openComplaints, color: 'text-error', bg: 'bg-error-light' },
    { icon: Star, label: 'Pending Reviews', value: data.pendingReviews, color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: TrendingUp, label: 'Active Subs', value: data.activeSubscriptions, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ], [data]);

  if (loading) return <LoadingSkeleton variant="stats" />;

  return (
    <div className="px-4 py-4">
      <h2 className="mb-4 text-lg font-bold text-foreground">Dashboard Overview</h2>
      {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}

      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl bg-white p-4 shadow-card">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', stat.bg)}>
              <stat.icon className={cn('h-5 w-5', stat.color)} />
            </div>
            <p className="mt-2 text-xl font-extrabold text-foreground">{stat.value}</p>
            <p className="text-xs text-foreground-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 shadow-card">
        <h3 className="text-sm font-bold text-foreground">Most Used Service</h3>
        <p className="mt-1 text-lg font-semibold text-primary">{data.mostUsedService}</p>
      </div>
    </div>
  );
}
