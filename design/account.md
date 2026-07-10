# Account Page — Guest Customer

## Route
`/account`

## Purpose
The account page for non-registered customers. Since customer registration is optional, this page focuses on utility features rather than profile management. It serves as a gateway to provider registration, admin access, and app information.

## Layout
```
┌──────────────────────────────────────────────────────┐
│  Account                                             │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │                                                  ││
│  │              ┌──────────┐                        ││
│  │              │   👤     │                        ││
│  │              │  72px    │                        ││
│  │              │  Avatar  │                        ││
│  │              └──────────┘                        ││
│  │                                                  ││
│  │           Welcome to S2B Services               ││
│  │     Browse services without registration        ││
│  │                                                  ││
│  │     [Continue as Guest — Browse Services]       ││
│  │                                                  ││
│  │     or sign in for more features                ││
│  │     [📱 Sign in with Phone]                     ││
│  │                                                  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 📋 My Requests                   >              ││
│  ├──────────────────────────────────────────────────┤│
│  │ 📍 Saved Locations               >              ││
│  ├──────────────────────────────────────────────────┤│
│  │ 🔔 Notifications                 >              ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Support                                             │
│  ┌──────────────────────────────────────────────────┐│
│  │ ❓ Help & FAQ                      >            ││
│  ├──────────────────────────────────────────────────┤│
│  │ 💬 Contact Support                 >            ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  About                                               │
│  ┌──────────────────────────────────────────────────┐│
│  │ 📄 Terms of Service                >            ││
│  ├──────────────────────────────────────────────────┤│
│  │ 🔒 Privacy Policy                  >            ││
│  ├──────────────────────────────────────────────────┤│
│  │ ℹ️ About S2B Services               >            ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Provider                                            │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🔧 Become a Provider               >            ││
│  ├──────────────────────────────────────────────────┤│
│  │ 🔑 Provider Login                  >            ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Admin                                               │
│  ┌──────────────────────────────────────────────────┐│
│  │ ⚙️ Admin Login                     >            ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  v1.0.0 · S2B Services                               │
│                                                      │
│  [Padded bottom for BottomNav]                       │
├──────────────────────────────────────────────────────┤
│ [BottomNav: Home | Services | Requests | Account]   │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Page Header
- Sticky top, white background
- Title: "Account" (h1)
- Safe-area-inset-top padding

### Section: Guest Welcome Card
- White card, border-radius `md`, shadow `shadow-md`, generous padding (32px vertical)
- Centered content:
  - Avatar: 72px circle, `--muted` background, `User` icon (32px, `--foreground-muted`)
  - Title: "Welcome to S2B Services" (h2, centered)
  - Subtitle: "Browse services without registration" (body, `--foreground-muted`, centered)
  - Primary CTA: "Browse Services" — full-width, `--primary` solid, 48px height, `Search` icon
  - Divider text: "or sign in for more features" (body-sm, `--foreground-muted`, centered)
  - Secondary CTA: "Sign in with Phone" — full-width, `--primary` outline, 48px height, `Phone` icon
- This section is prominent but not pushy — guest browsing is the default

**Animation:** Fade in + slide up 20px on page load.

### Section: My Requests
- Section header: "My Requests" (h2)
- Single row: `ClipboardList` icon (20px) + "My Requests" (body) + `ChevronRight` (right)
- Tapping navigates to `/requests`

### Section: Saved Locations
- Section header: "Saved Locations" (h2)
- Single row: `MapPin` icon + "Saved Locations" + `ChevronRight`
- Tapping opens saved locations page (mock for MVP)
- Grayed out if no saved locations

### Section: Notifications
- Section header: "Notifications" (h2)
- Single row: `Bell` icon + "Notifications" + `ChevronRight`
- Tapping opens notifications list (mock for MVP)

### Section: Support
- Section header: "Support" (h2)
- Two rows in a white card:
  1. `HelpCircle` + "Help & FAQ" → navigates to FAQ page
  2. `MessageCircle` + "Contact Support" → opens support bottom sheet
- Each row: 56px height, tap feedback, divider between

### Section: About
- Section header: "About" (h2)
- Three rows in a white card:
  1. `FileText` + "Terms of Service" → opens terms page/modal
  2. `Shield` + "Privacy Policy" → opens privacy page/modal
  3. `Info` + "About S2B Services" → opens about page/modal

### Section: Provider Portal
- Section header: "Provider" (h2)
- Two rows in a white card:
  1. `Wrench` + "Become a Provider" → navigates to `/become-provider`
  2. `LogIn` + "Provider Login" → navigates to `/provider-login`
- "Become a Provider" row has `--secondary-light` background tint to highlight it

### Section: Admin Access
- Section header: "Admin" (h2)
- One row: `Settings` + "Admin Login" → navigates to `/admin/dashboard`
- Subtle styling — not prominently displayed

### Section: App Version
- Centered at bottom: "v1.0.0 · S2B Services" (caption, `--foreground-subtle`)
- Below: "Part of the Shop2Bhutan family" (caption, `--foreground-subtle`)

## Entrance Animations
1. Header: fade in (0s)
2. Welcome card: slide up 24px + fade (0.1s)
3. Menu sections: stagger in 0.05s per section, slide up 12px + fade (0.2s base delay)

## Loading State
- Skeleton: Welcome card shimmer → 5 menu section skeletons with icon + 2 text lines each

## Scroll Behavior
- Native smooth scrolling
- No special sticky behavior
- BottomNav always visible

## Tapping Menu Items
Each navigational row uses a full-width tappable area (56px min height) with:
- Left icon: 20px, `--foreground-muted`
- Label: body size, `--foreground`
- Right: `ChevronRight` icon, `--foreground-subtle`
- Tap feedback: background shifts to `--muted` briefly
- Active state: scale 0.98 briefly

## Data
Purely navigational — no dynamic data except potentially saved locations count badge on "Saved Locations" row.
