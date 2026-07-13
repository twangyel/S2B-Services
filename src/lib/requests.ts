import { supabase } from '@/lib/supabase';
import type { CustomerRequest, RequestStatus, UrgencyLevel } from '@/types';

export interface RequestAttachment {
  id: string;
  requestId: string;
  objectPath: string;
  mimeType: string | null;
  fileSizeBytes: number | null;
  url: string;
  createdAt: string;
}

export interface RequestHistoryItem {
  id: number;
  oldStatus: RequestStatus | null;
  newStatus: RequestStatus;
  note: string | null;
  createdAt: string;
}

export interface RequestReview {
  id: string;
  rating: number;
  comment: string;
  moderationStatus: 'pending' | 'published' | 'hidden' | 'rejected';
  createdAt: string;
}

interface ServiceRequestRow {
  id: string;
  customer_id: string;
  provider_id: string;
  category_id: string;
  customer_name_snapshot: string;
  customer_phone_snapshot: string;
  service_name_snapshot: string;
  provider_name_snapshot: string;
  issue_description: string;
  service_area_id: string | null;
  location_text: string;
  latitude: number | string | null;
  longitude: number | string | null;
  urgency: UrgencyLevel;
  lead_source: 'call' | 'whatsapp' | 'in_app';
  status: RequestStatus;
  provider_note: string | null;
  estimated_amount: number | string | null;
  requested_for: string | null;
  sent_at: string | null;
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

const REQUEST_SELECT = [
  'id',
  'customer_id',
  'provider_id',
  'category_id',
  'customer_name_snapshot',
  'customer_phone_snapshot',
  'service_name_snapshot',
  'provider_name_snapshot',
  'issue_description',
  'service_area_id',
  'location_text',
  'latitude',
  'longitude',
  'urgency',
  'lead_source',
  'status',
  'provider_note',
  'estimated_amount',
  'requested_for',
  'sent_at',
  'accepted_at',
  'started_at',
  'completed_at',
  'cancelled_at',
  'created_at',
  'updated_at',
].join(',');

function numberOrNull(value: number | string | null): number | null {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function mapRequest(row: ServiceRequestRow): CustomerRequest {
  return {
    id: row.id,
    serviceId: row.category_id,
    serviceName: row.service_name_snapshot,
    providerId: row.provider_id,
    providerName: row.provider_name_snapshot,
    customerId: row.customer_id,
    customerName: row.customer_name_snapshot,
    customerPhone: row.customer_phone_snapshot,
    issueDescription: row.issue_description,
    serviceAreaId: row.service_area_id,
    location: row.location_text,
    latitude: numberOrNull(row.latitude),
    longitude: numberOrNull(row.longitude),
    photos: [],
    status: row.status,
    urgency: row.urgency,
    leadSource: row.lead_source,
    providerNote: row.provider_note,
    estimatedAmount: numberOrNull(row.estimated_amount),
    requestedFor: row.requested_for,
    sentAt: row.sent_at,
    acceptedAt: row.accepted_at,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    cancelledAt: row.cancelled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchCustomerRequests(customerId: string): Promise<CustomerRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select(REQUEST_SELECT)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as ServiceRequestRow[]).map(mapRequest);
}

export async function fetchProviderIdForUser(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return String(data.id);
}

export async function fetchProviderRequests(providerId: string): Promise<CustomerRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select(REQUEST_SELECT)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as ServiceRequestRow[]).map(mapRequest);
}

export async function fetchAdminRequests(): Promise<CustomerRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select(REQUEST_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as ServiceRequestRow[]).map(mapRequest);
}

export async function fetchRequest(requestId: string): Promise<CustomerRequest | null> {
  const { data, error } = await supabase
    .from('service_requests')
    .select(REQUEST_SELECT)
    .eq('id', requestId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRequest(data as unknown as ServiceRequestRow) : null;
}

export async function fetchRequestHistory(requestId: string): Promise<RequestHistoryItem[]> {
  const { data, error } = await supabase
    .from('request_status_history')
    .select('id, old_status, new_status, note, created_at')
    .eq('request_id', requestId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: Number(row.id),
    oldStatus: row.old_status as RequestStatus | null,
    newStatus: row.new_status as RequestStatus,
    note: row.note as string | null,
    createdAt: String(row.created_at),
  }));
}

