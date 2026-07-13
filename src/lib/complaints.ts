import { supabase } from '@/lib/supabase';
import type { ComplaintStatus, ComplaintType } from '@/types';

export interface ComplaintRequestOption {
  id: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  status: string;
  createdAt: string;
}

export interface ComplaintAttachmentRecord {
  id: string;
  objectPath: string;
  url: string | null;
  mimeType: string | null;
  createdAt: string;
}

export interface ComplaintRecord {
  id: string;
  requestId: string | null;
  providerId: string;
  providerName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  resolution: string | null;
  assignedAdminId: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: ComplaintAttachmentRecord[];
}

export interface SupportContacts {
  phone: string;
  email: string;
  whatsapp: string;
  hours: string;
}

interface ComplaintRow {
  id: string;
  request_id: string | null;
  provider_id: string;
  customer_id: string;
  complaint_type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  resolution: string | null;
  assigned_admin_id: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

async function hydrateComplaints(rows: ComplaintRow[]): Promise<ComplaintRecord[]> {
  const providerIds = [...new Set(rows.map((row) => row.provider_id))];
  const customerIds = [...new Set(rows.map((row) => row.customer_id))];
  const complaintIds = rows.map((row) => row.id);

  const [providersResult, customersResult, attachmentsResult] = await Promise.all([
    providerIds.length > 0
      ? supabase.from('provider_profiles').select('id, display_name').in('id', providerIds)
      : Promise.resolve({ data: [], error: null }),
    customerIds.length > 0
      ? supabase.from('profiles').select('id, full_name, phone').in('id', customerIds)
      : Promise.resolve({ data: [], error: null }),
    complaintIds.length > 0
      ? supabase.from('complaint_attachments').select('id, complaint_id, object_path, mime_type, created_at').in('complaint_id', complaintIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (providersResult.error) throw providersResult.error;
  if (customersResult.error) throw customersResult.error;
  if (attachmentsResult.error) throw attachmentsResult.error;

  const providerMap = new Map((providersResult.data ?? []).map((item) => [String(item.id), String(item.display_name)]));
  const customerMap = new Map((customersResult.data ?? []).map((item) => [
    String(item.id),
    { name: String(item.full_name || 'Customer'), phone: String(item.phone || '') },
  ]));

  const attachmentMap = new Map<string, ComplaintAttachmentRecord[]>();
  await Promise.all((attachmentsResult.data ?? []).map(async (item) => {
    const { data: signedData } = await supabase.storage
      .from('complaint-attachments')
      .createSignedUrl(String(item.object_path), 60 * 10);
    const complaintId = String(item.complaint_id);
    const list = attachmentMap.get(complaintId) ?? [];
    list.push({
      id: String(item.id),
      objectPath: String(item.object_path),
      url: signedData?.signedUrl ?? null,
      mimeType: item.mime_type ? String(item.mime_type) : null,
      createdAt: String(item.created_at),
    });
    attachmentMap.set(complaintId, list);
  }));

  return rows.map((row) => {
    const customer = customerMap.get(row.customer_id);
    return {
      id: row.id,
      requestId: row.request_id,
      providerId: row.provider_id,
      providerName: providerMap.get(row.provider_id) ?? 'Provider',
      customerId: row.customer_id,
      customerName: customer?.name ?? 'Customer',
      customerPhone: customer?.phone ?? '',
      type: row.complaint_type,
      description: row.description,
      status: row.status,
      resolution: row.resolution,
      assignedAdminId: row.assigned_admin_id,
      resolvedAt: row.resolved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      attachments: attachmentMap.get(row.id) ?? [],
    };
  });
}

const COMPLAINT_SELECT = [
  'id',
  'request_id',
  'provider_id',
  'customer_id',
  'complaint_type',
  'description',
  'status',
  'resolution',
  'assigned_admin_id',
  'resolved_at',
  'created_at',
  'updated_at',
].join(',');

export async function fetchCustomerComplaintRequests(customerId: string): Promise<ComplaintRequestOption[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('id, provider_id, provider_name_snapshot, service_name_snapshot, status, created_at')
    .eq('customer_id', customerId)
    .neq('status', 'draft')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: String(row.id),
    providerId: String(row.provider_id),
    providerName: String(row.provider_name_snapshot),
    serviceName: String(row.service_name_snapshot),
    status: String(row.status),
    createdAt: String(row.created_at),
  }));
}

export async function fetchCustomerComplaints(customerId: string): Promise<ComplaintRecord[]> {
  const { data, error } = await supabase
    .from('complaints')
    .select(COMPLAINT_SELECT)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return hydrateComplaints((data ?? []) as unknown as ComplaintRow[]);
}

export async function fetchAllComplaints(): Promise<ComplaintRecord[]> {
  const { data, error } = await supabase
    .from('complaints')
    .select(COMPLAINT_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return hydrateComplaints((data ?? []) as unknown as ComplaintRow[]);
}

function fileExtension(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && /^[a-z0-9]{2,5}$/.test(extension)) return extension;
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

export async function createComplaint(input: {
  customerId: string;
  request: ComplaintRequestOption;
  type: ComplaintType;
  description: string;
  files: File[];
}): Promise<string> {
  const complaintId = crypto.randomUUID();
  const uploadedPaths: string[] = [];

  try {
    for (const [index, file] of input.files.entries()) {
      const objectPath = `${input.customerId}/${complaintId}-${index + 1}.${fileExtension(file)}`;
      const { error: uploadError } = await supabase.storage
        .from('complaint-attachments')
        .upload(objectPath, file, {
          upsert: false,
          cacheControl: '3600',
          contentType: file.type || undefined,
        });
      if (uploadError) throw uploadError;
      uploadedPaths.push(objectPath);
    }

    const { error: complaintError } = await supabase.from('complaints').insert({
      id: complaintId,
      request_id: input.request.id,
      provider_id: input.request.providerId,
      customer_id: input.customerId,
      complaint_type: input.type,
      description: input.description.trim(),
      status: 'open',
    });
    if (complaintError) throw complaintError;

    if (uploadedPaths.length > 0) {
      const { error: attachmentError } = await supabase.from('complaint_attachments').insert(
        input.files.map((file, index) => ({
          complaint_id: complaintId,
          uploaded_by: input.customerId,
          object_path: uploadedPaths[index],
          mime_type: file.type || null,
          file_size_bytes: file.size,
        }))
      );
      if (attachmentError) {
        console.warn('[S2B Services] Complaint was created, but attachment metadata could not be saved:', attachmentError.message);
        await supabase.storage.from('complaint-attachments').remove(uploadedPaths);
      }
    }

    return complaintId;
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from('complaint-attachments').remove(uploadedPaths);
    }
    throw error;
  }
}

export async function updateComplaintStatus(input: {
  complaintId: string;
  adminId: string;
  status: ComplaintStatus;
  resolution?: string;
}): Promise<void> {
  const payload: Record<string, unknown> = {
    status: input.status,
    assigned_admin_id: input.adminId,
  };
  if (input.status === 'resolved') {
    payload.resolution = input.resolution?.trim() || null;
    payload.resolved_at = new Date().toISOString();
  } else {
    payload.resolved_at = null;
    if (input.resolution !== undefined) payload.resolution = input.resolution.trim() || null;
  }
  const { error } = await supabase.from('complaints').update(payload).eq('id', input.complaintId);
  if (error) throw error;
}

export async function fetchSupportContacts(): Promise<SupportContacts> {
  const fallback: SupportContacts = {
    phone: '+975-00000000',
    email: 'support@s2bservices.bt',
    whatsapp: '+975-00000000',
    hours: 'Monday to Friday, 9:00 AM–5:00 PM',
  };
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'support_contacts')
    .maybeSingle();
  if (error) throw error;
  if (!data?.value || typeof data.value !== 'object') return fallback;
  const value = data.value as Record<string, unknown>;
  return {
    phone: String(value.phone ?? fallback.phone),
    email: String(value.email ?? fallback.email),
    whatsapp: String(value.whatsapp ?? fallback.whatsapp),
    hours: String(value.hours ?? fallback.hours),
  };
}
