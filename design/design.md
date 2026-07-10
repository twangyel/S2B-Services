# S2B Services — Global Design Document

## Overview

S2B Services is Bhutan's premier local service marketplace app — a PWA-ready, Capacitor-ready mobile-first platform connecting verified local service providers with nearby customers. The app follows an **Uber Eats / Uber Ride inspired UX** (not copied) with clean white surfaces, rounded cards, bold primary-blue CTAs, warm orange accents, bottom tab navigation, bottom sheets, and native-app-quality polish.

**Brand:** S2B Services  
**Tagline:** "Your local service central hub"  
**Related to:** Shop2Bhutan/S2B ecosystem (standalone app)  
**Platform:** Mobile-first PWA, Capacitor-ready for Android/iOS  
**Language:** English (with Dzongkha-ready i18n structure)

---

## Color Palette

### Primary Palette
| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `--primary` | `#1A6CF0` | `217 91% 52%` | Main CTAs, nav highlights, trust indicators, primary buttons, links |
| `--primary-dark` | `#1456C8` | `217 83% 43%` | Hover states, pressed buttons, emphasis |
| `--primary-light` | `#E8F1FE` | `217 95% 95%` | Light backgrounds, badges, chips, subtle highlights |
| `--primary-foreground` | `#FFFFFF` | `0 0% 100%` | Text on primary buttons |

### Secondary Palette
| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `--secondary` | `#F97316` | `24 95% 53%` | Secondary CTAs, warm highlights, emergency accents, featured badges |
| `--secondary-dark` | `#EA580C` | `20 90% 49%` | Hover states for secondary |
| `--secondary-light` | `#FFF7ED` | `30 100% 97%` | Light orange backgrounds, badges |
| `--secondary-foreground` | `#FFFFFF` | `0 0% 100%` | Text on secondary buttons |

### Semantic Colors
| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `--success` | `#22C55E` | `142 71% 45%` | Available, approved, verified, completed |
| `--success-light` | `#DCFCE7` | `142 76% 93%` | Light success backgrounds |
| `--warning` | `#F59E0B` | `38 92% 50%` | Pending, busy, warning states |
| `--warning-light` | `#FEF3C7` | `38 92% 95%` | Light warning backgrounds |
| `--error` | `#EF4444` | `0 84% 60%` | Urgent, error, suspended, rejected, rejected |
| `--error-light` | `#FEE2E2` | `0 84% 95%` | Light error backgrounds |
| `--info` | `#3B82F6` | `217 91% 64%` | Informational states, blue accents |
| `--info-light` | `#DBEAFE` | `217 91% 95%` | Light info backgrounds |

### Neutral Colors
| Token | Hex | HSL | Usage |
|-------|-----|-----|-------|
| `--background` | `#F8FAFC` | `210 40% 98%` | App background, page surfaces |
| `--surface` | `#FFFFFF` | `0 0% 100%` | Cards, modals, bottom sheets |
| `--surface-elevated` | `#FFFFFF` | `0 0% 100%` | Elevated cards with shadow |
| `--foreground` | `#0F172A` | `222 47% 11%` | Primary text, headings |
| `--foreground-muted` | `#64748B` | `215 16% 47%` | Secondary text, descriptions |
| `--foreground-subtle` | `#94A3B8` | `215 20% 65%` | Placeholder text, hints |
| `--border` | `#E2E8F0` | `214 32% 91%` | Card borders, dividers |
| `--border-subtle` | `#F1F5F9` | `210 40% 96%` | Light dividers |
| `--muted` | `#F1F5F9` | `210 40% 96%` | Muted backgrounds, inactive tabs |
| `--muted-foreground` | `#64748B` | `215 16% 47%` | Text on muted backgrounds |

### shadcn CSS Variables
```css
:root {
  --background: 210 40% 98%;       /* #F8FAFC */
  --foreground: 222 47% 11%;       /* #0F172A */
  --card: 0 0% 100%;               /* #FFFFFF */
  --card-foreground: 222 47% 11%;
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;
  --primary: 217 91% 52%;          /* #1A6CF0 */
  --primary-foreground: 0 0% 100%;
  --secondary: 24 95% 53%;         /* #F97316 */
  --secondary-foreground: 0 0% 100%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --accent: 210 40% 96%;
  --accent-foreground: 222 47% 11%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 217 91% 52%;
  --radius: 0.75rem;
}
```