export async function fetchRequestAttachments(requestId: string): Promise<RequestAttachment[]> {
  const { data, error } = await supabase
    .from('request_attachments')
    .select('id, request_id, object_path, mime_type, file_size_bytes, created_at')
    .eq('request_id', requestId)
    .order('created_at');
  if (error) throw error;

  return Promise.all(
    (data ?? []).map(async (row) => {
      const { data: signedData, error: signedError } = await supabase.storage
        .from('request-attachments')
        .createSignedUrl(String(row.object_path), 60 * 60);
      if (signedError) throw signedError;
      return {
        id: String(row.id),
        requestId: String(row.request_id),
        objectPath: String(row.object_path),
        mimeType: row.mime_type as string | null,
        fileSizeBytes: row.file_size_bytes == null ? null : Number(row.file_size_bytes),
        url: signedData.signedUrl,
        createdAt: String(row.created_at),
      };
    })
  );
}

export async function fetchReviewForRequest(requestId: string): Promise<RequestReview | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, moderation_status, created_at')
    .eq('request_id', requestId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    id: String(data.id),
    rating: Number(data.rating),
    comment: String(data.comment ?? ''),
    moderationStatus: data.moderation_status as RequestReview['moderationStatus'],
    createdAt: String(data.created_at),
  };
}

function safeFileName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'photo.jpg';
}

export interface CreateServiceRequestInput {
  requestId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  providerId: string;
  providerName: string;
  categoryId: string;
  serviceName: string;
  issueDescription: string;
  serviceAreaId: string | null;
  locationText: string;
  latitude?: number | null;
  longitude?: number | null;
  urgency: UrgencyLevel;
  requestedFor: string;
  files: File[];
}

export async function createServiceRequest(input: CreateServiceRequestInput): Promise<string> {
  const requestId = input.requestId ?? crypto.randomUUID();
  const uploadedPaths: string[] = [];
  let requestCreated = false;

  try {
    for (const file of input.files) {
      const objectPath = `${input.customerId}/${requestId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage
        .from('request-attachments')
        .upload(objectPath, file, { cacheControl: '3600', upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;
      uploadedPaths.push(objectPath);
    }

    const { error: requestError } = await supabase.from('service_requests').insert({
      id: requestId,
      customer_id: input.customerId,
      provider_id: input.providerId,
      category_id: input.categoryId,
      customer_name_snapshot: input.customerName,
      customer_phone_snapshot: input.customerPhone,
      service_name_snapshot: input.serviceName,
      provider_name_snapshot: input.providerName,
      issue_description: input.issueDescription,
      service_area_id: input.serviceAreaId,
      location_text: input.locationText,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      urgency: input.urgency,
      lead_source: 'in_app',
      status: 'sent',
      requested_for: input.requestedFor,
    });
    if (requestError) throw requestError;
    requestCreated = true;

    if (uploadedPaths.length > 0) {
      const attachmentRows = input.files.map((file, index) => ({
        request_id: requestId,
        uploaded_by: input.customerId,
        object_path: uploadedPaths[index],
        mime_type: file.type || null,
        file_size_bytes: file.size,
      }));
      const { error: attachmentError } = await supabase.from('request_attachments').insert(attachmentRows);
      if (attachmentError) {
        console.warn('[S2B Services] Booking was created, but attachment metadata could not be saved:', attachmentError.message);
        await supabase.storage.from('request-attachments').remove(uploadedPaths);
      }
    }

    return requestId;
  } catch (error) {
    if (!requestCreated && uploadedPaths.length > 0) {
      await supabase.storage.from('request-attachments').remove(uploadedPaths);
    }
    throw error;
  }
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus,
  options?: { providerNote?: string; estimatedAmount?: number | null }
): Promise<void> {
  const payload: Record<string, unknown> = { status };
  if (options?.providerNote !== undefined) payload.provider_note = options.providerNote.trim() || null;
  if (options?.estimatedAmount !== undefined) payload.estimated_amount = options.estimatedAmount;
  const { error } = await supabase.from('service_requests').update(payload).eq('id', requestId);
  if (error) throw error;
}

export async function submitRequestReview(
  requestId: string,
  customerId: string,
  providerId: string,
  customerName: string,
  rating: number,
  comment: string
): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    request_id: requestId,
    provider_id: providerId,
    customer_id: customerId,
    customer_name_snapshot: customerName,
    rating,
    comment: comment.trim(),
  });
  if (error) throw error;
}
