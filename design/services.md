# Services Page — Customer App

## Route
`/services`

## Purpose
A comprehensive, browsable directory of all 28 service categories. Customers can scroll, search, and tap any category to see available providers. This is the primary browsing experience.

## Layout
```
┌──────────────────────────────────────────────────────┐
│ ← Services                                🔍         │
├──────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐│
│  │ 🔍 Search services...                            ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🚨 Emergency Services Only [toggle]              ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  🔥 Popular Services                                 │
│  ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐ │
│  │ Elec ││Plumb ││Inter ││Mobile││AC/Fr ││Carp  │ │
│  │ tric ││ er   ││ net  ││ Repair││ idge ││ enter│ │
│  │ ian  ││      ││      ││      ││Repair││      │ │
│  └──────┘└──────┘└──────┘└──────┘└──────┘└──────┘ │
│                                                      │
│  🏠 Home Services                                    │
│  ┌──────────────────────────────────────────────────┐│
│  │ ⚡ Electrician                                   ││
│  │    Wiring, repair, installation        Nu.150+  ││
│  │    👤 24 providers   🚨 Emergency available     ││
│  ├──────────────────────────────────────────────────┤│
│  │ 🚿 Plumber                                       ││
│  │    Leak repair, pipe fitting, installation      ││
│  │    👤 18 providers   🚨 Emergency available     ││
│  ├──────────────────────────────────────────────────┤│
│  │ 🌐 Internet/WiFi Technician                      ││
│  │    Installation, troubleshooting, setup         ││
│  │    👤 12 providers                              ││
│  ├──────────────────────────────────────────────────┤│
│  │ 🧹 Cleaning Service                              ││
│  │    Home, office, deep cleaning                  ││
│  │    👤 15 providers                              ││
│  ├──────────────────────────────────────────────────┤│
│  │ 🚚 House Shifting                                ││
│  │    Packing, transport, unpacking                ││
│  │    👤 8 providers                               ││
│  ├──────────────────────────────────────────────────┤│
│  │ 🎨 Painting Service                              ││
│  │    Interior, exterior, decorative               ││
│  │    👤 10 providers                              ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  🔧 Repairs & Technical                              │
│  [Category list same pattern...]                     │
│                                                      │
│  🚗 Vehicle Services                                 │
│  [Category list same pattern...]                     │
│                                                      │
│  [More groups...]                                    │
│                                                      │
│  [Padded bottom for BottomNav]                       │
├──────────────────────────────────────────────────────┤
│ [BottomNav: Home | Services | Requests | Account]   │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Page Header
- Sticky top, white background
- Left: Page title "Services" (h1)
- Right: Search icon button (toggles search input focus)
- Safe-area-inset-top padding

**Animation:** Fade in on page enter, 0.2s.

### Section: Search Bar
- Full-width, pill-shaped, `--muted` background
- Placeholder: "Search services..."
- Real-time filtering: as user types, category list filters instantly
- Shows "X results found" text when filtering
- Empty search state: "No services match your search" with magnifying glass icon

**Animation:** Already visible on page load. Filtering triggers list items to animate out/in with 0.15s fade.

### Section: Emergency Toggle
- Full-width card with `--error-light` background
- Row: `Zap` icon (20px, `--error`) + "Emergency Services Only" label + Switch toggle (right-aligned)
- When toggled ON: only categories with `emergencyEnabled: true` are shown, filtered list animates
- Categories with emergency: Electrician, Plumber, Vehicle Mechanic, Towing, AC/Fridge Repair, Internet/WiFi, Gas Cylinder, Mobile Repair, TV Repair, Washing Machine Repair

**Animation:** Toggle slides with spring. List re-filters with fade transition (0.2s).

### Section: Popular Services Quick Grid
- Horizontal scrolling row of the 10 MVP-highlight categories
- Compact icon-only cards: 72px × 80px
- Icon: 40px in `--primary-light` circle
- Label: 2 lines max, caption size, centered
- Categories: Electrician, Plumber, Internet/WiFi, Mobile/Computer Repair, AC/Fridge/Washing Machine Repair, Carpenter, House Shifting, Cleaning, Vehicle Mechanic/Towing, Gas Cylinder Delivery
- Each has a small orange dot if `isPopular: true`

**Animation:** Stagger in 0.04s per item on page load.

### Section: Category Groups (Expandable)
Categories are grouped by type with section headers:

**Groups:**
1. **🏠 Home Services** — Electrician, Plumber, Cleaning, Painting, House Shifting, Gardening, Interior Decoration, Laundry, Pest Control
2. **🔧 Repairs & Technical** — AC/Fridge Repair, Washing Machine Repair, TV Repair, Mobile/Computer Repair, Appliance Installation, CCTV Installation, Solar Panel Technician
3. **🚗 Vehicle Services** — Vehicle Mechanic, Towing Service, Driver on Call
4. **🚚 Delivery & Transport** — Gas Cylinder Delivery, Water Tanker Delivery
5. **🏗️ Construction & Manual** — Carpenter, Welder, Mason/Construction Repair
6. **🛡️ Safety & Care** — Security Guard Service, Home Nursing/Caregiver
7. **🎉 Events & Setup** — Event Setup/Tent Service

### Section: Category List Item
Each category card in the grouped list:
```
┌──────────────────────────────────────────────────────┐
│ ┌────────┐  Category Name                  [Chevron] │
│ │  Icon  │  Short description line 1              │
│ │ 48px   │  👤 24 providers  💰 From Nu. 150     │
│ └────────┘  🚨 Emergency available                 │
└──────────────────────────────────────────────────────┘
```
- Full-width card, white background, border-radius `md`
- Padding: 16px
- Left: 48px icon container, `--primary-light` background, `--primary` icon
- Right: Title (h3), description (body-sm, `--foreground-muted`), metadata row
- Chevron-right icon on far right
- Divider between items: 1px `--border`
- Emergency badge appears inline if `emergencyEnabled`

**Tap behavior:** Navigate to `/providers/:categoryId` with slide-in animation from right.

**Animation:** List items stagger in on scroll, 0.03s per item, slide up 15px + fade.

## Loading State
- Skeleton: Search bar shimmer → 6 skeleton category items with icon placeholder, title lines, and metadata lines
- Pulse animation on each skeleton item

## Empty States
- **Search no results:** `Search` icon (48px, `--foreground-subtle`) + "No services found" + "Try a different search term"
- **Emergency filter empty:** `Zap` icon + "No emergency services in this category" + "Browse all services instead"

## Scroll Behavior
- Native scroll with smooth behavior
- Group headers become slightly sticky (position: sticky, top: 56px) as you scroll through groups
- Search bar remains sticky at top
- BottomNav always visible

## Data
28 service categories from mock data, grouped by type. Each category has:
- `id`, `name`, `description`, `icon` (Lucide icon name), `providerCount`, `startingPrice`, `emergencyEnabled`, `isPopular`, `certificateRequired`, `displayOrder`, `isActive`
