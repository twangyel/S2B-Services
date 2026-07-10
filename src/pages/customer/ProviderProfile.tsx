import { useParams } from 'react-router';
import { Phone, MessageCircle, MapPin, Clock, Award, Briefcase } from 'lucide-react';
import { mockProviders, mockReviews } from '@/data';
import PageHeader from '@/components/common/PageHeader';
import VerifiedBadge from '@/components/common/VerifiedBadge';
import RatingStars from '@/components/common/RatingStars';
import StatusBadge from '@/components/common/StatusBadge';
import PriceChip from '@/components/common/PriceChip';
import ReviewCard from '@/components/cards/ReviewCard';
import EmptyState from '@/components/common/EmptyState';

export default function ProviderProfile() {
  const { providerId } = useParams<{ providerId: string }>();
  const provider = mockProviders.find((p) => p.id === providerId);
  const reviews = mockReviews.filter((r) => r.providerId === providerId && r.isVisible);

  if (!provider) {
    return (
      <div>
        <PageHeader title="Provider Profile" />
        <EmptyState
          icon={Briefcase}
          title="Provider not found"
          description="The provider you are looking for does not exist."
        />
      </div>
    );
  }

  return (
    <div className="pb-6">
      <PageHeader title="Provider Profile" />

      {/* Profile Header */}
      <div className="bg-white px-4 py-5">
        <div className="flex items-start gap-4">
          <img
            src={provider.photo}
            alt={provider.name}
            className="h-20 w-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{provider.name}</h2>
              {provider.isVerified && <VerifiedBadge size="sm" />}
            </div>
            <p className="mt-0.5 text-sm text-foreground-muted">{provider.businessName}</p>
            <div className="mt-1">
              <RatingStars rating={provider.rating} reviewCount={provider.reviewCount} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <StatusBadge status={provider.availabilityStatus} size="sm" />
              {provider.isFeatured && <StatusBadge status="featured" size="sm" />}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Buttons */}
      <div className="flex gap-3 bg-white px-4 pb-4">
        <a
          href={`tel:${provider.phone}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-button hover:bg-primary-dark"
        >
          <Phone className="h-4 w-4" />
          Call Now
        </a>
        <a
          href={`https://wa.me/${provider.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary py-3 text-sm font-semibold text-white hover:bg-secondary-dark"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>

      <div className="mt-3 space-y-3 px-4">
        {/* Details Card */}
        <div className="rounded-xl bg-white p-4 shadow-card">
          <h3 className="mb-3 text-sm font-bold text-foreground">Details</h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-muted">Location:</span>
              <span className="text-foreground">{provider.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-muted">Hours:</span>
              <span className="text-foreground">{provider.openingHours}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Award className="h-4 w-4 text-foreground-muted" />
              <span className="text-foreground-muted">Experience:</span>
              <span className="text-foreground">{provider.experienceYears} years</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-sm text-foreground-muted">Skills:</span>
              {provider.skills.map((skill) => (
                <span key={skill} className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="rounded-xl bg-white p-4 shadow-card">
          <h3 className="mb-3 text-sm font-bold text-foreground">Pricing</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground-muted">Visit Charge</span>
              <PriceChip price={provider.visitCharge} />
            </div>
            {provider.hourlyCharge && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted">Hourly Rate</span>
                <PriceChip price={provider.hourlyCharge} />
              </div>
            )}
            {provider.emergencyCharge && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground-muted">Emergency Charge</span>
                <PriceChip price={provider.emergencyCharge} />
              </div>
            )}
            {provider.materialCostNote && (
              <p className="pt-1 text-xs text-foreground-muted">{provider.materialCostNote}</p>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold text-foreground">
              Reviews ({reviews.length})
            </h3>
            <div className="space-y-2">
              {reviews.slice(0, 3).map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}

        {/* Work Photos */}
        {provider.workPhotos.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-bold text-foreground">Work Photos</h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {provider.workPhotos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Work sample ${index + 1}`}
                  className="h-28 w-36 flex-shrink-0 rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
