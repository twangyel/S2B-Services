import { Edit3 } from 'lucide-react';
import { mockProviders } from '@/data';
import StatusBadge from '@/components/common/StatusBadge';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import RatingStars from '@/components/common/RatingStars';
import { Button } from '@/components/ui/button';

export default function ProviderProfileMgmt() {
  const provider = mockProviders[0];

  return (
    <div className="px-4 py-4">
      <div className="rounded-xl bg-white p-5 shadow-card">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={provider.photo}
              alt={provider.name}
              className="h-24 w-24 rounded-full object-cover"
            />
          </div>
          <h2 className="mt-3 text-lg font-bold text-foreground">{provider.name}</h2>
          <p className="text-sm text-foreground-muted">{provider.businessName}</p>
          <div className="mt-1">
            <RatingStars rating={provider.rating} reviewCount={provider.reviewCount} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            {provider.isVerified && <VerifiedBadge size="md" />}
            <StatusBadge status={provider.subscriptionStatus} size="sm" />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {[
            { label: 'Phone', value: provider.phone },
            { label: 'Location', value: provider.location },
            { label: 'Category', value: provider.categoryName },
            { label: 'Experience', value: `${provider.experienceYears} years` },
            { label: 'Visit Charge', value: `Nu. ${provider.visitCharge}` },
            { label: 'Hours', value: provider.openingHours },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
              <span className="text-sm text-foreground-muted">{item.label}</span>
              <span className="text-sm font-medium text-foreground">{item.value}</span>
            </div>
          ))}
        </div>

        <Button className="mt-5 w-full bg-primary text-white hover:bg-primary-dark">
          <Edit3 className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