---

## Typography

### Font Stack
```
--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-heading: 'Inter', system-ui, sans-serif;
```

Google Fonts: `Inter:wght@400;500;600;700;800` (Latin) + fallback for Dzongkha if needed.

### Type Scale (Mobile-First)
| Token | Size | Weight | Line-Height | Letter-Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `h1` | 28px / 1.75rem | 800 | 1.15 | -0.02em | Hero titles, page headers |
| `h2` | 22px / 1.375rem | 700 | 1.2 | -0.015em | Section headings |
| `h3` | 18px / 1.125rem | 600 | 1.3 | -0.01em | Card titles, sub-headings |
| `h4` | 16px / 1rem | 600 | 1.35 | -0.005em | Small headings, labels |
| `body-lg` | 16px / 1rem | 400 | 1.6 | 0 | Large body text, descriptions |
| `body` | 14px / 0.875rem | 400 | 1.5 | 0 | Default body text |
| `body-sm` | 13px / 0.8125rem | 400 | 1.5 | 0 | Small body, helper text |
| `caption` | 12px / 0.75rem | 500 | 1.4 | 0.01em | Captions, metadata, tags |
| `overline` | 11px / 0.6875rem | 600 | 1.3 | 0.08em | Overlines, status badges, section labels |

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Micro spacing, icon padding |
| `sm` | 8px | Tight spacing, inline elements |
| `md` | 12px | Card internal padding, list item gaps |
| `lg` | 16px | Standard section padding, card padding |
| `xl` | 20px | Section gaps, generous padding |
| `2xl` | 24px | Large section spacing |
| `3xl` | 32px | Section separation |
| `4xl` | 48px | Major section breaks |
| `safe-top` | `env(safe-area-inset-top)` | iOS safe area |
| `safe-bottom` | `env(safe-area-inset-bottom)` | iOS/Android safe area |

---

## Border Radius Scale
| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 6px | Small badges, chips |
| `sm` | 8px | Inputs, small buttons |
| `md` | 12px | Cards, panels |
| `lg` | 16px | Large cards, modals |
| `xl` | 20px | Bottom sheets, hero cards |
| `full` | 9999px | Pills, avatars, circular buttons |

---

## Shadows
| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle card shadows |
| `shadow-md` | `0 2px 8px rgba(0,0,0,0.06)` | Cards, elevated elements |
| `shadow-lg` | `0 4px 16px rgba(0,0,0,0.08)` | Bottom sheets, modals |
| `shadow-xl` | `0 8px 32px rgba(0,0,0,0.12)` | Dialogs, floating elements |
| `shadow-float` | `0 12px 40px rgba(26,108,240,0.15)` | Primary floating CTAs |

---

## Touch Targets

All interactive elements must meet minimum touch targets:
- **Primary buttons:** min 48px height, full-width on mobile with 16px horizontal margin
- **Icon buttons:** 44px × 44px minimum tap area
- **List items:** 56px minimum height
- **Bottom nav tabs:** 56px height each
- **Chip/badge:** 32px minimum height
- **No tap targets below 44px on any axis**

---

## Animation & Motion

### Native-App Transitions
Use Framer Motion for page transitions and micro-interactions:

| Animation | Duration | Easing | Description |
|-----------|----------|--------|-------------|
| Page slide-in | 0.3s | `[0.32, 0.72, 0, 1]` | Slide from right for push, slide from left for pop |
| Page fade | 0.2s | `ease-out` | Fade for tab switches |
| Bottom sheet enter | 0.35s | `[0.32, 0.72, 0, 1]` | Slide up from bottom with spring |
| Bottom sheet exit | 0.25s | `ease-in` | Slide down |
| Card hover/press | 0.15s | `ease-out` | Scale to 0.97 on press, 1.02 on hover (desktop) |
| Skeleton pulse | 2s | `ease-in-out` | Infinite shimmer/opacity pulse |
| Stagger children | 0.05s | `ease-out` | 50ms stagger for lists |
| Button tap | 0.1s | `ease-out` | Scale to 0.96 on active |
| Toast enter | 0.3s | `[0.32, 0.72, 0, 1]` | Slide down from top |
| Toast exit | 0.2s | `ease-in` | Slide up and fade |

