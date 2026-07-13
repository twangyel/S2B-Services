export type AppRole = 'customer' | 'provider' | 'admin' | 'super_admin';
export type AccountStatus = 'active' | 'suspended' | 'deactivated';

export interface AppProfile {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_path: string | null;
  role: AppRole;
  account_status: AccountStatus;
  default_service_area_id: string | null;
  address_text: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

export interface AuthServiceArea {
  id: string;
  name: string;
  city: string;
  dzongkhag: string;
}
