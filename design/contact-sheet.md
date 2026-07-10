# Contact Bottom Sheet — Customer Flow

## Trigger
Opened as a **BottomSheet** when customer taps **Call Now**, **WhatsApp**, or **Share Location** on a provider profile or provider card.

## Purpose
Captures customer lead information before directing them to contact the provider. Creates a "lead record" concept even with mock data. No forced registration — just gather context for the provider.

## Layout
```
┌──────────────────────────────────────────────────────┐
│            ┌────────┐                                │
│            │ Handle │                                │
│            └────────┘                                │
│  Contact Provider                                    │
│  Karma Electric Solutions                            │
│  ⭐ 4.9 · 💚 Available · Electrician                │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 👤 Your Name                                     ││
│  │                                                  ││
│  └──────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────┐│
│  │ 📞 Phone Number                                  ││
│  │                                                  ││
│  └──────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────┐│
│  │ 📝 Describe your issue...                        ││
│  │                                                  ││
│  │                                                  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  📍 Your Location                                    │
│  ┌──────────────────────────────────────────────────┐│
│  │ 📍 Use My Current Location                       ││
│  └──────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────┐│
│  │ 🗺️ Select Location on Map                        ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  📎 Attach Photo (Optional)                          │
│  ┌──────────────────────────────────────────────────┐│
│  │         📷 Tap to upload a photo                 ││
│  │         of the issue (optional)                  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │         📞 Call Now                              ││
│  └──────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────┐│
│  │         💬 WhatsApp                              ││
│  └──────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────┐│
│  │         📍 Share My Location                     ││
│  └──────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────┐│
│  │         📋 Send Request                          ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  🔒 Your information is only shared with this       │
│     provider. No account required.                  │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Sheet Header
- Handle bar: 40px × 4px, `--border` color, rounded, centered
- Title: "Contact Provider" (h2)
- Provider info row: Avatar (40px) + name (body, bold) + rating + availability + category (body-sm, `--foreground-muted`)

**Animation:** Sheet slides up from bottom (0.35s spring `[0.32, 0.72, 0, 1]`), backdrop fades in simultaneously.

### Section: Name Input
- FormField component
- Label: "Your Name"
- Placeholder: "Enter your name"
- 48px height, border-radius `sm`
- Pre-filled from localStorage if previously entered

### Section: Phone Input
- FormField component
- Label: "Phone Number"
- Placeholder: "17XX XXXX" (Bhutan format)
- Input type: `tel`
- Bhutan flag prefix icon (optional)
- Validation: Must be 8 digits starting with 17

### Section: Issue Description
- FormField component (textarea)
- Label: "Describe your issue"
- Placeholder: "What do you need help with?"
- Min-height: 80px, expands up to 160px
- Character count: "0/500" (caption, bottom-right)

### Section: Location Selection
- Section label: "Your Location" (h4)
- Two options as tappable rows:
  1. **Use My Current Location** — `MapPin` icon, `--primary` text → triggers geolocation API, shows loading spinner, then displays coordinates/address
  2. **Select on Map** — `Map` icon → opens map picker (mock for MVP, shows a static map with tap-to-place-pin)
- Selected location shown as compact card: `MapPin` + truncated address + "Change" link

### Section: Photo Upload
- Section label: "Attach Photo (Optional)" (h4)
- FileUploadCard component: dashed border, 100px height, tap to select file
- Shows preview thumbnail after selection with remove (X) button
- Accepts: JPG, PNG, max 5MB

### Section: Action Buttons
Four full-width stacked buttons (48px height each, 8px gap):
1. **Call Now** — `--primary` solid, `Phone` icon → simulates saving lead, opens `tel:` link to provider phone
2. **WhatsApp** — `#25D366` solid, `MessageCircle` icon → simulates saving lead, opens `https://wa.me/[phone]`
3. **Share My Location** — `--secondary` solid, `MapPin` icon → simulates saving lead, opens share dialog with location text
4. **Send Request** — `--primary` outline, `ClipboardList` icon → saves request to local mock state, shows success toast

Each button shows a brief loading state (spinner) for 400ms before executing action.

### Section: Privacy Note
- `Lock` icon (14px) + "Your information is only shared with this provider. No account required." (caption, `--foreground-muted`)
- Centered text

## Dismissal
- Tap backdrop, swipe down on sheet, or tap back button
- Slide down animation (0.25s ease-in)
- If form has data, show confirm dialog: "Discard your message?"

## Form Validation
- Name: Required, min 2 characters
- Phone: Required, valid Bhutan phone format
- Issue: Optional, max 500 characters
- Location: Optional
- Photo: Optional

Validation errors shown inline below each field with `--error` text (body-sm).

## Success States
- **Call:** Shows "Calling..." briefly, then opens phone dialer. On return, shows success toast: "Your request has been sent to [Provider]"
- **WhatsApp:** Opens WhatsApp with pre-filled message template. Toast on return.
- **Share Location:** Opens native share sheet with location text + Google Maps link.
- **Send Request:** Toast "Request sent successfully!" + sheet auto-dismisses after 1.5s.

## Data
Pre-filled from provider object (name, phone, whatsapp). Customer info saved to localStorage for convenience on repeat visits.
