# Provider Requests Page

## Route
`/provider/requests`

## Purpose
Provider's dedicated request management screen. Shows all incoming customer requests with full accept/reject workflow, customer contact details, and Google Maps integration. Critical for provider workflow.

## Layout
```
┌──────────────────────────────────────────────────────┐
│ ← Incoming Requests                    🔍 Filter     │
├──────────────────────────────────────────────────────┤
│  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  All   │ │Pending   │ │Accepted  │ │Completed │ │
│  │  [12]  │ │ [5]     │ │ [4]     │ │ [3]     │ │
│  └────────┘ └──────────┘ └──────────┘ └──────────┘ │
│  [Tab filter]                                         │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🛠 Electrician — Wiring Repair                   ││
│  │                                                   ││
│  │ ┌──────────────────────────────────────────────┐ ││
│  │ │ 🔵 New Request — 10 min ago                  │ ││
│  │ └──────────────────────────────────────────────┘ ││
│  │                                                   ││
│  │ 👤 Dorji Tshering                                ││
│  │ 📞 1756XXXX · 📍 Kawajangsa, Thimphu            ││
│  │                                                   ││
│  │ "The wiring in our living room has been         ││
│  │  sparking. Need urgent help."                   ││
│  │                                                   ││
│  │ 📎 1 photo attached                              ││
│  │                                                   ││
│  │ ┌──────────────┐ ┌──────────────┐               ││
│  │ │  ✅ Accept   │ │  ❌ Reject   │               ││
│  │ └──────────────┘ └──────────────┘               ││
│  │ ┌──────────────┐ ┌──────────────┐               ││
│  │ │  📞 Call     │ │  💬 WhatsApp │               ││
│  │ └──────────────┘ └──────────────┘               ││
│  │ ┌──────────────────────────────────────────────┐ ││
│  │ │  🗺️ Open in Google Maps                      │ ││
│  │ └──────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🚿 Plumber — Sink Leakage                        ││
│  │                                                   ││
│  │ ┌──────────────────────────────────────────────┐ ││
│  │ │ 🟠 In Progress — Accepted 2 hrs ago          │ ││
│  │ └──────────────────────────────────────────────┘ ││
│  │                                                   ││
│  │ 👤 Pema Wangdi                                   ││
│  │ 📞 1777XXXX · 📍 Changangkha, Thimphu           ││
│  │                                                   ││
│  │ "Kitchen sink pipe is leaking slowly."          ││
│  │                                                   ││
│  │ ┌──────────────┐ ┌──────────────┐               ││
│  │ │  📞 Call     │ │  💬 WhatsApp │               ││
│  │ └──────────────┘ └──────────────┘               ││
│  │ ┌──────────────────────────────────────────────┐ ││
│  │ │  🗺️ Open in Google Maps                      │ ││
│  │ └──────────────────────────────────────────────┘ ││
│  │ ┌──────────────────────────────────────────────┐ ││
│  │ │  ✅ Mark as Completed                        │ ││
│  │ └──────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [More request cards...]                             │
│                                                      │
│  [Padded bottom for ProviderBottomNav]               │
├──────────────────────────────────────────────────────┤
│ [Dashboard | Requests | Profile | More]             │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Page Header
- Sticky top, white
- Left: Back button + "Incoming Requests" (h1)
- Right: Search/filter icon

### Section: Status Tabs
- Horizontal tab bar, 4 tabs:
  - **All [count]** — All requests
  - **Pending [count]** — Status: sent, provider-accepted
  - **Accepted [count]** — Status: in-progress
  - **Completed [count]** — Status: completed, cancelled
- Active tab: `--primary` underline + text
- Tab bar: full-width, `--surface` background, bottom border
- Badge count: small circle, `--primary-light` background

**Animation:** Tabs slide in, active indicator slides horizontally (0.2s spring).

### Section: Request Cards

**Pending/New request card:**
- White card, border-radius `md`, shadow `shadow-sm`, 16px padding
- Top: Category icon + issue title (h3)
- Status banner: full-width, colored background
  - New: `--info-light`, "New Request — [relative time]"
  - Accepted: `--success-light`, "Accepted — [time ago]"
  - In Progress: `--primary-light`, "In Progress"
- Customer info:
  - `User` icon + name (body, bold)
  - `Phone` icon + masked phone (body-sm)
  - `MapPin` + location (body-sm)
- Issue description: body-sm, `--foreground-muted`, max 3 lines
- Photo attachment indicator if present: `Paperclip` + count
- Action buttons (vary by status):

**For New/Pending:**
- Accept (success solid) / Reject (destructive outline) — side by side
- Call (primary outline) / WhatsApp (secondary outline) — side by side
- Open in Google Maps (ghost, full-width) — `Navigation` icon

**For Accepted/In Progress:**
- Call / WhatsApp — side by side
- Open in Google Maps — full-width ghost
- Mark as Completed — full-width success outline

**For Completed:**
- Call / WhatsApp — side by side (for follow-up)
- Rate Customer — optional (future feature)

### Section: Accept Action
Tapping Accept:
1. Button shows loading spinner briefly
2. Status banner updates to "Accepted" (green)
3. Toast: "Request accepted! Contact the customer."
4. Card moves to "Accepted" tab on next filter

### Section: Reject Action
Tapping Reject:
1. ConfirmDialog: "Reject this request?" with optional reason input
2. On confirm: status updates to "Rejected"
3. Toast: "Request rejected"
4. Card fades out and moves to filtered view

### Section: Call/WhatsApp Actions
- Call: opens `tel:` link directly
- WhatsApp: opens `https://wa.me/[phone]` with pre-filled message

### Section: Open in Google Maps
- Opens Google Maps with customer location
- Uses `https://www.google.com/maps/search/?api=1&query=[lat],[lng]`
- Or `geo:` scheme on native apps

## Entrance Animations
1. Header: fade in (0s)
2. Tabs: slide in from top (0.05s)
3. Cards: stagger 0.08s, slide up 20px + fade (0.1s base)

## Loading State
- Skeleton: Tab bar shimmer → 3 request card skeletons with full content placeholder

## Empty States
- **All empty:** `ClipboardList` icon (48px) + "No requests yet" + "Requests will appear here when customers contact you"
- **Pending empty:** "No pending requests" + "You're all caught up!"
- **Accepted empty:** "No active jobs" + "Accept requests to see them here"
- **Completed empty:** "No completed jobs yet"

## Scroll Behavior
- Native smooth scrolling
- Tabs become sticky at top on scroll
- Pull-to-refresh supported
- ProviderBottomNav always visible

## Data
Mock customer requests where `providerId` matches logged-in provider. Each request:
`id`, `customerName`, `customerPhone`, `serviceCategory`, `issueDescription`, `location`, `latitude`, `longitude`, `photoUrl`, `status`, `urgency`, `createdAt`, `updatedAt`
