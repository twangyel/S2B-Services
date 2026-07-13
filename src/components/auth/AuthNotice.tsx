import { AlertCircle, CircleCheck } from 'lucide-react';

interface AuthNoticeProps {
  type: 'error' | 'success' | 'info';
  message: string;
}

export default function AuthNotice({ type, message }: AuthNoticeProps) {
  const success = type === 'success';
  const error = type === 'error';

  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm leading-5 ${
        success
          ? 'border-success/25 bg-success-light text-success'
          : error
            ? 'border-error/25 bg-error-light text-error'
            : 'border-primary/20 bg-primary-light text-primary'
      }`}
    >
      {success ? (
        <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}
