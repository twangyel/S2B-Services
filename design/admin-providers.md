# Admin Providers Management Page

## Route
`/admin/providers`

## Purpose
Full CRUD for provider management. Admin can view all providers, search, filter by status, edit profiles, suspend/reactivate, verify/unverify, feature/unfeature. Mobile-first with card-based layout — no horizontal scrolling tables.

## Layout
```
┌──────────────────────────────────────────────────────┐
│  ☰  Providers                              +        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🔍 Search providers...                           ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌────────┐┌──────────┐┌──────────┐┌──────────┐    │
│  │  All   │ │Active  │ │Pending │ │Suspended│    │
│  │ [248]  │ │[186]   │ │ [12]   │ │ [8]    │    │
│  └────────┘└──────────┘└──────────┘└──────────┘    │
│                                                      │
│  ┌────────┐┌──────────┐┌──────────┐                │
│  │Verified│ │Featured │ │Expired │                 │
│  │ [156]  │ │ [24]    │ │ [15]   │                 │
│  └────────┘└──────────┘└──────────┘                │
│  [Filter chips - horizontal scroll]                   │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌────────┐  Karma Electric Solutions             ││
│  │ │ 48px   │  ⭐ 4.9 · 128 reviews · Electrician  ││
│  │ │ Avatar │  ✅ Verified · 💳 Pro (till Dec 31)   ││
│  │ └────────┘  💚 Available · 📍 Thimphu            ││
│  │                                                   ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐         ││
│  │  │  👁 View │ │ ⏸ Suspend│ │ ⭐ Feature│         ││
│  │  └──────────┘ └──────────┘ └──────────┘         ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐         ││
│  │  │✏️ Edit   │ │ 📄 Docs  │ │ 💰 Subscr │         ││
│  │  └──────────┘ └──────────┘ └──────────┘         ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌────────┐  Sonam Welding Services               ││
│  │ │ 48px   │  ⭐ 4.2 · 18 reviews · Welder         ││
│  │ │ Avatar │  ⏳ Pending Approval                  ││
│  │ └────────┘  ⚫ Offline · 📍 Phuentsholing        ││
│  │                                                   ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐         ││
│  │  │  👁 View │ │ ✅ Approve│ │ ❌ Reject │         ││
│  │  └──────────┘ └──────────┘ └──────────┘         ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [More provider cards...]                            │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │              + Add New Provider                  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Header
- Hamburger menu + "Providers" (h1) + Add (+) button
- Add button opens provider creation form (modal on mobile, side panel on desktop)

### Section: Search
- Full-width pill search input
- Searches by name, business name, phone, category
- Debounced search (300ms)

### Section: Filter Chips
- Horizontal scrollable row:
  - **All [count]** — All providers
  - **Active [count]** — `subscriptionStatus === 'active'`
  - **Pending [count]** — `approvalStatus === 'pending'`
  - **Suspended [count]** — `status === 'suspended'`
  - **Verified [count]** — `isVerified === true`
  - **Featured [count]** — `isFeatured === true`
  - **Expired [count]** — `subscriptionStatus === 'expired'`
- Count badges: small pill with count

### Section: Provider Admin Cards
Each provider displayed as an **AdminActionCard** (not a table row):

```
┌──────────────────────────────────────────────────────┐
│ ┌────────┐  Business Name                    [More] │
│ │ 48px   │  ⭐ 4.9 · 24 reviews · Category        │
│ │ Avatar │  [StatusBadge] [SubscriptionBadge]      │
│ └────────┘  [AvailabilityBadge] · 📍 Location       │
│                                                      │
│ ┌────────┬────────┬────────┐                        │
│ │ View   │Suspend │Feature │                        │
│ └────────┴────────┴────────┘                        │
│ ┌────────┬────────┬────────┐                        │
│ │ Edit   │ Docs   │ Subscr │                        │
│ └────────┴────────┴────────┘                        │
└──────────────────────────────────────────────────────┘
```

- White card, border-radius `md`, shadow `shadow-sm`
- Avatar: 48px circle
- Name + metadata row
- Badges: StatusBadge + SubscriptionBadge inline
- Availability + location
- Quick action buttons: 3×2 grid of small buttons (36px height, icon + label)
  - **View** — opens provider detail bottom sheet
  - **Suspend/Reactivate** — toggles status with confirm dialog
  - **Feature/Unfeature** — toggles featured status
  - **Edit** — opens edit form modal
  - **Docs** — opens document viewer
  - **Subscription** — opens subscription management

### Section: Add Provider Button
- Floating or bottom-fixed button
- Opens provider creation form

### Section: Provider Detail Bottom Sheet
Tapping "View" opens a bottom sheet with:
- Full provider profile (read-only)
- All badges and status indicators
- Document thumbnails
- Full action bar: Edit, Suspend, Verify, Feature, Delete

### Section: Suspend Confirm Dialog
- Title: "Suspend Provider?"
- Reason input: textarea, required
- Options: "Temporary" / "Permanent" radio
- Buttons: Cancel (ghost) + Suspend (destructive)

### Section: Edit Provider Modal
- Bottom sheet on mobile, side modal on desktop
- Form sections matching provider registration
- Pre-filled with existing data
- Save button at bottom

## Entrance Animations
1. Header: fade in (0s)
2. Search + filters: slide down (0.05s)
3. Cards: stagger 0.06s, slide up 16px + fade (0.1s base)

## Loading State
- Skeleton: Search shimmer → filter chips skeleton → 4 provider card skeletons

## Empty States
- **No providers:** `Users` icon + "No providers registered yet"
- **Filter empty:** "No providers match this filter" + "Clear filters" button
- **Search empty:** "No providers found" + "Try different search terms"

## Scroll Behavior
- Native smooth scroll
- Search bar becomes sticky on scroll
- Pull-to-refresh supported

## Data
Full providers mock array with admin-specific filters. CRUD operations update localStorage.
