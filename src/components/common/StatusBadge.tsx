import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { bg: string; text: string; label: string; pulse?: boolean }> = {
  // Green variants
  available: { bg: 'bg-success-light', text: 'text-success', label: 'Available', pulse: true },
  success: { bg: 'bg-success-light', text: 'text-success', label: 'Success' },
  approved: { bg: 'bg-success-light', text: 'text-success', label: 'Approved' },
  verified: { bg: 'bg-success-light', text: 'text-success', label: 'Verified' },
  completed: { bg: 'bg-success-light', text: 'text-success', label: 'Completed' },
  active: { bg: 'bg-success-light', text: 'text-success', label: 'Active' },
  // Amber/orange variants
  busy: { bg: 'bg-warning-light', text: 'text-warning', label: 'Busy' },
  pending: { bg: 'bg-warning-light', text: 'text-warning', label: 'Pending' },
  open: { bg: 'bg-warning-light', text: 'text-warning', label: 'Open' },
  escalated: { bg: 'bg-error-light', text: 'text-error', label: 'Escalated' },
  warning: { bg: 'bg-warning-light', text: 'text-warning', label: 'Warning' },
  // Gray variants
  offline: { bg: 'bg-muted', text: 'text-foreground-muted', label: 'Offline' },
  draft: { bg: 'bg-muted', text: 'text-foreground-muted', label: 'Draft' },
  expired: { bg: 'bg-muted', text: 'text-foreground-muted', label: 'Expired' },
  cancelled: { bg: 'bg-muted', text: 'text-foreground-muted', label: 'Cancelled' },
  // Red variants
  rejected: { bg: 'bg-error-light', text: 'text-error', label: 'Rejected' },
  suspended: { bg: 'bg-error-light', text: 'text-error', label: 'Suspended' },
  error: { bg: 'bg-error-light', text: 'text-error', label: 'Error' },
  urgent: { bg: 'bg-error-light', text: 'text-error', label: 'Urgent' },
  // Emergency
  emergency_only: { bg: 'bg-error-light', text: 'text-error', label: 'Emergency', pulse: true },
  // Featured
  featured: { bg: 'bg-secondary-light', text: 'text-secondary', label: 'Featured' },
  // Blue variants
  in_progress: { bg: 'bg-info-light', text: 'text-info', label: 'In Progress' },
  sent: { bg: 'bg-info-light', text: 'text-info', label: 'Sent' },
  // Purple
  trial: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Trial' },
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: 'bg-muted', text: 'text-foreground-muted', label: status };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium capitalize',
        config.bg,
        config.text,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      )}
    >
      {config.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-75', config.text.replace('text-', 'bg-'))} />
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', config.text.replace('text-', 'bg-'))} />
        </span>
      )}
      {config.label}
    </span>
  );
}
