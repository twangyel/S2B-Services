# Admin Reviews & Complaints Page

## Route
`/admin/reviews`

## Purpose
Admin monitors customer reviews and handles complaints. Can hide inappropriate reviews, view complaint details, and take action against providers (warn/suspend). Protects platform integrity.

## Layout
```
┌──────────────────────────────────────────────────────┐
│  ☰  Reviews & Complaints                           │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐┌──────────────────────────────┐   │
│  │  ⭐ Reviews  ││  ⚠️ Complaints  [3]         │   │
│  └──────────────┘└──────────────────────────────┘   │
│  [Tab switcher]                                       │
│                                                      │
│  === REVIEWS TAB ===                                 │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🔍 Search reviews...                             ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌────────┐┌──────────┐┌──────────┐                │
│  │  All   │ │Visible  │ │ Hidden  │                │
│  │ [245]  │ │[240]    │ │ [5]     │                │
│  └────────┘└──────────┘└──────────┘                │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ⭐⭐⭐⭐⭐  5.0                                  ││
│  │ Dorji T. · Karma Electric Solutions             ││
│  │ "Excellent service, very professional and        ││
│  │  prompt. Fixed our wiring perfectly."            ││
│  │ 📅 2 days ago                                    ││
│  │                                                   ││
│  │ ┌──────────────┐ ┌──────────────┐               ││
│  │ │ 👁 View     │ │ 🙈 Hide      │               ││
│  │ └──────────────┘ └──────────────┘               ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ⭐⭐⭐⭐☆  4.0                                   ││
│  │ Pema D. · Dorji Plumbing                        ││
│  │ "Good work but arrived 30 minutes late.          ││
│  │  Quality was fine."                              ││
│  │ 📅 1 week ago                                    ││
│  │                                                   ││
│  │ ┌──────────────┐ ┌──────────────┐               ││
│  │ │ 👁 View     │ │ 🙈 Hide      │               ││
│  │ └──────────────┘ └──────────────┘               ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  === COMPLAINTS TAB ===                              │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌──────────────────────────────────────────────┐  ││
│  │ │ 🚨 Urgent — Provider No-Show                │  ││
│  │ └──────────────────────────────────────────────┘  ││
│  │                                                   ││
│  │ Complaint from: Sonam K.                         ││
│  │ Against: Karma Electric Solutions                ││
│  │ Service: Electrician — Scheduled repair          ││
│  │                                                   ││
│  │ "I booked an appointment for 10 AM but the       ││
│  │  provider never showed up and didn't call."      ││
│  │                                                   ││
│  │ 📅 Filed 1 day ago                               ││
│  │                                                   ││
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────┐  ││
│  │ │  👁 View    │ │ ⚠️ Warn     │ │ ⏸ Suspend│  ││
│  │ └──────────────┘ └──────────────┘ └──────────┘  ││
│  │ ┌──────────────┐                                 ││
│  │ │  ✅ Resolve  │                                 ││
│  │ └──────────────┘                                 ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌──────────────────────────────────────────────┐  ││
│  │ │ 🟠 Quality Issue — Overcharging             │  ││
│  │ └──────────────────────────────────────────────┘  ││
│  │                                                   ││
│  │ Complaint from: Tshering D.                      ││
│  │ Against: Quick Fix Mobile Repair                 ││
│  │ Service: Mobile Repair — Screen replacement      ││
│  │                                                   ││
│  │ "Charged Nu. 4500 but market rate is Nu. 2500.   ││
│  │  Screen quality is also poor."                   ││
│  │                                                   ││
│  │ 📅 Filed 3 days ago                              ││
│  │                                                   ││
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────┐  ││
│  │ │  👁 View    │ │ ⚠️ Warn     │ │ ⏸ Suspend│  ││
│  │ └──────────────┘ └──────────────┘ └──────────┘  ││
│  │ ┌──────────────┐                                 ││
│  │ │  ✅ Resolve  │                                 ││
│  │ └──────────────┐                                 ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Header
- Hamburger + "Reviews & Complaints" (h1)

### Section: Main Tabs
- **⭐ Reviews** / **⚠️ Complaints [count]**
- Large tab buttons, active has bottom border
- Complaints tab shows badge count if > 0

### Reviews Tab

#### Search Bar
- Full-width pill search
- Searches by reviewer name, provider name, review text

#### Filter Chips
- **All [count]** / **Visible [count]** / **Hidden [count]**

#### Review Cards
```
┌──────────────────────────────────────────────────────┐
│ ⭐⭐⭐⭐⭐  Rating                                    │
│ Reviewer Name · Provider Business Name              │
│ "Review text content..."                             │
│ 📅 Relative time                                     │
│                                                       │
│ ┌──────────────┐ ┌──────────────┐                   │
│ │ 👁 View     │ │ 🙈 Hide      │                   │
│ └──────────────┘ └──────────────┘                   │
└──────────────────────────────────────────────────────┘
```

- White card, border-radius `md`
- Star rating: 20px stars, filled `--warning`, empty `--foreground-subtle`
- Reviewer + provider names
- Review text: body, max 4 lines with "Read more" expand
- Date: body-sm
- Actions: View (opens full review), Hide/Unhide (toggles visibility)

**Hide Review Flow:**
1. Tap "Hide"
2. ConfirmDialog: "Hide this review?" + "The review will no longer be visible to customers." + Optional reason input
3. On confirm: status → hidden, toast "Review hidden", card updates

### Complaints Tab

#### Complaint Cards
```
┌──────────────────────────────────────────────────────┐
│ ┌──────────────────────────────────────────────────┐  │
│ │ [UrgencyBadge] — Complaint Category             │  │
│ └──────────────────────────────────────────────────┘  │
│                                                       │
│ Complaint from: [Customer Name]                      │
│ Against: [Provider Business Name]                    │
│ Service: [Category] — [Service description]          │
│                                                       │
│ "Complaint description..."                           │
│                                                       │
│ 📅 Filed [relative time] ago                         │
│                                                       │
│ ┌──────────────┬──────────────┬──────────┐           │
│ │ 👁 View     │ ⚠️ Warn     │ ⏸ Suspend│           │
│ └──────────────┴──────────────┴──────────┘           │
│ ┌──────────────┐                                      │
│ │ ✅ Resolve   │                                      │
│ └──────────────┘                                      │
└──────────────────────────────────────────────────────┘
```

- White card, border-radius `md`, shadow `shadow-md`
- Urgency badges:
  - **Urgent** (`AlertTriangle`, red) — Provider no-show, safety issue
  - **Quality Issue** (`AlertCircle`, orange) — Poor service, overcharging
  - **General** (`MessageCircle`, blue) — Communication, delay
- Full complaint details
- Actions:
  - **View** — opens detail bottom sheet with full conversation/context
  - **Warn** — sends warning notification to provider
  - **Suspend** — opens suspend dialog with reason
  - **Resolve** — marks complaint as resolved

**Warn Provider Flow:**
1. Tap "Warn"
2. Bottom sheet: warning message textarea (pre-filled template)
3. Send button → toast "Warning sent to provider"

**Suspend Provider Flow:**
1. Tap "Suspend"
2. ConfirmDialog: "Suspend [Provider Name]?" + reason textarea + duration select (1 day / 7 days / 30 days / permanent)
3. Confirm → provider status updates to suspended → toast "Provider suspended for [duration]"

**Resolve Flow:**
1. Tap "Resolve"
2. Bottom sheet: resolution notes textarea + resolution type (Issue fixed / Refund provided / Warning issued / Other)
3. Confirm → complaint marked resolved → toast "Complaint resolved"

## Entrance Animations
1. Header: fade in (0s)
2. Main tabs: slide in (0.05s)
3. Review/complaint cards: stagger 0.06s, slide up 16px + fade (0.1s base)

## Loading State
- Skeleton: Tabs shimmer → 3 card skeletons per tab

## Empty States
- Reviews empty: "No reviews yet"
- Hidden reviews empty: "No hidden reviews"
- Complaints empty: `CheckCircle2` + "No complaints!" + "Great — customers are happy."
- Complaints resolved all: "All complaints resolved"

## Data
Reviews mock array + complaints mock array. Each complaint:
`id`, `customerName`, `providerId`, `providerName`, `serviceCategory`, `issueDescription`, `urgency` ('urgent'|'quality'|'general'), `status` ('open'|'resolved'), `filedAt`, `resolvedAt`, `resolutionNotes`
