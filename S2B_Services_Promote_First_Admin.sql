-- Run only after registering your own account through the S2B Services app.
-- Replace the placeholder email before running.

update public.profiles
set
  role = 'super_admin',
  account_status = 'active',
  updated_at = now()
where lower(email) = lower('YOUR_ADMIN_EMAIL@example.com');

-- Confirm exactly one matching profile was promoted.
select id, full_name, email, role, account_status
from public.profiles
where lower(email) = lower('YOUR_ADMIN_EMAIL@example.com');
