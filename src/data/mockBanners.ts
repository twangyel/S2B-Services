import type { Banner } from '@/types';

export const mockBanners: Banner[] = [
  {
    id: 'banner-001',
    title: 'New: AC Repair Services',
    subtitle: 'Get your AC fixed by verified professionals this summer',
    ctaText: 'Book Now',
    ctaTarget: '/services/ac-repair?emergency=true',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'banner-002',
    title: 'Join as a Service Provider',
    subtitle: 'Grow your business with S2B Services. Reach thousands of customers.',
    ctaText: 'Register Free',
    ctaTarget: '/become-provider',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'banner-003',
    title: 'Emergency Services 24/7',
    subtitle: 'Electrician, Plumber, Mechanic available for urgent needs',
    ctaText: 'Get Help',
    ctaTarget: '/services?emergency=true',
    isActive: true,
    sortOrder: 3,
  },
];
