# Provider Profile Page — Customer App

## Route
`/provider/:id`

## Purpose
The most heavily polished screen in the app. This is where customers make the decision to contact a provider. It must feel like a premium provider marketplace profile — rich with trust signals, clear pricing, work samples, reviews, and prominent direct-contact CTAs. Not a plain information page.

## Layout
```
┌──────────────────────────────────────────────────────┐
│ ←                         [Share]  [Report]          │
├──────────────────────────────────────────────────────┤
│                                                      │
│           ┌──────────┐                               │
│           │          │                               │
│           │  100px   │  ⭐ 4.9                       │
│           │  Avatar  │  128 reviews                  │
│           │          │                               │
│           └──────────┘  Karma Electric Solutions     │
│              💚         ✅ Verified Provider           │
│                         ⭐ Featured Provider           │
│                                                      │
│  📍 Thimphu, Bhutan                                  │
│  🛠 Electrician · 8 years experience                 │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 💚 Available Now — Usually responds in 10 min   ││
│  │ 🚨 Emergency service available                  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────────┐   │
│  │   📞 Call  │ │  💬 Whats  │ │📍 Share Location│   │
│  └────────────┘ └────────────┘ └────────────────┘   │
│  ┌──────────────────────────────────────────────────┐│
│  │         📋 Send Service Request                  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [SCROLLABLE BELOW]                                  │
│                                                      │
│  💰 Service Charges                                  │
│  ┌──────────────────────────────────────────────────┐│
│  │ Visit Charge               Nu. 200              ││
│  │ Hourly Charge              Nu. 350/hr           ││
│  │ Emergency Charge           Nu. 500              ││
│  │ ─────────────────────────────────               ││
│  │ 💡 Material cost is extra if required           ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  🕐 Opening Hours                                    │
│  ┌──────────────────────────────────────────────────┐│
│  │ Monday - Saturday    8:00 AM - 6:00 PM          ││
│  │ Sunday               Emergency only             ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  🔧 Skills & Services                                │
│  ┌──────────────────────────────────────────────────┐│
│  │ [Wiring] [Installation] [Repair] [Maintenance]  ││
│  │ [Panel Work] [Troubleshooting] [LED Installation]││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  📸 Work Photos                                      │
│  ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐         │
│  │      ││      ││      ││      ││  +5  │         │
│  │Photo ││Photo ││Photo ││Photo ││ more │         │
│  └──────┘└──────┘└──────┘└──────┘└──────┘         │
│  [Horizontal scroll, tap to expand]                  │
│                                                      │
│  📄 Documents Verified                               │
│  ┌──────────────────────────────────────────────────┐│
│  │ ✅ Citizenship ID Verified                      ││
│  │ ✅ Trade Certificate Verified                   ││
│  │ ✅ Business License Verified                    ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ⭐ Reviews (128)                                     │
│  ┌──────────────────────────────────────────────────┐│
│  │ ⭐⭐⭐⭐⭐  5.0  Dorji T. · 2 days ago           ││
│  │ "Excellent work, very professional and prompt..."││
│  ├──────────────────────────────────────────────────┤│
│  │ ⭐⭐⭐⭐⭐  5.0  Pema D. · 1 week ago            ││
│  │ "Fixed our wiring issue quickly. Fair pricing." ││
│  ├──────────────────────────────────────────────────┤│
│  │ ⭐⭐⭐⭐☆  4.0  Sonam K. · 2 weeks ago           ││
│  │ "Good service but arrived a bit late."          ││
│  └──────────────────────────────────────────────────┘│
│  ["See all reviews" link]                            │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ⚠️ Report this Provider                          ││
│  │ If you had a bad experience, let us know.       ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [Padded bottom ~120px for sticky CTAs]              │
├──────────────────────────────────────────────────────┤
│ [Sticky Bottom CTA Bar]                              │
│ ┌────────────┐ ┌────────────┐ ┌────────────────┐    │
│ │  📞 Call   │ │  💬 WA     │ │📍 Share Location│    │
│ └────────────┘ └────────────┘ └────────────────┘    │
│ [Above BottomNav or standalone if nav hidden]       │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Profile Header
- Transparent/none background initially, fills with white on scroll past 100px
- Left: Back button (44px touch target)
- Right: Share button + Report button (icon-only, 44px)
- On scroll past 150px: header title changes to provider name (h3, truncated)

**Animation:** Header background fades in on scroll (opacity tied to scroll position).

### Section: Hero Profile Area
- Large centered avatar: 100px circle
- Availability dot: 14px, positioned bottom-right of avatar with ring
- Name: h1 (28px), bold, centered
- Badges row: Verified badge (blue), Featured badge (orange) — centered
- Category + experience: body, `--foreground-muted`, centered
- Location: body-sm, `MapPin` icon, `--foreground-muted`, centered

**Animation:** Avatar scales from 0.8→1 (0.3s spring), name fades in 0.1s delay, badges stagger 0.08s.

### Section: Status Banner
- Full-width card, border-radius `md`
- Background: `--success-light` if available, `--warning-light` if busy, `--error-light` if emergency-only
- Content:
  - Availability status with pulsing dot + response time estimate
  - Emergency availability line if applicable
- Dynamic based on `availabilityStatus`

### Section: Primary CTA Buttons
- 3 equal-width buttons in a row:
  1. **Call Now** — `--primary` solid, `Phone` icon, white text
  2. **WhatsApp** — green-tinged (#25D366 background tint), `MessageCircle` icon
  3. **Share Location** — `--secondary` solid, `MapPin` icon, white text
- Below: Full-width **Send Service Request** button — `--primary` outline, `ClipboardList` icon
- All buttons: 48px height, border-radius `sm`
- Tapping Call/WhatsApp/Share Location opens Contact Bottom Sheet
- Tapping Send Request opens Request Bottom Sheet

**Sticky behavior:** This button row becomes sticky at bottom (bottom: 0, above safe area) when user scrolls past it. Background: white with top shadow.

### Section: Service Charges
- Section header: "Service Charges" (h2) with `DollarSign` icon
- White card, border-radius `md`
- Row layout: Label left, amount right (bold)
- Rows: Visit Charge, Hourly Charge, Emergency Charge
- Divider line between rows
- Footer note: `Info` icon + "Material cost is extra if required" (body-sm, `--foreground-muted`)
- Prices in Nu. (Bhutanese Ngultrum)

### Section: Opening Hours
- Section header: "Opening Hours" (h2) with `Clock` icon
- White card, border-radius `md`
- Rows: Day range + hours, or "Emergency only" / "Closed"
- Current day highlighted with `--primary-light` background

### Section: Skills & Services
- Section header: "Skills & Services" (h2) with `Wrench` icon
- Horizontal wrapping row of pill badges
- Each badge: `--primary-light` background, `--primary` text, caption size
- Wraps to multiple lines as needed

### Section: Work Photos
- Section header: "Work Photos" (h2) with `Camera` icon + count
- Horizontal scroll gallery
- Each photo: 120px × 120px, border-radius `sm`, object-fit: cover
- Last item: "+X more" overlay if more than 5 photos
- Tap: Opens lightbox modal with full-screen image viewer
- Swipeable in lightbox

### Section: Documents Verified
- Section header: "Documents Verified" (h2) with `ShieldCheck` icon
- White card, border-radius `md`
- List with checkmarks for each verified document
- Green checkmark icons for verified items
- Gray text for unverified items

### Section: Reviews
- Section header: "Reviews" (h2) with `Star` icon + count in parentheses
- Average rating large display: "4.9" (h1) + star icon + "128 reviews"
- Rating distribution bar chart: 5 stars → 1 star with horizontal bars
- Review cards (3 shown, expandable):
  - Stars row (20px stars)
  - Reviewer name + date
  - Review text (clamp to 3 lines)
  - Service category tag
- "See all reviews" link at bottom

### Section: Report Provider
- Dismissive-style row at bottom
- `AlertTriangle` icon + "Report this Provider" text
- Body-sm description
- Tapping opens report dialog with reason selection

## Entrance Animations
1. Profile header: fade in (0s)
2. Avatar: scale 0.8→1, spring (0.1s delay)
3. Name + badges: stagger fade in (0.2s)
4. Status banner: slide up 20px, fade (0.3s)
5. CTA buttons: stagger in from bottom (0.35s, 0.05s stagger)
6. Content sections: fade in on scroll-trigger, 0.2s each

## Loading State
- Skeleton: Circular avatar shimmer → title shimmer → badge placeholders → status banner skeleton → 4 section skeletons with header + 3 content lines each
- CTA buttons: 4 skeleton button rectangles

## Scroll Behavior
- Native smooth scroll
- Header gains white background + shadow on scroll past 100px
- CTA buttons become sticky at bottom after scrolling past them
- Back button always visible in header
- No BottomNav on this page

## Bottom Sheets Triggered
- **Contact Bottom Sheet** (see `contact-sheet.md`) — on Call/WhatsApp/Share Location
- **Request Bottom Sheet** — on Send Service Request, simplified form
- **Photo Lightbox** — on work photo tap, full-screen swipeable gallery
- **Report Dialog** — on Report tap, centered modal with reason options

## Data
Single provider object from mock data. Key fields:
`id`, `name`, `businessName`, `photo`, `categoryId`, `rating`, `reviewCount`, `isVerified`, `isFeatured`, `availabilityStatus`, `location`, `serviceAreas`, `experienceYears`, `skills[]`, `visitCharge`, `hourlyCharge`, `fixedCharge`, `emergencyCharge`, `materialCostNote`, `openingHours`, `emergencyAvailable`, `phone`, `whatsapp`, `workPhotos[]`, `documentsVerified[]`, `subscriptionStatus`
