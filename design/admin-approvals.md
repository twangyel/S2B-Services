# Admin Pending Approvals Page

## Route
`/admin/approvals`

## Purpose
Dedicated page for reviewing new provider applications. This is a high-priority admin workflow — each pending provider must be reviewed, documents checked, and approved or rejected with a reason. Polished, efficient, mobile-first.

## Layout
```
┌──────────────────────────────────────────────────────┐
│  ☰  Pending Approvals                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 12 providers awaiting your review                ││
│  │ Review and approve to make them live             ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Sort: ┌──────────┐┌──────────┐┌──────────┐        │
│        │ Newest   ││ Category ││ Location │        │
│        └──────────┘└──────────┘└──────────┘        │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌────────┐  Sonam Welding Services               ││
│  │ │ 48px   │  🛠 Welder · 📍 Phuentsholing        ││
│  │ │ Avatar │  📞 1767XXXX                          ││
│  │ └────────┘  📅 Applied 2 days ago               ││
│  │             📄 2 documents uploaded               ││
│  │                                                   ││
│  │ ┌──────────────────────────────────────────────┐  ││
│  │ │ ⏳ Pending Review                             │  ││
│  │ └──────────────────────────────────────────────┘  ││
│  │                                                   ││
│  │ ┌──────────────┐ ┌──────────────┐               ││
│  │ │  👁 Review   │ │  ✅ Approve  │               ││
│  │ └──────────────┘ └──────────────┘               ││
│  │ ┌──────────────┐                                ││
│  │ │  ❌ Reject   │                                ││
│  │ └──────────────┘                                ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌────────┐  Tashi Cleaning Pro                   ││
│  │ │ 48px   │  🧹 Cleaning · 📍 Thimphu             ││
│  │ │ Avatar │  📞 1778XXXX                          ││
│  │ └────────┘  📅 Applied 5 hours ago              ││
│  │             📄 3 documents uploaded               ││
│  │                                                   ││
│  │ ┌──────────────────────────────────────────────┐  ││
│  │ │ ⏳ Pending Review                             │  ││
│  │ └──────────────────────────────────────────────┘  ││
│  │                                                   ││
│  │ ┌──────────────┐ ┌──────────────┐               ││
│  │ │  👁 Review   │ │  ✅ Approve  │               ││
│  │ └──────────────┘ └──────────────┘               ││
│  │ ┌──────────────┐                                ││
│  │ │  ❌ Reject   │                                ││
│  │ └──────────────┘                                ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [More pending cards...]                             │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Header
- Hamburger menu + "Pending Approvals" (h1)
- Badge count in title if > 0

### Section: Status Banner
- White card with `--warning-light` background
- Count: "12 providers awaiting your review" (h3)
- Subtext: "Review and approve to make them live" (body-sm)
- Auto-dismisses when count reaches 0

### Section: Sort/Filter Chips
- Horizontal scroll: "Newest", "Oldest", by category dropdown, by location dropdown
- Default: newest first

### Section: Pending Provider Cards
Each card is an **AdminActionCard**:

```
┌──────────────────────────────────────────────────────┐
│ ┌────────┐  Business Name                             │
│ │ 48px   │  🛠 Category · 📍 Location                │
│ │ Avatar │  📞 Phone                                  │
│ └────────┘  📅 Applied [relative time] ago            │
│             📄 [count] documents uploaded              │
│                                                       │
│ ┌──────────────────────────────────────────────────┐  │
│ │ ⏳ Pending Review                                 │  │
│ └──────────────────────────────────────────────────┘  │
│                                                       │
│ ┌──────────────┐ ┌──────────────┐                    │
│ │ 👁 Review    │ │ ✅ Approve   │                    │
│ └──────────────┘ └──────────────┘                    │
│ ┌──────────────┐                                     │
│ │ ❌ Reject    │                                     │
│ └──────────────┘                                     │
└──────────────────────────────────────────────────────┘
```

- White card, border-radius `md`, shadow `shadow-sm`
- Avatar: 48px
- Metadata: category icon + name, location, phone, application date, document count
- Status banner: full-width, `--warning-light`, "Pending Review" with clock icon
- Actions:
  - **Review** — opens detail bottom sheet
  - **Approve** — success solid, opens quick-approve dialog
  - **Reject** — destructive outline, opens reject reason dialog

### Section: Review Detail Bottom Sheet
Tapping "Review" opens a comprehensive bottom sheet:
- Provider profile (all fields)
- Document viewer: thumbnails of uploaded documents, tap to expand
- Photo gallery of work samples
- Pricing information
- Full action bar at bottom: Approve / Reject

### Section: Approve Dialog
- ConfirmDialog: "Approve this provider?"
- Shows: provider name, category, documents count
- Checkbox: "Mark as verified" (default checked)
- Checkbox: "Feature this provider" (default unchecked)
- Buttons: Cancel + "Approve Provider" (success solid)
- On confirm: status updates to approved, toast "Provider approved successfully"

### Section: Reject Dialog
- ConfirmDialog: "Reject Provider Application"
- Provider info summary
- **Required:** Rejection reason textarea with validation
- Radio options: "Incomplete documents" / "Invalid credentials" / "Other"
- Buttons: Cancel + "Reject Application" (destructive solid)
- On confirm: status updates to rejected, toast "Application rejected"

## Entrance Animations
1. Header: fade in (0s)
2. Status banner: slide down (0.1s)
3. Cards: stagger 0.08s, slide up 20px + fade (0.15s base)

## Loading State
- Skeleton: Status banner shimmer → 3 pending card skeletons

## Empty State
- `CheckCircle2` icon (48px, `--success`) + "All caught up!" + "No pending approvals. Providers will appear here when they apply."

## Scroll Behavior
- Native smooth scroll
- Pull-to-refresh

## Data
Providers filtered by `approvalStatus === 'pending'`, sorted by `applicationDate` desc.
