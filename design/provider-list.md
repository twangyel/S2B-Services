# Provider List Page — Customer App

## Route
`/providers/:categoryId`

## Purpose
Shows all verified providers for a selected service category. This is the critical listing page where customers browse, compare, and select a provider. Heavy emphasis on trust signals (verified badge, ratings, availability) and immediate action (Call, WhatsApp, View Profile).

## Layout
```
┌──────────────────────────────────────────────────────┐
│ ← Electrician Providers                    🔍 ⚙️    │
├──────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐│
│  │ 🔍 Search providers...                           ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🚨 Emergency Only                   [Toggle]     ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌────────┐┌──────────┐┌──────────┐┌──────────┐    │
│  │ Nearby ││Top Rated ││Avail. Now││Verified  │    │
│  └────────┘└──────────┘└──────────┘└──────────┘    │
│  ┌──────────────────────────────────────────────────┐│
│  │ Lowest Visit Charge                               │
│  └──────────────────────────────────────────────────┘│
│  [Filter chips - horizontal scroll]                   │
│                                                      │
│  12 providers found                                  │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌──────┐  Karma Electric                         ││
│  │ │      │  ⭐ 4.9 (56 reviews)   ✅ Verified      ││
│  │ │Photo │  📍 Thimphu · 8 years exp.             ││
│  │ │      │  💚 Available now                       ││
│  │ └──────┘  ⚡ Wiring · Installation · Repair      ││
│  │      💰 Visit: Nu. 200  ·  Hourly: Nu. 350      ││
│  │ ┌──────────┐ ┌──────────┐ ┌──────────────┐      ││
│  │ │  📞 Call │ │  💬 WA   │ │ View Profile │      ││
│  │ └──────────┘ └──────────┘ └──────────────┘      ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌──────┐  Dorji Plumbing                         ││
│  │ │      │  ⭐ 4.7 (32 reviews)   ✅ Verified      ││
│  │ │Photo │  📍 Thimphu · 5 years exp.             ││
│  │ │      │  🟠 Busy — Available in 2 hrs           ││
│  │ └──────┘  ⚡ Pipes · Leaks · Fitting            ││
│  │      💰 Visit: Nu. 150  ·  Hourly: Nu. 300      ││
│  │ ┌──────────┐ ┌──────────┐ ┌──────────────┐      ││
│  │ │  📞 Call │ │  💬 WA   │ │ View Profile │      ││
│  │ └──────────┘ └──────────┘ └──────────────┘      ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [More provider cards...]                            │
│                                                      │
│  [Padded bottom for BottomNav]                       │
├──────────────────────────────────────────────────────┤
│ [BottomNav hidden on this page — back to Services]  │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Page Header
- Sticky top, white background
- Left: Back chevron + category name + "Providers" (e.g., "Electrician Providers")
- Right: Search icon + Filter icon (opens filter bottom sheet)
- Safe-area-inset-top padding

**Animation:** Slide in from right (push navigation), 0.3s.

### Section: Search Bar
- Full-width pill input, `--muted` background
- Placeholder: "Search providers..."
- Filters provider list in real-time by name, skills, or location
- Shows match count

### Section: Emergency Toggle
- Compact row: `Zap` icon + "Emergency Only" + Switch
- When ON: filters to only `emergencyAvailable: true` providers
- Background: `--error-light` when active, transparent when inactive

### Section: Filter Chips
Horizontal scrollable row:
- **Nearby** — Sort by distance (default)
- **Top Rated** — Sort by rating desc
- **Available Now** — Filter `availabilityStatus === 'available'`
- **Verified Only** — Filter `isVerified === true`
- **Emergency Available** — Filter `emergencyAvailable === true`
- **Lowest Visit Charge** — Sort by `visitCharge` asc

Active chip: `--primary` background, white text. Inactive: `--muted` background. Only one sort chip active at a time. Filter chips (Available, Verified, Emergency) can be combined.

**Animation:** Chips stagger in on mount, 0.04s each.

### Section: Results Count
- "12 providers found" (body-sm, `--foreground-muted`)
- Updates dynamically with filters

### Section: Provider Cards
Full ProviderCard component per provider:
```
┌──────────────────────────────────────────────────────┐
│ ┌────────┐                                           │
│ │  56px  │  Business Name               [Verified]  │
│ │ Avatar │  ⭐ 4.8 (24 reviews)         [Avail.]   │
│ │        │  📍 Service Area · X years exp          │
│ └────────┘  🔧 Skill · Skill · Skill               │
│           💰 Visit: Nu. XXX  ·  Hourly: Nu. XXX   │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────┐    │
│ │    📞 Call   │ │   💬 WhatsApp │ │ Profile  │    │
│ └──────────────┘ └──────────────┘ └──────────┘    │
└──────────────────────────────────────────────────────┘
```

**Card details:**
- Background: white, border-radius `md` (12px), shadow `shadow-sm`
- Padding: 16px
- Avatar: 56px circle, with availability indicator dot (8px, positioned bottom-right of avatar)
  - Available: green pulsing dot
  - Busy: orange static dot
  - Offline: gray static dot
  - Emergency only: red pulsing dot
- Name: h3, bold
- Verified badge: small `ShieldCheck` icon + "Verified" chip if `isVerified`
- Rating: `Star` icon (16px, `--warning`) + number + review count
- Location + experience: body-sm, `--foreground-muted`
- Skills: row of small text badges (pill-shaped, `--muted` background)
- Pricing: body-sm, `DollarSign` icon, visit charge + hourly charge
- CTA row: three equal-width buttons:
  - **Call** — `Phone` icon, `--primary` outline button, opens contact bottom sheet
  - **WhatsApp** — `MessageCircle` icon, `--secondary` outline button (green-tinged), opens contact bottom sheet
  - **Profile** — `ChevronRight` icon, ghost button, navigates to provider profile

**Tap on card body (non-button area):** Navigate to provider profile with slide-in.

**Animation:** Cards stagger in on mount, 0.06s per card, slide up 24px + opacity 0→1.

### Section: Load More / Infinite Scroll
- After initial 10 providers, show loading spinner at bottom
- Auto-load next 10 on scroll within 200px of bottom
- Spinner: `--primary` color, 24px
- End of list: "That's all the providers" text with checkmark icon

## Loading State
- Skeleton: 4 provider card skeletons with avatar placeholder, 3 text lines, 3 button placeholders
- Shimmer animation on each skeleton

## Empty States
- **No providers in category:** `Users` icon (48px) + "No providers yet" + "Check back soon or browse another category"
- **Filter no results:** `Filter` icon + "No providers match your filters" + "Clear all filters" button
- **Search no results:** `Search` icon + "No providers match your search" + "Try different keywords"

## Scroll Behavior
- Native smooth scrolling
- Header + search + filter chips become sticky (top: 0) on scroll
- No BottomNav on this page (back navigation via header chevron)
- Pull-to-refresh supported

## Filter Bottom Sheet
Tapping the filter icon opens a bottom sheet:
- **Sort by:** Radio group — Nearby, Top Rated, Lowest Price, Most Reviewed
- **Filter by:** Checkboxes — Available Now, Verified Only, Emergency Available, Experience 5+ years
- **Price Range:** Min/max visit charge inputs
- **Service Area:** Multi-select of Bhutan locations (Thimphu, Paro, Punakha, etc.)
- **Actions:** "Clear All" (ghost) + "Apply Filters" (primary, full-width)

## Data
Filtered from mock providers array by `categoryId`. Each provider in the list has:
`id`, `name`, `businessName`, `photo`, `categoryId`, `rating`, `reviewCount`, `isVerified`, `availabilityStatus`, `location`, `serviceAreas`, `experienceYears`, `skills[]`, `visitCharge`, `hourlyCharge`, `emergencyAvailable`, `phone`
