export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  providerCount: number;
  startingPrice: number;
  isPopular: boolean;
  isEmergencyEnabled: boolean;
  certificateRequired: boolean;
  sortOrder: number;
  isActive: boolean;
}

export interface Provider {
  id: string;
  name: string;
  businessName: string;
  photo: string;
  categoryId: string;
  categoryName: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  availabilityStatus: 'available' | 'busy' | 'offline' | 'emergency_only';
  location: string;
  serviceAreas: string[];
  experienceYears: number;
  skills: string[];
  visitCharge: number;
  hourlyCharge: number | null;
  fixedCharge: number | null;
  emergencyCharge: number | null;
  materialCostNote: string;
  openingHours: string;
  emergencyAvailable: boolean;
  phone: string;
  whatsapp: string;
  workPhotos: string[];
  documentsVerified: boolean;
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'pending';
  subscriptionPlan: string;
  joinedDate: string;
}

export type RequestStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
export type UrgencyLevel = 'low' | 'medium' | 'high';
export type LeadSource = 'call' | 'whatsapp' | 'in_app';

export interface CustomerRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  issueDescription: string;
  serviceAreaId: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  photos: string[];
  status: RequestStatus;
  urgency: UrgencyLevel;
  leadSource: LeadSource;
  providerNote: string | null;
  estimatedAmount: number | null;
  requestedFor: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  rating?: number;
  review?: string;
}

export interface Review {
  id: string;
  providerId: string;
  customerName: string;
  customerPhone: string;
  rating: number;
  comment: string;
  createdAt: string;
  isVisible: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  features: string[];
  isPopular: boolean;
}

export interface AdminAnalytics {
  totalProviders: number;
  pendingApprovals: number;
  activeProviders: number;
  suspendedProviders: number;
  totalRequests: number;
  mostUsedService: string;
  activeSubscriptions: number;
  monthlyRevenue: number;
  pendingReviews: number;
  openComplaints: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  ctaText: string;
  ctaTarget: string;
  isActive: boolean;
  sortOrder: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface ServiceArea {
  id: string;
  name: string;
  city: string;
}

export type ProviderStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'trial';
export type AvailabilityStatus = 'available' | 'busy' | 'offline' | 'emergency_only';
export type ComplaintType = 'urgent' | 'quality' | 'general';
export type ComplaintStatus = 'open' | 'resolved' | 'escalated';

export interface Complaint {
  id: string;
  providerId: string;
  providerName: string;
  customerName: string;
  customerPhone: string;
  type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface PaymentProof {
  id: string;
  providerId: string;
  providerName: string;
  planName: string;
  amount: number;
  screenshotUrl: string;
  bankName: string;
  transactionRef: string;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  verifiedAt?: string;
  expiryDate?: string;
}
