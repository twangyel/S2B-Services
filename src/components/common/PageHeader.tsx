import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  onBack?: () => void;
  className?: string;
}

export default function PageHeader({ title, showBack = true, rightAction, onBack, className }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex h-14 items-center border-b border-border bg-white px-4',
        className
      )}
    >
      {showBack && (
        <button
          onClick={handleBack}
          className="mr-3 flex h-11 w-11 items-center justify-center rounded-full active:bg-muted"
        >
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
      )}
      <h1 className="flex-1 text-lg font-semibold text-foreground">{title}</h1>
      {rightAction && <div className="ml-2">{rightAction}</div>}
    </header>
  );
}
