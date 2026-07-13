import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Eye, EyeOff, MessageSquare, Star } from 'lucide-react';
import AuthNotice from '@/components/auth/AuthNotice';
import EmptyState from '@/components/common/EmptyState';
import LoadingSkeleton from '@/components/common/LoadingSkeleton';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface ReviewRow {
  id: string;
  provider_id: string;
  customer_name_snapshot: string;
  rating: number;
  comment: string;
  moderation_status: 'pending' | 'published' | 'hidden' | 'rejected';
  created_at: string;
}

interface ComplaintRow {
  id: string;
  provider_id: string;
  customer_id: string;
  complaint_type: 'urgent' | 'quality' | 'general';
  description: string;
  status: 'open' | 'resolved' | 'escalated';
  created_at: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [complaints, setComplaints] = useState<ComplaintRow[]>([]);
  const [providerNames, setProviderNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = useCallback(async () => {
    setErrorMessage('');
    try {
      const [reviewsResult, complaintsResult, providersResult] = await Promise.all([
        supabase.from('reviews').select('id, provider_id, customer_name_snapshot, rating, comment, moderation_status, created_at').order('created_at', { ascending: false }),
        supabase.from('complaints').select('id, provider_id, customer_id, complaint_type, description, status, created_at').order('created_at', { ascending: false }),
        supabase.from('provider_profiles').select('id, display_name'),
      ]);
      if (reviewsResult.error) throw reviewsResult.error;
      if (complaintsResult.error) throw complaintsResult.error;
      if (providersResult.error) throw providersResult.error;
      setReviews((reviewsResult.data ?? []) as ReviewRow[]);
      setComplaints((complaintsResult.data ?? []) as ComplaintRow[]);
      setProviderNames(Object.fromEntries((providersResult.data ?? []).map((item) => [String(item.id), String(item.display_name)])));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load reviews and complaints.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    const channel = supabase
      .channel('admin-reviews-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, () => void loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => void loadData())
      .subscribe();
    return () => {
      window.clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [loadData]);

  const openComplaints = useMemo(() => complaints.filter((complaint) => complaint.status !== 'resolved'), [complaints]);

  const updateReview = async (id: string, moderationStatus: ReviewRow['moderation_status']) => {
    setWorkingId(id);
    setErrorMessage('');
    const { error } = await supabase.from('reviews').update({ moderation_status: moderationStatus }).eq('id', id);
    setWorkingId('');
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    await loadData();
  };

  if (loading) return <LoadingSkeleton variant="list" />;

  return (
    <div className="px-4 py-4">
      {errorMessage && <div className="mb-3"><AuthNotice type="error" message={errorMessage} /></div>}

      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
        <AlertTriangle className="h-5 w-5 text-error" />
        Complaints ({openComplaints.length})
      </h2>
      <div className="mb-6 space-y-2">
        {openComplaints.length > 0 ? openComplaints.map((complaint) => (
          <div key={complaint.id} className="rounded-xl bg-white p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Against {providerNames[complaint.provider_id] ?? 'Provider'}</h3>
                <p className="mt-1 text-xs text-foreground-muted">{new Date(complaint.created_at).toLocaleDateString()}</p>
              </div>
              <StatusBadge status={complaint.status} size="sm" />
            </div>
            <div className="mt-2"><StatusBadge status={complaint.complaint_type} size="sm" /></div>
            <p className="mt-2 text-xs leading-relaxed text-foreground-muted">{complaint.description}</p>
          </div>
        )) : (
          <EmptyState icon={AlertTriangle} title="No open complaints" description="Customer complaints will appear here." />
        )}
      </div>

      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-foreground">
        <MessageSquare className="h-5 w-5 text-primary" />
        Reviews ({reviews.length})
      </h2>
      <div className="space-y-2">
        {reviews.length > 0 ? reviews.map((review) => (
          <div key={review.id} className="rounded-xl bg-white p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{review.customer_name_snapshot}</h3>
                <p className="text-xs text-foreground-muted">for {providerNames[review.provider_id] ?? 'Provider'}</p>
              </div>
              <StatusBadge status={review.moderation_status} size="sm" />
            </div>
            <div className="mt-2 flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`h-4 w-4 ${value <= review.rating ? 'fill-warning text-warning' : 'text-border'}`} />)}
            </div>
            {review.comment && <p className="mt-2 text-xs leading-relaxed text-foreground-muted">{review.comment}</p>}
            <p className="mt-1 text-[11px] text-foreground-subtle">{new Date(review.created_at).toLocaleDateString()}</p>
            <div className="mt-3 flex gap-2">
              {review.moderation_status !== 'published' && (
                <Button size="sm" disabled={workingId === review.id} onClick={() => void updateReview(review.id, 'published')} className="flex-1 bg-success text-white hover:bg-success/90"><Eye className="mr-1 h-3.5 w-3.5" />Publish</Button>
              )}
              {review.moderation_status !== 'hidden' && (
                <Button size="sm" disabled={workingId === review.id} variant="outline" onClick={() => void updateReview(review.id, 'hidden')} className="flex-1"><EyeOff className="mr-1 h-3.5 w-3.5" />Hide</Button>
              )}
            </div>
          </div>
        )) : (
          <EmptyState icon={MessageSquare} title="No reviews yet" description="Completed-booking reviews will appear here." />
        )}
      </div>
    </div>
  );
}
