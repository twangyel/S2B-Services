import { CheckCircle2, XCircle } from 'lucide-react';
import { mockPaymentProofs } from '@/data';
import StatusBadge from '@/components/common/StatusBadge';

export default function AdminPayments() {
  return (
    <div className="px-4 py-4">
      <h2 className="mb-3 text-lg font-bold text-foreground">Payment Verifications</h2>

      <div className="space-y-3">
        {mockPaymentProofs.map((payment) => (
          <div key={payment.id} className="rounded-xl bg-white p-4 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{payment.providerName}</h3>
                <p className="text-xs text-foreground-muted">{payment.planName} Plan</p>
              </div>
              <StatusBadge status={payment.status} size="sm" />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-foreground-muted">Amount:</span>{' '}
                <span className="font-medium text-foreground">Nu. {payment.amount}</span>
              </div>
              <div>
                <span className="text-foreground-muted">Bank:</span>{' '}
                <span className="font-medium text-foreground">{payment.bankName}</span>
              </div>
              <div>
                <span className="text-foreground-muted">Ref:</span>{' '}
                <span className="font-medium text-foreground">{payment.transactionRef}</span>
              </div>
              <div>
                <span className="text-foreground-muted">Date:</span>{' '}
                <span className="font-medium text-foreground">
                  {new Date(payment.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {payment.rejectionReason && (
              <p className="mt-2 text-xs text-error">{payment.rejectionReason}</p>
            )}

            {payment.status === 'pending' && (
              <div className="mt-3 flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-success py-2 text-xs font-medium text-white hover:bg-success/90">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verify
                </button>
                <button className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-error py-2 text-xs font-medium text-white hover:bg-error/90">
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