### Scroll Behavior
- Use native smooth scrolling via `scroll-behavior: smooth`
- Pull-to-refresh gesture on list pages (visual feedback)
- Infinite scroll with spinner on provider lists
- Scroll position restore on back navigation

---

## Layout System

### Mobile-First Breakpoints
| Name | Width | Behavior |
|------|-------|----------|
| `xs` | 360px | Minimum supported phone width |
| `sm` | 400px | Small phones |
| `md` | 430px | iPhone Pro Max, large phones |
| `lg` | 640px | Tablet portrait / small desktop |
| `xl` | 1024px | Tablet landscape / desktop admin |
| `2xl` | 1280px | Large desktop admin panels |

### Page Layout Structure
```
<AppLayout>
  <PageHeader />           {/* Sticky top with safe-area padding */}
  <main class="pb-24">     {/* Content area with bottom nav padding */}
    {/* page content */}
  </main>
  <BottomNav />            {/* Fixed bottom with safe-area-inset-bottom */}
</AppLayout>
```

### Content Max Width
- Mobile: 100% width, 16px horizontal padding
- Tablet+: max-width 768px centered with subtle background
- Desktop admin: max-width 1400px, sidebar layout

---

## Shared Components

### AppLayout
- Wraps all pages
- Sets background to `--background` (#F8FAFC)
- Manages safe-area-inset padding
- Contains `<main>` scrollable area with bottom padding for nav
- Applies page transition animations via Framer Motion

### CustomerLayout
- Extends AppLayout
- Shows CustomerBottomNav (Home, Services, Requests, Account)
- Includes PageHeader with greeting and location
- Hides nav on full-screen pages (provider profile details)

### ProviderLayout
- Extends AppLayout
- Shows ProviderBottomNav (Dashboard, Requests, Profile, More)
- Different header for provider portal
- Guards against non-provider access

### AdminLayout
- Extends AppLayout
- Mobile: top bar with hamburger menu + title, bottom quick actions or drawer nav
- Desktop (lg+): collapsible sidebar navigation
- Responsive card-based data lists instead of tables on mobile

### BottomNav (Customer)
```
┌─────────────────────────────────────────────┐
│  [Home]    [Services]  [Requests]  [Account]│
│   🏠         🔧          📋           👤     │
│   Home     Services    Requests   Account  │
└─────────────────────────────────────────────┘
```
- Height: 56px + safe-area-inset-bottom padding
- Background: white with top border/shadow
- Active tab: primary blue icon + label, with subtle blue dot indicator
- Inactive tab: muted gray icon + label
- Icon size: 24px
- Label: caption size (12px)
- Tap feedback: scale 0.92 briefly

### PageHeader
- Sticky top with `--surface` background
- Contains: back button (if applicable), title, optional right action (search, share)
- Height: 56px
- Safe-area-inset-top padding
- Bottom border: 1px `--border`
- Back button: 44px touch target, chevron-left icon

### SearchBar
- Full-width input with search icon
- Height: 48px
- Border-radius: `full` (pill shape)
- Background: `--muted`
- Focus state: 2px `--primary` ring
- Clear button (X) appears when text entered
- Microphone icon option for voice search

### FilterChips
- Horizontal scrollable row of pill-shaped chips
- Height: 36px
- Border-radius: `full`
- Active chip: `--primary` background, white text
- Inactive chip: `--muted` background, `--foreground-muted` text
- Horizontal scroll with hidden scrollbar
- Stagger animation on mount

### StatusBadge
| Variant | Background | Text | Icon |
|---------|-----------|------|------|
| `available` | `--success-light` | `--success` | Green dot pulse |
| `busy` | `--warning-light` | `--warning` | Orange dot |
| `offline` | `--muted` | `--foreground-muted` | Gray dot |
| `emergency-only` | `--error-light` | `--error` | Red pulse |
| `pending` | `--warning-light` | `--warning` | Clock icon |
| `approved` | `--success-light` | `--success` | Check icon |
| `rejected` | `--error-light` | `--error` | X icon |
| `suspended` | `--error-light` | `--error` | Alert icon |
| `completed` | `--success-light` | `--success` | Check icon |
| `expired` | `--muted` | `--foreground-muted` | Clock icon |
| `sent` | `--info-light` | `--info` | Send icon |
| `in-progress` | `--primary-light` | `--primary` | Spinner |

### VerifiedBadge
- Blue checkmark shield icon + "Verified" text
- Small chip format: 20px height
- Background: `--primary-light`, icon: `--primary`
- On provider cards: compact icon-only version
- On profile: full chip with text

### AvailabilityBadge
- Live status indicator with pulsing green dot when available
- Dot size: 8px with `animate-ping` ring
- Text: caption size
- Positioned on provider photo or card corner

### EmergencyBadge
- Red lightning bolt icon + "Emergency" text
- Background: `--error-light`, text: `--error`
- Used on category cards and provider profiles
- Prominent position: top-right corner on cards

### ProviderCard
```
┌──────────────────────────────────────────────────────┐
│ ┌──────┐  Provider Name                    Verified  │
│ │      │  ⭐ 4.8 (124 reviews)            💚 Avail. │
│ │Photo │  📍 Thimphu · Electrician · 5 yrs         │
│ │      │  🔧 Wiring • Installation • Repair        │
│ └──────┘  Nu. 200 visit · Nu. 350/hr                │
│ ┌──────────┐ ┌──────────┐ ┌──────────────┐          │
│ │  📞 Call  │ │  💬 WA   │ │ View Profile │          │
│ └──────────┘ └──────────┘ └──────────────┘          │
└──────────────────────────────────────────────────────┘
```
- Card background: white, border-radius: `md` (12px)
- Shadow: `shadow-sm`
- Padding: 16px
- Provider photo: 56px avatar with availability indicator dot
- CTA buttons: Call (primary outline), WhatsApp (secondary outline), View Profile (ghost)
- Tap: navigate to profile with slide-in animation
- Skeleton: 3 cards with shimmer on loading

### ServiceCategoryCard
```
┌──────────────────────────────────────────────┐
│  ┌──────────┐                                │
│  │   Icon   │  Electrician                   │
│  │  (blue)  │  Wiring, repair, installation │
│  └──────────┘  ⚡ Emergency  👤 24 providers │
│                💰 From Nu. 150               │
└──────────────────────────────────────────────┘
```
- Two variants: **Grid** (icon left, text right, compact) and **Horizontal Scroll** (icon top, text bottom)
- Icon container: 48px, `--primary-light` background, `--primary` icon
- Border-radius: `md`
- Popular categories get a small orange "Popular" badge
- Emergency categories get red lightning indicator
- Tap: scale 0.97 briefly, navigate to provider list

### AdminStatCard
```
┌──────────────────────────┐
│ 👤 Total Providers       │
│                          │
│  248                     │
│  ↑ 12% this month        │
└──────────────────────────┘
```
- Background: white, border-radius: `md`
- Shadow: `shadow-sm`
- Icon: 40px circle with tinted background
- Number: h1 size, bold
- Change indicator: green/red with arrow
- Mobile: 2-column grid
- Desktop: horizontal row

### AdminActionCard
- Full-width card with icon, title, description, action button
- Used in admin for approval items, payment items, complaint items
- Left: colored icon circle
- Right: title, subtitle, status badge, quick action buttons
- Swipeable reveal actions on mobile (accept/reject buttons)

### ResponsiveDataList (Admin)
- **Mobile:** Stacked cards with key info + expand for details
- **Tablet+:** Table with sortable columns
- **All:** Search bar at top, filter chips below, pagination
- No horizontal scroll on any breakpoint
- Use `AdminActionCard` components for each row on mobile

### EmptyState
- Centered illustration (use Lucide icon as large graphic)
- Title: h3, `--foreground`
- Description: body, `--foreground-muted`
- Optional CTA button
- Used for: no providers, no requests, no reviews, empty search

### LoadingSkeleton
- Shimmer effect: animated gradient sweep (1.5s, infinite)
- Variants: `card` (provider card), `list` (3-5 items), `profile` (header + sections), `dashboard` (stats + cards)
- Background: linear gradient from `--muted` to `--border-subtle` and back
- Border-radius matches content type

### ConfirmDialog
- Centered modal overlay with backdrop blur
- Title: h3
- Description: body
- Two buttons: Cancel (ghost), Confirm (primary or destructive)
- Focus trap for accessibility
- Enter to confirm, Escape to cancel

### BottomSheet
- Slides up from bottom
- Backdrop: black at 40% opacity, tap to dismiss
- Handle bar: 40px × 4px gray pill at top center
- Max-height: 90vh
- Scrollable content inside
- Spring animation on enter, ease on exit
- Used for: contact form, filter options, location picker, action menus

### FormField
- Label: h4 size, semibold, required asterisk in `--error`
- Input: full-width, 48px height, border-radius `sm`, `--border`
- Focus: 2px `--primary` ring
- Error: `--error` border, error message below
- Helper text: body-sm, `--foreground-muted`
- Icon support: left (prefix) and right (suffix) icons

### FileUploadCard
- Dashed border area, 120px min-height
- Upload icon + "Tap to upload" text
- Accepted formats hint
- Preview thumbnail after upload
- Remove button (X) on preview
- Progress bar during upload simulation

### ReviewCard
```
┌──────────────────────────────────────────────┐
│ ⭐⭐⭐⭐⭐  5.0                              │
│ Dorji T. · 2 days ago                        │
│ "Great service, very professional..."        │
│ 🛠 Electrician — Wiring repair              │
└──────────────────────────────────────────────┘
```
- Compact card, white background
- Stars: 20px, `--warning` filled, `--foreground-subtle` empty
- Avatar + reviewer name + date
- Review text: body size, clamp to 3 lines with "Read more"

### SubscriptionBadge
- Shows plan name + status
- `Free Trial` — green badge
- `Basic` — blue badge
- `Pro` — purple badge
- `Featured` — orange badge
- `Expired` — red badge with renew CTA

### PaymentProofCard
- Shows uploaded payment screenshot
- Status: Pending (warning), Verified (success), Rejected (error)
- Upload date, provider name
- Admin action buttons: Approve / Reject

---

## Icon System

Use **Lucide React** exclusively. Key icons:

| Icon | Usage |
|------|-------|
| `Home` | Home tab |
| `Wrench` | Services tab |
| `ClipboardList` | Requests tab |
| `User` | Account tab, profiles |
| `Search` | Search bar |
| `Phone` | Call button |
| `MessageCircle` | WhatsApp button |
| `MapPin` | Location indicator |
| `Navigation` | Open in Maps |
| `Share2` | Share location |
| `Star` | Ratings, reviews |
| `Shield` | Verification badge |
| `ShieldCheck` | Verified provider |
| `Zap` | Emergency indicator |
| `CheckCircle2` | Approved status |
| `XCircle` | Rejected/cancelled |
| `Clock` | Pending, opening hours |
| `AlertTriangle` | Warnings, complaints |
| `AlertCircle` | Errors, urgent |
| `ChevronLeft` | Back button |
| `ChevronRight` | Navigate forward |
| `ChevronDown` | Expand/collapse |
| `MoreHorizontal` | More options menu |
| `Bell` | Notifications |
| `Filter` | Filter options |
| `Upload` | File upload |
| `Camera` | Photo capture |
| `Trash2` | Delete action |
| `Edit3` | Edit action |
| `Eye` | View action |
| `LogOut` | Sign out |
| `Settings` | Settings |
| `HelpCircle` | Support, FAQ |
| `TrendingUp` | Analytics |
| `Users` | Providers count |
| `DollarSign` | Pricing, payments |
| `FileText` | Documents |

---

## App Shell Architecture

### Three App Portals
1. **Customer App** — Browse, search, contact providers, send requests, rate
2. **Provider Portal** — Registration, dashboard, manage profile, view requests
3. **Admin Panel** — Full platform management

### Entry Point Logic
```
App Entry → Check route
  / → Customer Home
  /services → Services Page
  /providers/:categoryId → Provider List
  /provider/:id → Provider Profile
  /requests → Requests (guest, by phone)
  /account → Guest Account
  /become-provider → Provider Registration
  /provider-login → Provider Login
  /provider/dashboard → Provider Dashboard
  /provider/requests → Provider Requests
  /provider/profile → Provider Profile Management
  /provider/subscription → Subscription
  /admin/dashboard → Admin Dashboard
  /admin/providers → Provider Management
  /admin/approvals → Pending Approvals
  /admin/categories → Category Management
  /admin/payments → Payment Verification
  /admin/requests → Request Monitoring
  /admin/reviews → Reviews & Complaints
  /admin/settings → App Settings
```

---

## Page List

### Customer App (7 pages)
| Page | File | Description |
|------|------|-------------|
| Home | `home.md` | Marketplace home: greeting, hero, search, popular categories, nearby providers, trust section |
| Services | `services.md` | All service categories grid with search, popular highlights, emergency indicators |
| Provider List | `provider-list.md` | Providers filtered by category, with sort/filter, cards with call/WhatsApp CTAs |
| Provider Profile | `provider-profile.md` | Detailed provider page: photo, badges, rating, pricing, reviews, contact CTAs, location share |
| Requests | `requests.md` | Customer's request history (by phone number), status cards, rate/review after completion |
| Account | `account.md` | Guest account page: login optional, requests lookup, support, become provider, about |
| Contact Sheet | `contact-sheet.md` | Bottom sheet: name, phone, issue, location, photo → Call/WhatsApp/Share Location/Send Request |

### Provider Portal (5 pages)
| Page | File | Description |
|------|------|-------------|
| Register | `provider-register.md` | Multi-section provider registration form with document upload |
| Dashboard | `provider-dashboard.md` | Provider home: status toggle, stats, today's requests, quick actions |
| Profile Mgmt | `provider-profile-mgmt.md` | Edit profile, pricing, availability, work photos, documents |
| Requests | `provider-requests.md` | Incoming customer requests with accept/reject/call/Maps actions |
| Subscription | `provider-subscription.md` | Plans, payment proof upload, status, expiry |

### Admin Panel (7 pages)
| Page | File | Description |
|------|------|-------------|
| Dashboard | `admin-dashboard.md` | Analytics: providers, requests, subscriptions, revenue, complaints overview |
| Providers | `admin-providers.md` | Full provider list with search, filter, CRUD actions, suspend/reactivate |
| Approvals | `admin-approvals.md` | Pending provider applications with approve/reject workflow |
| Categories | `admin-categories.md` | Category CRUD: add, edit, reorder, emergency flag, certificate requirement |
| Payments | `admin-payments.md` | Payment proof verification: approve/reject with reason, subscription status |
| Requests | `admin-requests.md` | Monitor all customer requests: filter, detail view, status management |
| Reviews | `admin-reviews.md` | Reviews & complaints: hide reviews, warn/suspend providers |

---

## Assets

| Filename | Description | Location | Dimensions | Type |
|----------|-------------|----------|------------|------|
| `logo.svg` | S2B Services logo — blue geometric "S" shape with connecting lines suggesting network/services | App header, splash, manifest | 512×512 1:1 | SVG |
| `logo-wordmark.svg` | "S2B Services" wordmark with tagline below, modern sans-serif, primary blue | Header, auth screens | 400×80 5:1 | SVG |
| `hero-banner-1.jpg` | Thimphu cityscape with a service provider at work — electrician on a ladder against blue Bhutanese sky, modern and warm | Home hero | 1200×600 2:1 | Image |
| `hero-banner-2.jpg` | Happy Bhutanese family in their home with a service provider shaking hands, warm interior, trustworthy feel | Home hero carousel | 1200×600 2:1 | Image |
| `hero-banner-3.jpg` | Modern tools and equipment laid out neatly on a clean surface, blue and orange color scheme | Home hero carousel | 1200×600 2:1 | Image |
| `empty-requests.svg` | Clean flat illustration of a clipboard with a magnifying glass, blue and gray tones | Requests empty state | 240×240 1:1 | SVG |
| `empty-providers.svg` | Clean flat illustration of a map with pins but no markers, blue tones | Provider list empty state | 240×240 1:1 | SVG |
| `empty-search.svg` | Clean flat illustration of a magnifying glass over a directory, muted colors | Search empty state | 240×240 1:1 | SVG |
| `how-it-works-1.svg` | Simple iconographic illustration: phone with search icon, step 1 | Home how-it-works | 120×120 1:1 | SVG |
| `how-it-works-2.svg` | Simple iconographic illustration: verified provider profile on phone, step 2 | Home how-it-works | 120×120 1:1 | SVG |
| `how-it-works-3.svg` | Simple iconographic illustration: phone with call and WhatsApp icons, step 3 | Home how-it-works | 120×120 1:1 | SVG |
| `how-it-works-4.svg` | Simple iconographic illustration: star rating and handshake, step 4 | Home how-it-works | 120×120 1:1 | SVG |
| `trust-verified.svg` | Shield with checkmark and Bhutanese architectural motif, blue | Home trust section | 80×80 1:1 | SVG |
| `trust-transparent.svg` | Document with visible pricing numbers, orange accent | Home trust section | 80×80 1:1 | SVG |
| `trust-direct.svg` | Phone with direct connection arrows, green | Home trust section | 80×80 1:1 | SVG |
| `provider-avatar-1.jpg` | Professional headshot of a Bhutanese male electrician, 30s, friendly smile, blue work shirt | Provider cards | 400×400 1:1 | Image |
| `provider-avatar-2.jpg` | Professional headshot of a Bhutanese female plumber, 20s, confident, work uniform | Provider cards | 400×400 1:1 | Image |
| `provider-avatar-3.jpg` | Professional headshot of a Bhutanese male carpenter, 40s, warm expression, traditional/modern attire | Provider cards | 400×400 1:1 | Image |
| `work-sample-1.jpg` | Clean electrical panel installation, professional wiring, bright lighting | Provider profile | 800×600 4:3 | Image |
| `work-sample-2.jpg` | Modern bathroom plumbing installation, clean work, white tiles | Provider profile | 800×600 4:3 | Image |
| `splash-screen.svg` | Full-screen splash: S2B Services logo centered, "Your local service central hub" below, blue gradient background | PWA splash | 1170×2532 9:19 | SVG |
| `app-icon-192.png` | App icon: S2B Services logo on white rounded square, blue gradient | PWA manifest | 192×192 1:1 | Image |
| `app-icon-512.png` | Large app icon: S2B Services logo on white rounded square, blue gradient | PWA manifest | 512×512 1:1 | Image |

---

## PWA Configuration

### manifest.json
```json
{
  "name": "S2B Services - Your Local Service Central Hub",
  "short_name": "S2B Services",
  "description": "Find verified local service providers in Bhutan. Electricians, plumbers, mechanics and more.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#F8FAFC",
  "theme_color": "#1A6CF0",
  "orientation": "portrait",
  "scope": "/",
  "icons": [
    { "src": "/icons/app-icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/app-icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Viewport Meta
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

### iOS Safe Area & Theme
```html
<meta name="theme-color" content="#1A6CF0">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="S2B Services">
```

### Capacitor Considerations
- Use `cordova-plugin-ionic-keyboard` for keyboard handling
- Use `cordova-plugin-statusbar` for status bar theming
- All phone/WhatsApp links use `tel:` and `https://wa.me/` schemes
- Location sharing uses Web Geolocation API with Capacitor Geolocation plugin fallback
- Photo upload uses file input with Capacitor Camera plugin fallback
- Google Maps links open in external Maps app via `geo:` / `comgooglemaps://` / `maps.google.com`

---

## Data Architecture (Mock → Supabase Ready)

### TypeScript Types Structure
All types defined in `src/types/` directory:
- `service-category.ts` — Category with icon, pricing, flags
- `provider.ts` — Full provider profile with pricing, availability, documents
- `customer-request.ts` — Service request/lead from customer
- `review.ts` — Customer rating and review
- `subscription.ts` — Provider subscription plan and status
- `admin.ts` — Admin analytics, settings, banners
- `location.ts` — Service areas, locations

### Mock Data Structure
All mock data in `src/data/` directory:
- `service-categories.ts` — 28 categories with metadata
- `providers.ts` — 15-20 diverse providers across categories
- `customer-requests.ts` — Mock request history
- `reviews.ts` — Sample reviews
- `subscriptions.ts` — Plan definitions
- `admin-analytics.ts` — Dashboard metrics
- `banners.ts` — Home page promotional banners

All mock data exported as typed arrays/objects, ready to be replaced with Supabase queries.
