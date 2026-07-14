import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  LoaderCircle,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import type { AccountStatus, AppRole } from '@/types/auth';

interface ManagedUser {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  role: AppRole;
  account_status: AccountStatus;
  created_at: string;
  is_self: boolean;
}

interface PendingRoleChange {
  user: ManagedUser;
  nextRole: 'customer' | 'super_admin';
}

const roleLabel: Record<AppRole, string> = {
  customer: 'Customer',
  provider: 'Provider',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const roleClass: Record<AppRole, string> = {
  customer: 'bg-slate-100 text-slate-700',
  provider: 'bg-blue-50 text-blue-700',
  admin: 'bg-violet-50 text-violet-700',
  super_admin: 'bg-primary-light text-primary',
};

const statusClass: Record<AccountStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  suspended: 'bg-amber-50 text-amber-700',
  deactivated: 'bg-slate-100 text-slate-600',
};

function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat('en-BT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function AdminUsers() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingChange, setPendingChange] = useState<PendingRoleChange | null>(null);

  const loadUsers = useCallback(
    async (showRefreshState = false) => {
      if (profile?.role !== 'super_admin') return;

      if (showRefreshState) setRefreshing(true);
      else setLoading(true);

      setErrorMessage('');

      const { data, error } = await supabase.rpc('list_admin_users', {
        p_search: search.trim() || null,
        p_limit: 100,
      });

      if (error) {
        setErrorMessage(
          error.message || 'Unable to load registered users. Please try again.'
        );
      } else {
        setUsers((data ?? []) as ManagedUser[]);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [profile?.role, search]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUsers();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  const confirmRoleChange = async () => {
    if (!pendingChange || actionLoading) return;

    setActionLoading(true);

    const { error } = await supabase.rpc('change_admin_role', {
      p_target_user_id: pendingChange.user.id,
      p_new_role: pendingChange.nextRole,
    });

    setActionLoading(false);

    if (error) {
      toast.error(
        error.message || 'The role could not be changed. Please try again.'
      );
      return;
    }

    const promoted = pendingChange.nextRole === 'super_admin';
    toast.success(
      promoted
        ? `${pendingChange.user.full_name || 'User'} is now a Super Admin.`
        : `${pendingChange.user.full_name || 'User'} was returned to Customer access.`
    );

    setPendingChange(null);
    await loadUsers(true);
  };

  if (profile?.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6">
      <section className="mb-5">
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-light">
            <UserCog className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Admin Management</h2>
        </div>
        <p className="text-sm leading-6 text-foreground-muted">
          Promote the other S2B Services owners after they register as customers.
          Only active Super Admins can access this page.
        </p>
      </section>

      <section className="mb-4 rounded-2xl border border-border bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-11 min-w-0 flex-1 items-center rounded-xl border border-border px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
            <Search className="mr-2.5 h-4 w-4 shrink-0 text-foreground-subtle" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, phone or email"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted active:bg-muted"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => void loadUsers(true)}
            disabled={refreshing}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-foreground-muted transition active:bg-muted disabled:opacity-60"
            aria-label="Refresh registered users"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </section>

      {errorMessage && (
        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-52 items-center justify-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white px-5 py-12 text-center">
          <UserCog className="mx-auto mb-3 h-8 w-8 text-foreground-subtle" />
          <p className="font-semibold text-foreground">No matching users</p>
          <p className="mt-1 text-sm text-foreground-muted">
            Try another name, phone number or email address.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((managedUser) => {
            const canPromote =
              managedUser.account_status === 'active' &&
              managedUser.role !== 'super_admin' &&
              managedUser.role !== 'provider';

            const canDemote =
              managedUser.role === 'super_admin' &&
              !managedUser.is_self &&
              managedUser.account_status === 'active';

            return (
              <article
                key={managedUser.id}
                className="rounded-2xl border border-border bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
                    {(managedUser.full_name || 'U').trim().charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-foreground">
                        {managedUser.full_name || 'Unnamed user'}
                      </h3>
                      {managedUser.is_self && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          You
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${roleClass[managedUser.role]}`}
                      >
                        {roleLabel[managedUser.role]}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusClass[managedUser.account_status]}`}
                      >
                        {managedUser.account_status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-foreground-muted">
                      {managedUser.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>+975 {managedUser.phone}</span>
                        </div>
                      )}
                      {managedUser.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{managedUser.email}</span>
                        </div>
                      )}
                      <p>Joined {formatJoinedDate(managedUser.created_at)}</p>
                    </div>
                  </div>
                </div>

                {(canPromote || canDemote) && (
                  <div className="mt-4 border-t border-border pt-3">
                    {canPromote && (
                      <Button
                        type="button"
                        onClick={() =>
                          setPendingChange({
                            user: managedUser,
                            nextRole: 'super_admin',
                          })
                        }
                        className="h-10 w-full bg-primary text-white hover:bg-primary-dark"
                      >
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Promote to Super Admin
                      </Button>
                    )}

                    {canDemote && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setPendingChange({
                            user: managedUser,
                            nextRole: 'customer',
                          })
                        }
                        className="h-10 w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Return to Customer
                      </Button>
                    )}
                  </div>
                )}

                {managedUser.role === 'provider' && (
                  <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-foreground-muted">
                    Provider roles are managed through the provider approval workflow
                    and cannot be changed from this page.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}

      {pendingChange && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/45 p-3 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-change-title"
            className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>

            <h3 id="role-change-title" className="text-lg font-bold text-foreground">
              {pendingChange.nextRole === 'super_admin'
                ? 'Grant Super Admin access?'
                : 'Remove Super Admin access?'}
            </h3>

            <p className="mt-2 text-sm leading-6 text-foreground-muted">
              {pendingChange.nextRole === 'super_admin'
                ? `${pendingChange.user.full_name || 'This user'} will receive complete administrative access to S2B Services.`
                : `${pendingChange.user.full_name || 'This user'} will lose access to the Admin Panel and return to a customer account.`}
            </p>

            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={actionLoading}
                onClick={() => setPendingChange(null)}
                className="h-11 flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={actionLoading}
                onClick={() => void confirmRoleChange()}
                className="h-11 flex-1 bg-primary text-white hover:bg-primary-dark"
              >
                {actionLoading && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-5 text-center text-xs leading-5 text-foreground-subtle">
        Signed in as {user?.email ? 'a protected Super Admin account' : 'Super Admin'}.
        Every role change is recorded in the audit log.
      </p>
    </div>
  );
}
