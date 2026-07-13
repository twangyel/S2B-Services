import { supabase } from '@/lib/supabase';

export interface AppNotification {
  id: string;
  userId: string;
  actorId: string | null;
  title: string;
  message: string;
  notificationType: string;
  entityType: string | null;
  entityId: string | null;
  actionPath: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface NotificationRow {
  id: string;
  user_id: string;
  actor_id: string | null;
  title: string;
  message: string;
  notification_type: string;
  entity_type: string | null;
  entity_id: string | null;
  action_path: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

const NOTIFICATION_SELECT = [
  'id',
  'user_id',
  'actor_id',
  'title',
  'message',
  'notification_type',
  'entity_type',
  'entity_id',
  'action_path',
  'is_read',
  'read_at',
  'created_at',
].join(',');

export function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    actorId: row.actor_id,
    title: row.title,
    message: row.message,
    notificationType: row.notification_type,
    entityType: row.entity_type,
    entityId: row.entity_id,
    actionPath: row.action_path,
    isRead: row.is_read,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export async function fetchNotifications(userId: string, limit = 100): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(NOTIFICATION_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as unknown as NotificationRow[]).map(mapNotification);
}

export async function fetchUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase.from('notifications').delete().eq('id', notificationId);
  if (error) throw error;
}
