import { useNavigate } from 'react-router';
import type { ComponentType } from 'react';
import type { ServiceCategory } from '@/types';
import * as Icons from 'lucide-react';

interface ServiceCategoryCardProps {
  category: ServiceCategory;
  variant?: 'horizontal' | 'grid' | 'list';
}

export default function ServiceCategoryCard({ category, variant = 'list' }: ServiceCategoryCardProps) {
  const navigate = useNavigate();
  const IconComponent = ((Icons as unknown) as Record<string, ComponentType<{ className?: string }>>)[category.icon] || Icons.Circle;

  const handleClick = () => {
    navigate(`/services/${category.id}`);
  };

  if (variant === 'grid') {
    return (
      <button
        onClick={handleClick}
        className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-white p-3 shadow-card transition-all active:scale-95 hover:shadow-card-hover"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
          <IconComponent className="h-5 w-5 text-primary" />
        </div>
        <span className="text-center text-[11px] font-medium leading-tight text-foreground">
          {category.name}
        </span>
        {category.isEmergencyEnabled && (
          <span className="text-[9px] font-medium text-error">Emergency</span>
        )}
      </button>
    );
  }

  if (variant === 'horizontal') {
    return (
      <button
        onClick={handleClick}
        className="flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-white p-3 shadow-card transition-all active:scale-95 hover:shadow-card-hover min-w-[90px]"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light">
          <IconComponent className="h-5 w-5 text-primary" />
        </div>
        <span className="text-center text-[11px] font-medium leading-tight text-foreground">
          {category.name}
        </span>
      </button>
    );
  }

  // list variant (default) - full width
  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-white p-3 shadow-card transition-all active:scale-95 hover:shadow-card-hover"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-light">
        <IconComponent className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-foreground">{category.name}</p>
        <p className="text-xs text-foreground-muted">{category.description}</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-medium text-primary">{category.providerCount} providers</p>
        <p className="text-[11px] text-foreground-muted">From Nu. {category.startingPrice}</p>
      </div>
    </button>
  );
}
