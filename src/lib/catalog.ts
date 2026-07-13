import type { Banner, Provider, Review, ServiceArea, ServiceCategory } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface ServiceCategoryRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  provider_count: number | null;
  starting_price: number | string;
  is_popular: boolean;
  is_emergency_enabled: boolean;
  certificate_required: boolean;
  sort_order: number;
  is_active: boolean;
}

interface ProviderDirectoryRow {
  id: string;
  name: string;
  business_name: string;
  profile_photo_path: string | null;
  category_id: string | null;
  category_name: string | null;
  rating: number | string;
  review_count: number;
  is_verified: boolean;
  is_featured: boolean;
  availability_status: Provider['availabilityStatus'];
  location: string;
  service_areas: string[] | null;
  experience_years: number;
  skills: string[] | null;
  visit_charge: number | string;
  hourly_charge: number | string | null;
  fixed_charge: number | string | null;
  emergency_charge: number | string | null;
  material_cost_note: string;
  opening_hours: string;
  emergency_available: boolean;
  phone: string;
  whatsapp: string;
  work_photos: string[] | null;
  documents_verified: boolean;
  subscription_status: Provider['subscriptionStatus'];
  subscription_plan: string;
  joined_date: string;
}

interface BannerRow {
  id: string;
  title: string;
  subtitle: string;
  image_path: string | null;
  cta_text: string;
  cta_target: string;
  is_active: boolean;
  sort_order: number;
}

interface ReviewRow {
  id: string;
  provider_id: string;
  customer_name_snapshot: string;
  rating: number;
  comment: string;
  moderation_status: 'pending' | 'published' | 'hidden' | 'rejected';
  created_at: string;
}

interface ServiceAreaRow {
  id: string;
  name: string;
  city: string;
}

function asNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function publicStorageUrl(bucket: string, path: string | null | undefined): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function mapCategory(row: ServiceCategoryRow): ServiceCategory {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    providerCount: row.provider_count ?? 0,
    startingPrice: asNumber(row.starting_price),
    isPopular: row.is_popular,
    isEmergencyEnabled: row.is_emergency_enabled,
    certificateRequired: row.certificate_required,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

export function mapProvider(row: ProviderDirectoryRow): Provider {
  return {
    id: row.id,
    name: row.name,
    businessName: row.business_name,
    photo: publicStorageUrl('avatars', row.profile_photo_path) || '/provider-placeholder.svg',
    categoryId: row.category_id ?? '',
    categoryName: row.category_name ?? 'Service Provider',
    rating: asNumber(row.rating),
    reviewCount: row.review_count ?? 0,
    isVerified: row.is_verified,
    isFeatured: row.is_featured,
    availabilityStatus: row.availability_status,
    location: row.location,
    serviceAreas: row.service_areas ?? [],
    experienceYears: row.experience_years ?? 0,
    skills: row.skills ?? [],
    visitCharge: asNumber(row.visit_charge),
    hourlyCharge: row.hourly_charge == null ? null : asNumber(row.hourly_charge),
    fixedCharge: row.fixed_charge == null ? null : asNumber(row.fixed_charge),
    emergencyCharge: row.emergency_charge == null ? null : asNumber(row.emergency_charge),
    materialCostNote: row.material_cost_note,
    openingHours: row.opening_hours,
    emergencyAvailable: row.emergency_available,
    phone: row.phone,
    whatsapp: row.whatsapp,
    workPhotos: (row.work_photos ?? []).map((path) => publicStorageUrl('provider-work', path)),
    documentsVerified: row.documents_verified,
    subscriptionStatus: row.subscription_status,
    subscriptionPlan: row.subscription_plan,
    joinedDate: row.joined_date,
  };
}

export async function fetchServiceCategories(): Promise<ServiceCategory[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('service_category_catalog')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return ((data ?? []) as ServiceCategoryRow[]).map(mapCategory);
}

export async function fetchProviderDirectory(categoryId?: string): Promise<Provider[]> {
  if (!isSupabaseConfigured) return [];
  let query = supabase
    .from('provider_directory')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false });
  if (categoryId) query = query.eq('category_id', categoryId);
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as ProviderDirectoryRow[]).map(mapProvider);
}

export async function fetchProvider(providerId: string): Promise<Provider | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('provider_directory')
    .select('*')
    .eq('id', providerId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProvider(data as ProviderDirectoryRow) : null;
}

export async function fetchProviderReviews(providerId: string): Promise<Review[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('id, provider_id, customer_name_snapshot, rating, comment, moderation_status, created_at')
    .eq('provider_id', providerId)
    .eq('moderation_status', 'published')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ReviewRow[]).map((row) => ({
    id: row.id,
    providerId: row.provider_id,
    customerName: row.customer_name_snapshot,
    customerPhone: '',
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
    isVisible: row.moderation_status === 'published',
  }));
}

export async function fetchBanners(): Promise<Banner[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('banners')
    .select('id, title, subtitle, image_path, cta_text, cta_target, is_active, sort_order, starts_at, ends_at')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  const now = Date.now();
  return ((data ?? []) as (BannerRow & { starts_at: string | null; ends_at: string | null })[])
    .filter((row) => (!row.starts_at || Date.parse(row.starts_at) <= now) && (!row.ends_at || Date.parse(row.ends_at) >= now))
    .map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    image: row.image_path ? publicStorageUrl('provider-work', row.image_path) : undefined,
    ctaText: row.cta_text,
    ctaTarget: row.cta_target,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  }));
}

export async function fetchServiceAreas(): Promise<ServiceArea[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('service_areas')
    .select('id, name, city')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return ((data ?? []) as ServiceAreaRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    city: row.city,
  }));
}
