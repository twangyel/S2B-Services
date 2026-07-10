# Admin Dashboard Page

## Route
`/admin/dashboard`

## Purpose
Admin's command center. Mobile-first analytics overview with key metrics, quick alerts requiring action, and shortcuts to all admin functions. Designed for thumb-friendly operation on phone — admin may need to approve providers or verify payments from anywhere.

## Layout

### Mobile Layout
```
┌──────────────────────────────────────────────────────┐
│  ☰  Admin Dashboard                        🔔        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Good evening, Admin 👋                              │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ⚠️ 3 providers awaiting approval                ││
│  │ 💰 2 payments need verification                 ││
│  │ 📝 1 new complaint received                     ││
│  │ [Review Now →]                                     ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌────────────┐┌────────────┐                       │
│  │    👤      ││    ⏳      │                       │
│  │    248     ││     186    │                       │
│  │  Total     ││  Active    │                       │
│  │ Providers  ││  Providers │                       │
│  └────────────┘└────────────┘                       │
│  ┌────────────┐┌────────────┐                       │
│  │    ⏸️      ││    📋      │                       │
│  │     12     ││    1,247   │                       │
│  │  Pending   ││   Total    │                       │
│  │  Approval  ││  Requests  │                       │
│  └────────────┘└────────────┘                       │
│                                                      │
│  ┌────────────┐┌────────────┐                       │
│  │    💰      ││    ⭐      │                       │
│  │  Nu. 45K   ││    4.7   │                       │
│  │  Monthly   ││  Avg.      │                       │
│  │  Revenue   ││  Rating    │                       │
│  └────────────┘└────────────┘                       │
│  ┌────────────┐┌────────────┐                       │
│  │    🚨      ││    📊      │                       │
│  │     5      ││  Electric  │                       │
│  │  Complaints││   #1       │                       │
│  │            ││  Service   │                       │
│  └────────────┘└────────────┘                       │
│                                                      │
│  Quick Actions                                       │
│  ┌──────────────────────────────────────────────────┐│
│  │ 👤 Review Providers                3 pending   > ││
│  ├──────────────────────────────────────────────────┤│
│  │ 💰 Verify Payments                 2 pending   > ││
│  ├──────────────────────────────────────────────────┤│
│  │ 🏷️ Manage Categories               28 active   > ││
│  ├──────────────────────────────────────────────────┤│
│  │ 📋 View All Requests               12 today    > ││
│  ├──────────────────────────────────────────────────┤│
│  │ ⭐ Reviews & Complaints            5 new       > ││
│  ├──────────────────────────────────────────────────┤│
│  │ 🎨 Manage Banners                  3 active    > ││
│  ├──────────────────────────────────────────────────┤│
│  │ ⚙️ App Settings                    —           > ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Recent Activity                                     │
│ ┌──────────────────────────────────────────────────┐ │
│ │ ✅ Karma Electric approved          2 hrs ago    │ │
│ │ 💰 Nu. 599 payment verified         3 hrs ago    │ │
│ │ 📝 New request: Electrician         4 hrs ago    │ │
│ │ ⭐ 5-star review for Dorji Plumb.   5 hrs ago    │ │
│ │ ⚠️ Complaint filed                  6 hrs ago    │ │
│ └──────────────────────────────────────────────────┘ │
│                                                      │
│  [Padded bottom for admin nav]                       │
├──────────────────────────────────────────────────────┤
│ [Admin BottomNav or Quick Action Bar]               │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Admin Header
- Sticky top, white background, shadow-sm
- Left: Hamburger menu icon (opens slide-out drawer with all admin nav items)
- Center: "Admin Dashboard" (h1)
- Right: Notification bell with badge count
- Safe-area-inset-top padding

**Drawer Menu (slide-out from left):**
- S2B Services logo + "Admin Panel" header
- Nav items as list:
  - `LayoutDashboard` + Dashboard
  - `Users` + Providers
  - `UserCheck` + Pending Approvals
  - `ClipboardList` + Requests
  - `Tag` + Categories
  - `CreditCard` + Payments
  - `Star` + Reviews
  - `AlertTriangle` + Complaints
  - `Image` + Banners
  - `MapPin` + Locations
  - `Settings` + Settings
- Each: 48px height, icon + label, active item has `--primary-light` background
- Bottom: "Exit Admin" button (destructive outline)

**Animation:** Drawer slides in from left (0.3s spring), backdrop fades in (0.2s).

### Section: Alerts Banner
- White card, border-radius `md`, left border 4px `--warning`
- Shows up to 3 actionable alerts:
  - "3 providers awaiting approval" with link to approvals
  - "2 payments need verification" with link to payments
  - "1 new complaint received" with link to reviews
- "Review Now →" link at bottom
- Dismissible per alert (X icon)
- If no alerts: section hidden entirely

**Animation:** Slide down from top (0.3s), stagger alerts 0.1s.

### Section: Stats Grid
- 2×4 grid on mobile (2 columns), 4×2 on desktop
- Each AdminStatCard:
  - Icon: 36px circle with tinted background (color matches metric type)
  - Value: h1 size (28px), bold
  - Label: caption size, `--foreground-muted`
- Stats shown:
  1. **Total Providers** — `Users` icon, blue tint, "248"
  2. **Active Providers** — `UserCheck` icon, green tint, "186"
  3. **Pending Approval** — `Clock` icon, orange tint, "12"
  4. **Total Requests** — `ClipboardList` icon, blue tint, "1,247"
  5. **Monthly Revenue** — `DollarSign` icon, purple tint, "Nu. 45K"
  6. **Avg Rating** — `Star` icon, yellow tint, "4.7"
  7. **Open Complaints** — `AlertTriangle` icon, red tint, "5"
  8. **Top Service** — `TrendingUp` icon, green tint, "Electrician"

**Animation:** Cards stagger in 0.04s each, scale 0.95→1 + opacity 0→1 (0.2s base delay).

### Section: Quick Actions
- Section header: "Quick Actions" (h2)
- Vertical list in white card, each row:
  - Left: Icon (20px) in tinted circle + Label (body, bold) + Badge count (if any)
  - Right: `ChevronRight`
  - Height: 56px, divider between items
  - Active: `--primary-light` background flash on tap
- Items link to respective admin pages

**Animation:** Stagger 0.05s per item, slide right 10px + fade.

### Section: Recent Activity
- Section header: "Recent Activity" (h2)
- Vertical timeline-style list:
  - Left: colored dot (green for approval, blue for request, yellow for payment, red for complaint)
  - Right: description + relative time
  - Dots connected by thin vertical line
- Max 8 items, "View all activity" link at bottom

**Animation:** Timeline items stagger 0.06s, slide left 10px + fade.

## Entrance Animations
1. Header: fade in (0s)
2. Alerts banner: slide down (0.1s) if present
3. Stats grid: stagger 0.04s per card (0.15s base)
4. Quick actions: stagger 0.05s (0.3s base)
5. Activity: stagger 0.06s (0.4s base)

## Loading State
- Skeleton: Header shimmer → alerts shimmer (if applicable) → 8 stat card skeletons (2×4) → quick actions skeleton → activity timeline skeleton

## Empty State
- Alerts: hidden if none
- Activity: "No recent activity" with `Activity` icon

## Scroll Behavior
- Native smooth scrolling
- Header + hamburger sticky
- On desktop (lg+): sidebar navigation replaces hamburger, content area shifts right

## Responsive Behavior
| Breakpoint | Layout |
|------------|--------|
| Mobile (<1024px) | Hamburger drawer nav, 2-column stats grid, stacked cards |
| Desktop (1024px+) | Fixed sidebar (240px), 4-column stats grid, richer layout |

## Data
Admin analytics mock data: provider counts, request counts, revenue, ratings, complaints, service popularity.
