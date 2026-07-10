# Requests Page — Customer App

## Route
`/requests`

## Purpose
Shows the customer's service request history. Since no login is required, customers look up requests by phone number. Also shows locally stored recent requests from the current session.

## Layout
```
┌──────────────────────────────────────────────────────┐
│  My Requests                                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 📞 Enter your phone number to view requests     ││
│  │ ┌──────────────────────────────────────────────┐││
│  │ │ 17XX XXXX                                    │││
│  │ └──────────────────────────────────────────────┘││
│  │ [View My Requests]                               ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Recent Requests                                     │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🛠 Electrician                                   ││
│  │ Karma Electric Solutions                         ││
│  │ ┌──────────────────────────────────────────────┐││
│  │ │ ✅ Completed                                  │││
│  │ └──────────────────────────────────────────────┘││
│  │ 📍 Thimphu · 📅 2 days ago                      ││
│  │ Issue: Wiring repair in living room             ││
│  ├──────────────────────────────────────────────────┤│
│  │ [📞 Call] [💬 WA] [⭐ Rate]                      ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🚿 Plumber                                       ││
│  │ Dorji Plumbing                                   ││
│  │ ┌──────────────────────────────────────────────┐││
│  │ │ 🟠 In Progress                                │││
│  │ └──────────────────────────────────────────────┘││
│  │ 📍 Thimphu · 📅 Today, 10:30 AM                 ││
│  │ Issue: Kitchen sink leakage                     ││
│  ├──────────────────────────────────────────────────┤│
│  │ [📞 Call] [💬 WA]                                ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🌐 Internet/WiFi                                 ││
│  │ TechNet Bhutan                                   ││
│  │ ┌──────────────────────────────────────────────┐││
│  │ │ 🔵 Sent                                       │││
│  │ └──────────────────────────────────────────────┘││
│  │ 📍 Thimphu · 📅 Today, 9:00 AM                  ││
│  │ Issue: WiFi not working                         ││
│  ├──────────────────────────────────────────────────┤│
│  │ [📞 Call] [💬 WA] [❌ Cancel]                    ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [Padded bottom for BottomNav]                       │
├──────────────────────────────────────────────────────┤
│ [BottomNav: Home | Services | Requests | Account]   │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Page Header
- Sticky top, white background
- Title: "My Requests" (h1)
- Safe-area-inset-top padding

### Section: Phone Number Lookup
- White card, border-radius `md`, shadow `shadow-sm`
- Prompt text: "Enter your phone number to view your requests" (body, `--foreground-muted`)
- Phone input: FormField, `tel` type, placeholder "17XX XXXX"
- Button: "View My Requests" — primary, full-width, 48px height
- On submit: filters mock requests by phone number, displays results
- Validation: Bhutan phone format

**Animation:** Fade in on page load.

### Section: Request Cards
Each request is a full-width card:

```
┌──────────────────────────────────────────────────────┐
│ Category Icon + Name                                 │
│ Provider Business Name                               │
│ ┌──────────────────────────────────────────────────┐ │
│ │ [StatusBadge]                                    │ │
│ └──────────────────────────────────────────────────┘ │
│ 📍 Location · 📅 Relative time                      │
│ Issue: Description text...                           │
│ ┌──────────────┬──────────────┬──────────────┐      │
│ │    📞 Call   │   💬 WhatsApp │  [Action]   │      │
│ └──────────────┴──────────────┴──────────────┘      │
└──────────────────────────────────────────────────────┘
```

**Card details:**
- White background, border-radius `md`, shadow `shadow-sm`
- Top: Category icon (24px) + category name (h4), provider name (body, bold)
- Status badge: prominent, full-width colored banner inside card
- Metadata: `MapPin` + location, `Clock` + relative time
- Issue: body-sm, `--foreground-muted`, max 2 lines
- Action buttons row (3 equal columns):
  - **Call** — `Phone` icon, primary outline, 40px height
  - **WhatsApp** — `MessageCircle` icon, secondary outline, 40px height
  - **Contextual action** based on status:
    - `sent` → "Cancel" (destructive outline)
    - `provider-accepted` → "View Details"
    - `in-progress` → "View Details"
    - `completed` → "Rate" (`Star` icon, warning outline)
    - `cancelled` → "Resend"

**Status badges used:**
- `draft` — gray
- `sent` — blue "Sent"
- `provider-accepted` — green "Accepted"
- `provider-rejected` — red "Rejected"
- `in-progress` — blue "In Progress"
- `completed` — green "Completed"
- `cancelled` — red "Cancelled"

### Section: Rate/Review Modal
Triggered from completed request "Rate" button:
- Bottom sheet or centered modal
- Star rating: 5 stars, 40px each, tap to select 1-5
- Review text: textarea, "Share your experience...", max 300 chars
- Submit button: primary, full-width
- Success toast: "Thank you for your feedback!"

## Loading State
- Skeleton: Phone lookup card shimmer → 3 request card skeletons with status badge placeholder, text lines, and button placeholders

## Empty States
- **No phone entered yet:** Show illustration + "Enter your phone number above to see your requests"
- **No requests found:** `ClipboardList` icon (48px) + "No requests found" + "Your service requests will appear here"
- **All cancelled:** Same as empty but with "All your requests were cancelled" message

## Entrance Animations
1. Header: fade in (0s)
2. Phone lookup card: slide up 20px + fade (0.1s)
3. Request cards: stagger in, 0.08s per card, slide up 16px + fade (0.2s delay)

## Scroll Behavior
- Native smooth scrolling
- Phone lookup card stays visible (not sticky)
- BottomNav always visible
- Pull-to-refresh supported

## Data
Mock customer requests filtered by phone number. Each request has:
`id`, `customerName`, `customerPhone`, `serviceCategory`, `providerId`, `providerName`, `providerPhone`, `status`, `issueDescription`, `location`, `createdAt`, `updatedAt`, `photoUrl`, `rating`, `review`
