# Admin Category Management Page

## Route
`/admin/categories`

## Purpose
Full CRUD for service categories. Admin can add, edit, reorder, activate/deactivate, set emergency flag, and configure certificate requirements for each category. Clean, efficient form interface.

## Layout
```
┌──────────────────────────────────────────────────────┐
│  ☰  Categories                             +        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 28 categories · 24 active · 4 inactive           ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌────────┐┌──────────┐                             │
│  │ Active │ │Inactive │                             │
│  └────────┘└──────────┘                             │
│  [Filter tabs]                                        │
│                                                      │
│  Drag to reorder ↕️                                    │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌──────┐  Electrician                           ││
│  │ │ 36px │  ⚡ Emergency · 🏷️ Popular              ││
│  │ │ Icon │  👤 24 providers · 💰 From Nu. 150     ││
│  │ └──────┘  📄 Certificate required                ││
│  │         ┌────────┐┌────────┐┌────────┐           ││
│  │         │  Edit  ││Deactiv.││ Delete │           ││
│  │         └────────┘└────────┘└────────┘           ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌──────┐  Plumber                                ││
│  │ │ 36px │  ⚡ Emergency · 👤 18 providers         ││
│  │ │ Icon │  💰 From Nu. 150                        ││
│  │ └──────┘  📄 Certificate required                ││
│  │         ┌────────┐┌────────┐┌────────┐           ││
│  │         │  Edit  ││Deactiv.││ Delete │           ││
│  │         └────────┘└────────┘└────────┘           ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌──────┐  Event Setup / Tent Service             ││
│  │ │ 36px │  👤 2 providers · 💰 From Nu. 500       ││
│  │ │ Icon │                                         ││
│  │ └──────┘                                         ││
│  │         ┌────────┐┌────────┐┌────────┐           ││
│  │         │  Edit  ││Deactiv.││ Delete │           ││
│  │         └────────┘└────────┘└────────┘           ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [More category cards...]                            │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │              + Add New Category                  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Header
- Hamburger + "Categories" (h1) + Add (+) button
- Add opens category creation form

### Section: Stats Bar
- Compact row: "28 categories · 24 active · 4 inactive" (body-sm, `--foreground-muted`)

### Section: Filter Tabs
- **Active** / **Inactive** toggle tabs
- Count in each tab

### Section: Category Cards
Each category is a management card:

```
┌──────────────────────────────────────────────────────┐
│ ┌────────┐  Category Name                            │
│ │ 36px   │  [Emergency badge] [Popular badge]        │
│ │ Icon   │  👤 provider count · 💰 starting price    │
│ └────────┘  📄 Certificate: Required/Not Required     │
│                                                       │
│ ┌────────┬────────┬────────┐                          │
│ │  Edit  │Deactiv.│ Delete │                          │
│ └────────┴────────┴────────┘                          │
└──────────────────────────────────────────────────────┘
```

- White card, border-radius `md`
- Icon: 36px, `--primary-light` bg
- Badges: Emergency (red), Popular (orange) — inline
- Metadata: provider count, price range, certificate requirement
- Action buttons (small, 32px height):
  - **Edit** — primary outline, opens edit form
  - **Deactivate/Activate** — warning/destructive outline
  - **Delete** — destructive outline, confirm dialog

### Section: Add/Edit Category Form
Bottom sheet on mobile, modal on desktop:
- **Name** — text input, required
- **Description** — textarea, required
- **Icon** — Select from Lucide icons list (searchable dropdown)
- **Starting Price** — number input, Nu. prefix
- **Emergency Enabled** — Switch
- **Popular** — Switch
- **Certificate Required** — Switch
- **Display Order** — number input
- **Active** — Switch (for edit)
- Save button: full-width primary

### Section: Delete Confirm
- ConfirmDialog: "Delete [Category Name]?"
- Warning: "This will hide the category from customers. [X] providers are currently using this category."
- Checkbox: "I understand, delete this category"
- Buttons: Cancel + "Delete" (destructive, disabled until checkbox checked)

### Section: Reorder
- Long-press or drag handle on each card to reorder
- Visual feedback during drag: card lifts with shadow, placeholder gap
- Order saved to localStorage

## Entrance Animations
1. Header: fade in (0s)
2. Stats + tabs: slide down (0.05s)
3. Cards: stagger 0.04s, slide up 12px + fade (0.1s base)

## Loading State
- Skeleton: Stats shimmer → 5 category card skeletons

## Empty States
- Active empty: "No active categories" + "Add a category or reactivate inactive ones"
- Inactive empty: "No inactive categories"

## Data
Service categories mock array. Full CRUD on localStorage.
