# Admin Request Monitoring Page

## Route
`/admin/requests`

## Purpose
Admin monitors all customer service requests/leads across the platform. Can filter by service, status, provider, location, date. Understands lead sources (call, WhatsApp, in-app request). Mobile-first card layout.

## Layout
```
┌──────────────────────────────────────────────────────┐
│  ☰  All Requests                            🔍      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 1,247 total requests · 12 today                  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌────────┐┌──────────┐┌──────────┐┌──────────┐    │
│  │ Today  │ │Week    │ │Month   │ │ All     │    │
│  └────────┘└──────────┘└──────────┘└──────────┘    │
│                                                      │
│  Filter: ┌────────┐┌────────┐┌────────┐             │
│          │Status  ││Service ││Location│             │
│          └────────┘└────────┘└────────┘             │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🛠 Electrician                                    ││
│  │ Karma Electric Solutions                         ││
│  │ 👤 Dorji T. · 📞 1756XXXX · 📍 Thimphu          ││
│  │ "Wiring issue in living room"                    ││
│  │                                                   ││
│  │ 📞 Lead source: Phone Call                       ││
│  │ 📅 Today, 10:30 AM                               ││
│  │                                                   ││
│  │ ┌──────────────────────────────────────────────┐  ││
│  │ │ ✅ Completed                                  │  ││
│  │ └──────────────────────────────────────────────┘  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🚿 Plumber                                        ││
│  │ Dorji Plumbing                                   ││
│  │ 👤 Pema W. · 📞 1777XXXX · 📍 Thimphu           ││
│  │ "Kitchen sink leaking"                           ││
│  │                                                   ││
│  │ 💬 Lead source: WhatsApp                         ││
│  │ 📅 Today, 9:15 AM                                ││
│  │                                                   ││
│  │ ┌──────────────────────────────────────────────┐  ││
│  │ │ 🟠 In Progress                                │  ││
│  │ └──────────────────────────────────────────────┘  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🌐 Internet/WiFi                                  ││
│  │ TechNet Bhutan                                   ││
│  │ 👤 Sonam K. · 📞 1788XXXX · 📍 Paro             ││
│  │ "WiFi not working since yesterday"               ││
│  │                                                   ││
│  │ 📋 Lead source: In-App Request                   ││
│  │ 📅 Yesterday, 4:00 PM                            ││
│  │                                                   ││
│  │ ┌──────────────────────────────────────────────┐  ││
│  │ │ 🔵 Sent                                       │  ││
│  │ └──────────────────────────────────────────────┘  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [More request cards...]                             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Header
- Hamburger + "All Requests" (h1) + Search icon

### Section: Stats Bar
- "1,247 total requests · 12 today" (body-sm)

### Section: Date Range Tabs
- **Today** / **This Week** / **This Month** / **All**
- Active tab highlighted

### Section: Filter Chips
- Horizontal scrollable:
  - **Status** — dropdown: All, Sent, Accepted, In Progress, Completed, Cancelled
  - **Service** — dropdown: all category names
  - **Location** — dropdown: Thimphu, Paro, Punakha, etc.
- Filter count badge shown on active filters

### Section: Request Cards
Each request is a clean info card:

```
┌──────────────────────────────────────────────────────┐
│ 🛠 Service Category                                  │
│ Provider Business Name                               │
│ 👤 Customer Name · 📞 Phone · 📍 Location            │
│ "Issue description..."                               │
│                                                       │
│ [Lead Source Badge] · 📅 Date/Time                   │
│                                                       │
│ ┌──────────────────────────────────────────────────┐  │
│ │ [StatusBadge]                                    │  │
│ └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

- White card, border-radius `md`, shadow `shadow-sm`
- Service icon + category name (h4)
- Provider name (body, bold)
- Customer: name, masked phone, location
- Description: body-sm, `--foreground-muted`
- Lead source badge:
  - Phone Call: `Phone` icon, `--info-light`
  - WhatsApp: `MessageCircle` icon, green-tinted
  - In-App Request: `ClipboardList` icon, `--primary-light`
- Date/time: body-sm
- Full-width status banner at bottom

### Section: Request Detail Bottom Sheet
Tapping a card opens detail:
- Full customer + provider info
- Complete issue description
- Photo if attached
- Location with map preview
- Status history (timeline: Sent → Accepted → In Progress → Completed)
- Admin actions: Change Status (dropdown), Assign to Provider, View Customer, View Provider

## Entrance Animations
1. Header: fade in (0s)
2. Stats + tabs: slide down (0.05s)
3. Cards: stagger 0.06s, slide up 16px + fade (0.1s base)

## Loading State
- Skeleton: Stats + tabs shimmer → 4 request card skeletons

## Empty States
- No requests today: "No requests today" + "Requests will appear here as customers contact providers"
- Filter empty: "No requests match your filters" + "Clear all filters"

## Data
All mock customer requests with `leadSource` field: 'phone', 'whatsapp', 'in-app'. Filterable by date range, status, service, location.
