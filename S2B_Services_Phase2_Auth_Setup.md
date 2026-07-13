# S2B Services — Phase 2 Authentication Setup

This package connects the existing S2B Services frontend to the Supabase schema that was already installed successfully.

## 1. Add local environment variables

Copy `.env.example` to `.env.local` and replace the placeholders:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

Use only the browser-safe publishable key (or the legacy anon key if that is what the dashboard shows). Never use a secret or service-role key in this Vite project.

## 2. Configure Supabase Auth URLs

In Supabase Dashboard → Authentication → URL Configuration:

- Set **Site URL** to the deployed S2B Services Vercel URL.
- Add `http://localhost:3000/**` for local development.
- Add `https://YOUR-VERCEL-DOMAIN.vercel.app/**` for production.

The wildcard allows account confirmation and password-recovery routes such as `/account` and `/update-password`.

## 3. Add the same variables in Vercel

In Vercel → Project → Settings → Environment Variables, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Add them for Production, Preview and Development, then redeploy.

## 4. Create the first super-admin

1. Start the app and register normally with your own email.
2. Confirm the email if email confirmation is enabled.
3. Open Supabase SQL Editor.
4. Open `S2B_Services_Promote_First_Admin.sql`.
5. Replace `YOUR_ADMIN_EMAIL@example.com` with the registered email and run it.
6. Sign out and sign in again. The Account page will show **Admin Panel**.

## 5. Test checklist

- Guest browsing still works without signing in.
- Registration creates a row in Authentication → Users and `public.profiles`.
- Sign-in survives a refresh or reopening the installed PWA.
- Bookings redirects guests to `/login`.
- Account → My Profile saves name, phone, service area and address.
- Forgot Password email opens `/update-password` and accepts a new password.
- Customer cannot open provider/admin protected routes.
- Super-admin can open `/admin/dashboard` after promotion.

## Included frontend changes

- Supabase JavaScript client and safe environment handling
- Registration, login, forgot-password and update-password pages
- Persistent auth/session context
- Customer, provider and admin route guards
- Role-aware redirect after sign-in
- Real Account screen state and sign-out
- Authenticated customer profile editor
- Vercel SPA rewrite for deep links and auth callbacks
- PWA cache version bump so installed clients receive the new build

The provider application form and public catalog still use their existing prototype logic. They are the next integration stage after authentication is tested.
