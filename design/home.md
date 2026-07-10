# Home Page — Customer App

## Route
`/` — The landing screen. No authentication required.

## Purpose
The main marketplace home. Customers open the app and immediately see a polished, inviting interface that builds trust and guides them to find service providers. The page feels like a premium app home screen — not a static website.

## Layout
```
┌──────────────────────────────────────────────────────┐
│ [Status Bar — safe-area-inset-top]                  │
├──────────────────────────────────────────────────────┤
│  Hi there 👋                                          │
│  📍 Set your location                                 │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🔍 What service do you need?                     ││
│  └──────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────┤
│  [SCROLLABLE CONTENT]                                 │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │  🚨 Emergency? Get urgent help now               ││
│  │  Electrician · Plumber · Mechanic                ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  🏷️ Popular Services                  See All →     │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌──────┐ │
│  │ Icon  │ │ Icon  │ │ Icon  │ │ Icon  │ │ Icon │ │
│  │Elec-  │ │Plumb- │ │Inter- │ │Carp-  │ │Clean-│ │
│  │trician│ │er     │ │net    │ │enter │ │ing   │ │
│  └───────┘ └───────┘ └───────┘ └───────┘ └──────┘ │
│  [Horizontal scroll, snap to card]                   │
│                                                      │
│  ⚡ Nearby Verified Providers                       │
│  ┌──────────────────────────────────────────────────┐│
│  │ [ProviderCard] [ProviderCard] [ProviderCard]    ││
│  └──────────────────────────────────────────────────┘│
│  [Horizontal scroll]                                  │
│                                                      │
│  ⭐ Featured Providers                                │
│  ┌──────────────────────────────────────────────────┐│
│  │ [FeaturedProviderCard] [FeaturedProviderCard]   ││
│  └──────────────────────────────────────────────────┘│
│  [Horizontal scroll]                                  │
│                                                      │
│  📋 How It Works                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │  1  │ │  2  │ │  3  │ │  4  │                   │
│  │Search│ │Verify│ │Contact│ │Rate│                  │
│  └─────┘ └─────┘ └─────┘ └─────┘                   │
│                                                      │
│  🛡️ Trust & Safety                                   │
│  ┌──────────────────────────────────────────────────┐│
│  │ Verified Providers                               ││
│  │ All providers are identity and skill verified    ││
│  ├──────────────────────────────────────────────────┤│
│  │ Transparent Pricing                              ││
│  │ Clear visit charges before you book              ││
│  ├──────────────────────────────────────────────────┤│
│  │ Direct Contact                                   ││
│  │ Call or WhatsApp providers directly              ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  🔨 More Services                                     │
│  ┌──────────┬──────────┬──────────┐                  │
│  │Electrici-│ Plumber  │ Internet │                  │
│  │ an       │          │ WiFi     │                  │
│  ├──────────┼──────────┼──────────┤                  │
│  │House     │ Cleaning │ Painting │                  │
│  │Shifting  │          │          │                  │
│  ├──────────┼──────────┼──────────┤                  │
│  │Gas       │Pest      │ Gardening│                  │
│  │Cylinder  │Control   │          │                  │
│  └──────────┴──────────┴──────────┘                  │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │  🔧 Are you a service provider?                  ││
│  │  Join S2B Services and grow your business        ││
│  │  [Become a Provider]                             ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [Padded bottom for BottomNav ~80px]                 │
├──────────────────────────────────────────────────────┤
│ [BottomNav: Home | Services | Requests | Account]   │
│ [safe-area-inset-bottom padding]                    │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: App Header (Greeting + Location)
- **Position:** Fixed top, sticky
- **Background:** White with subtle bottom border
- **Safe-area-inset-top:** env(safe-area-inset-top)
- **Content:**
  - Greeting: "Hi there 👋" (h2, 22px, bold) — dynamic: "Good morning", "Good afternoon", "Good evening"
  - Location prompt: Row with `MapPin` icon (16px, `--primary`) + "Set your location" or current location (body-sm, `--foreground-muted`)
  - Tapping location opens location bottom sheet

**Animation:** Fade in on load, 0.3s ease-out.

### Section: Search Bar
- **Position:** Below header, sticky after scroll past 100px
- **Style:** Pill-shaped (`rounded-full`), `--muted` background, 48px height
- **Content:** `Search` icon (20px, `--foreground-subtle`) + "What service do you need?" placeholder
- **Behavior:** Tapping opens a full-screen search overlay with service category suggestions, recent searches, and trending services
- **Focus:** Ring-2 `--primary` on focus

**Animation:** Slide down from header on load with 0.1s delay, fade 0.2s.

### Section: Emergency Banner
- **Position:** Full-width card, horizontal padding 16px
- **Style:** `--error-light` background, `--error` left border (4px), border-radius `md`
- **Shadow:** `shadow-sm`
- **Content:**
  - Row: `Zap` icon (24px, `--error`) + "Emergency?" (h3, `--error`) 
  - Subtext: "Get urgent help now" (body-sm, `--foreground-muted`)
  - Below: Horizontal row of emergency category pills: "Electrician", "Plumber", "Mechanic" — each is a small tappable pill that navigates directly to that category's provider list with emergency filter on
- **Behavior:** Tapping a pill navigates to provider list with emergency filter pre-applied

**Animation:** Slide up from 20px below, 0.35s spring animation, 0.2s delay after search bar.

### Section: Popular Services (Horizontal Scroll)
- **Header:** Row with "Popular Services" (h2) + "See All →" link (body-sm, `--primary`)
- **Layout:** Horizontal scroll container with `overflow-x-auto`, `scroll-snap-type: x mandatory`, hidden scrollbar
- **Cards:** ServiceCategoryCard compact variant:
  - Width: 88px per card
  - Icon: 48px container, `--primary-light` background, `--primary` Lucide icon
  - Label: caption size, centered below, 2-line max
  - `scroll-snap-align: start`
- **Categories shown:** Electrician, Plumber, Internet/WiFi, Carpenter, Cleaning, AC Repair, Vehicle Mechanic, House Shifting
- **Tap:** Navigate to provider list for that category

**Animation:** Stagger children 0.05s delay each, slide up 20px + opacity 0→1, starting after emergency banner.

### Section: Nearby Verified Providers
- **Header:** "Nearby Verified Providers" (h2) + optional "See All →" 
- **Layout:** Horizontal scroll with ProviderCard components (compact variant)
- **Cards:** Compact provider cards showing: photo (48px), name, verified badge, rating, availability, visit charge
- **Data:** Top 5-6 providers sorted by distance/rating
- **Empty state:** "No providers nearby yet" with CTA to browse all

**Animation:** Horizontal scroll cards stagger in from right, 0.05s each, slide-x + fade.

### Section: Featured Providers
- **Header:** "⭐ Featured Providers" (h2) with small orange star
- **Layout:** Horizontal scroll with featured variant cards
- **Featured card:** Slightly larger, with orange left border accent, "Featured" badge in top-right
- **Data:** 3-4 featured providers

**Animation:** Same stagger as nearby providers, 0.1s additional delay.

### Section: How It Works
- **Header:** "How It Works" (h2)
- **Layout:** Horizontal scroll with 4 step cards
- **Each step card:**
  - Number circle: 32px, `--primary` background, white number
  - Icon illustration: 64px
  - Title: h4
  - Description: body-sm, `--foreground-muted`
  - Steps: 1. Search Service, 2. Pick Verified Provider, 3. Call or WhatsApp, 4. Rate the Service
- **Background:** White card with `--border` border, border-radius `md`

**Animation:** Steps reveal sequentially on scroll into view, 0.15s stagger between each step.

### Section: Trust & Safety
- **Header:** "Trust & Safety" (h2)
- **Layout:** Vertical stack of 3 trust cards
- **Each card:**
  - Left: Icon (40px, in tinted circle)
  - Right: Title (h4) + description (body-sm)
  - Border-bottom between cards (except last)
  - Cards: "Verified Providers" (ShieldCheck, blue), "Transparent Pricing" (DollarSign, orange), "Direct Contact" (Phone, green)
- **Background:** White card container, border-radius `md`

**Animation:** Fade in + slide up 30px on scroll into view, stagger 0.1s per card.

### Section: More Services Grid
- **Header:** "More Services" (h2) + "View All →"
- **Layout:** 3-column grid
- **Each cell:** Icon (24px) + service name (caption), center-aligned
- **Categories:** All remaining categories not shown in popular
- **Tap:** Navigate to provider list

**Animation:** Stagger grid items 0.03s each, scale 0.95→1 + opacity 0→1.

### Section: Become a Provider CTA
- **Style:** `--primary-light` background, border-radius `md`, border: 1px dashed `--primary` at 30% opacity
- **Content:**
  - `Wrench` icon (32px, `--primary`)
  - "Are you a service provider?" (h3)
  - "Join S2B Services and grow your business" (body, `--foreground-muted`)
  - Button: "Become a Provider" (primary button, full-width)
- **Tap:** Navigate to provider registration

**Animation:** Fade in on scroll, 0.3s.

---

## Entrance Animations
1. Header fades in immediately (0s delay)
2. Search bar slides down (0.05s delay)
3. Emergency banner springs up (0.15s delay)
4. Popular services stagger in (0.2s delay, 0.05s stagger)
5. Nearby providers slide in from right (0.3s delay)
6. Featured providers slide in (0.4s delay)
7. How it works, Trust, More Services, CTA animate on scroll-trigger

## Loading State
- Skeleton: Header shimmer → search bar shimmer → 8 skeleton category circles → 3 skeleton provider cards → 3 skeleton feature cards → skeleton grid (9 items) → skeleton CTA card
- Each skeleton uses pulse animation (1.5s, infinite)

## Scroll Behavior
- Native smooth scrolling
- Search bar becomes sticky (top: 0, z-50) after scrolling past 80px
- Header hides on scroll down (translateY: -100%), reappears on scroll up
- BottomNav always visible

## Pull-to-Refresh
- On pull down > 60px: show spinner + "Pull to refresh"
- On release: trigger data refresh animation
- Content fades slightly during refresh
