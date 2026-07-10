# Provider Dashboard Page

## Route
`/provider/dashboard`

## Purpose
The provider's home screen after login. Shows profile completion status, subscription status, availability toggle, today's requests, stats, and quick actions. This is the nerve center for providers.

## Layout
```
┌──────────────────────────────────────────────────────┐
│  Provider Dashboard                        🔔 ⚙️    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌──────────┐  Karma Electric                     ││
│  │ │  56px    │  ⭐ 4.9 · 128 reviews               ││
│  │ │  Avatar  │  ✅ Verified · 🟢 Subscription Active││
│  │ └──────────┘                                     ││
│  │ ┌──────────────────────────────────────────────┐  ││
│  │ │ Profile 85% complete — Add work photos      │  ││
│  │ │ [Complete Profile]                            │  ││
│  │ └──────────────────────────────────────────────┘  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 📊 Availability                                   ││
│  │                                                   ││
│  │ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐   ││
│  │ │   💚   │ │   🟠   │ │   ⚫   │ │    🚨    │   ││
│  │ │Available│ │  Busy  │ │Offline │ │Emergency │   ││
│  │ │ [Active]│ │        │ │        │ │   Only   │   ││
│  │ └────────┘ └────────┘ └────────┘ └──────────┘   ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Today's Requests                                    │
│ ┌──────────────────────────────────────────────────┐ │
│ │ 🛠 Electrician — Wiring Repair                    │ │
│ │ 👤 Dorji · 📞 1756XXXX · 📍 Thimphu              │ │
│ │ "Living room wiring issue..."                     │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐          │ │
│ │ │  Accept  │ │  Reject  │ │  Call    │          │ │
│ │ └──────────┘ └──────────┘ └──────────┘          │ │
│ └──────────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────────┐ │
│ │ 🚿 Plumber — Leakage Fix                          │ │
│ │ 👤 Pema · 📞 1777XXXX · 📍 Thimphu               │ │
│ │ "Kitchen pipe is leaking..."                      │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐          │ │
│ │ │  Accept  │ │  Reject  │ │  Call    │          │ │
│ │ └──────────┘ └──────────┘ └──────────┘          │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│  Quick Stats                                         │
│ ┌────────────┐┌────────────┐┌────────────┐          │
│ │   📋 12    ││   👁️ 45   ││   ⭐ 4.9  │          │
│ │  New Leads ││ Profile    ││  Rating    │          │
│ │  This Week ││  Views     ││            │          │
│ └────────────┘└────────────┘└────────────┘          │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 💳 Subscription                                   ││
│  │ Pro Provider — Active until Dec 31, 2025        ││
│  │ [Manage Subscription]                             ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Quick Actions                                       │
│ ┌──────────────────────────────────────────────────┐ │
│ │ ✏️ Edit Profile                      >           │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ 💰 Manage Pricing                    >           │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ 📅 Manage Availability               >           │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ 📋 View All Requests                 >           │ │
│ ├──────────────────────────────────────────────────┤ │
│ │ 📄 Upload Documents                  >           │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│  [Padded bottom for ProviderBottomNav]               │
├──────────────────────────────────────────────────────┤
│ [Dashboard | Requests | Profile | More]             │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Header
- Sticky top, white background
- Title: "Dashboard" (h1)
- Right: Notification bell (badge if unread) + Settings gear icon
- Safe-area-inset-top padding

### Section: Profile Summary Card
- White card, border-radius `md`, shadow `shadow-sm`
- Row layout:
  - Avatar: 56px circle with availability dot
  - Info: Business name (h3), rating + review count, verified + subscription badges
- Below (if profile incomplete): Compact banner
  - Background: `--warning-light`, border-radius `sm`
  - Text: "Profile X% complete — [action needed]" (body-sm)
  - Button: "Complete Profile" (small, primary outline)

**Animation:** Slide up 20px + fade on load.

### Section: Availability Toggle
- White card, border-radius `md`
- Label: "Availability" (h3) with `Clock` icon
- Four equal-width tappable buttons in a row:
  - **Available** — `CheckCircle2` icon, green border + background when active
  - **Busy** — `Clock` icon, orange border + background when active
  - **Offline** — `Moon` icon, gray border + background when active
  - **Emergency Only** — `Zap` icon, red border + background when active
- Active state: filled background with icon color, white text
- Tap feedback: scale 0.95, instant color change
- Changes saved immediately (localStorage update + toast: "Status updated to Available")

### Section: Today's Requests
- Section header: "Today's Requests" (h2) + count badge
- Shows customer request cards (compact):
  ```
  ┌────────────────────────────────────────────────────┐
  │ 🛠 Category — Issue title                          │
  │ 👤 Customer name · 📞 Phone · 📍 Location          │
  │ "Issue description text..."                        │
  │ ┌──────────┬──────────┬──────────┐                 │
  │ │  Accept  │  Reject  │  Call    │                 │
  │ └──────────┴──────────┴──────────┘                 │
  └────────────────────────────────────────────────────┘
  ```
  - Card: white, border-radius `md`, 12px padding
  - Category icon + issue title (h4)
  - Customer info: name, masked phone, location (body-sm)
  - Description: body-sm, `--foreground-muted`, max 2 lines
  - Buttons: Accept (success outline), Reject (destructive outline), Call (primary ghost)
- Empty state: "No requests today" with relaxed illustration

### Section: Quick Stats
- 3-column grid of stat cards:
  - **New Leads** — `ClipboardList` icon, number (h2), label (caption)
  - **Profile Views** — `Eye` icon, number, label
  - **Rating** — `Star` icon, rating number, label
- Each card: white background, border-radius `md`, centered content, 80px min-height

### Section: Subscription Card
- White card with left border (4px, `--primary` for active, `--error` for expired)
- Plan name: "Pro Provider" (h3) + SubscriptionBadge
- Status: "Active until Dec 31, 2025" or "Expired — Renew now" (body-sm)
- Button: "Manage Subscription" (primary outline, small)
- If expired: card background `--error-light`, CTA is prominent

### Section: Quick Actions Menu
- Section header: "Quick Actions" (h2)
- Vertical list of tappable rows in white card:
  1. `Edit3` + "Edit Profile" → `/provider/profile`
  2. `DollarSign` + "Manage Pricing" → pricing sub-page
  3. `Clock` + "Manage Availability" → availability sub-page
  4. `ClipboardList` + "View All Requests" → `/provider/requests`
  5. `Upload` + "Upload Documents" → document upload sub-page
- Each row: 56px height, icon (20px) + label + chevron, divider between

## Entrance Animations
1. Header: fade in (0s)
2. Profile card: slide up 20px + fade (0.1s)
3. Availability toggle: slide up 16px (0.15s)
4. Request cards: stagger 0.08s each (0.2s base)
5. Stats: stagger 0.05s each (0.3s base)
6. Subscription + Quick Actions: fade in on scroll (0.35s base)

## Loading State
- Skeleton: Profile card shimmer → availability 4-box skeleton → 2 request card skeletons → 3 stat skeletons → subscription skeleton → menu skeleton

## Scroll Behavior
- Native smooth scrolling
- Header sticky
- Availability toggle could become compact sticky bar on scroll (optional enhancement)
- ProviderBottomNav always visible

## Data
Provider object from localStorage (mock login state). Key fields: `id`, `businessName`, `photo`, `rating`, `reviewCount`, `isVerified`, `subscriptionStatus`, `availabilityStatus`, `profileCompletionPercentage`.

Requests filtered by today's date and provider's category matches.
