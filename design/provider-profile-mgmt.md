# Provider Profile Management Page

## Route
`/provider/profile`

## Purpose
Provider can edit their profile, pricing, availability, work photos, and documents. Organized into collapsible sections for easy navigation. This is a long form page — usability is key.

## Layout
```
┌──────────────────────────────────────────────────────┐
│ ← Edit Profile                                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │           ┌──────────┐                           ││
│  │           │  80px    │  [📷 Change Photo]        ││
│  │           │  Avatar  │                           ││
│  │           └──────────┘                           ││
│  │           Karma Electric Solutions               ││
│  │           Electrician · Thimphu                  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 📋 Basic Info                      [▼]          ││
│  ├──────────────────────────────────────────────────┤│
│  │ Business Name                                    ││
│  │ Phone Number (read-only)                         ││
│  │ Email                                            ││
│  │ Service Category                                 ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 💰 Pricing                         [▼]          ││
│  ├──────────────────────────────────────────────────┤│
│  │ Visit Charge                                     ││
│  │ Hourly Charge                                    ││
│  │ Emergency Charge                                 ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🕐 Availability & Hours            [▼]          ││
│  ├──────────────────────────────────────────────────┤│
│  │ Availability toggle                              ││
│  │ Opening hours inputs                             ││
│  │ Emergency toggle                                 ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🔧 Skills                          [▼]          ││
│  ├──────────────────────────────────────────────────┤│
│  │ [Wiring] [Install] [Repair] [+]                  ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 📸 Work Photos                     [▼]          ││
│  ├──────────────────────────────────────────────────┤│
│  │ [Photo grid] [+ Add Photos]                      ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 📄 Documents                       [▼]          ││
│  ├──────────────────────────────────────────────────┤│
│  │ Citizenship [✅/❌]  [Re-upload]                ││
│  │ Certificate [✅/❌]  [Re-upload]                ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  [Save Changes]                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Profile Header
- Back button + "Edit Profile" title
- Centered avatar (80px) with camera overlay icon for change
- Business name + category + location below

### Section: Basic Info (Collapsible)
- Business Name — text input
- Phone — read-only (verified)
- Email — text input with validation
- Category — Select dropdown

### Section: Pricing (Collapsible)
- Visit Charge — number input, Nu. prefix
- Hourly Charge — number input, Nu./hr prefix
- Fixed Charge — optional number input
- Emergency Charge — optional, shown if emergency enabled

### Section: Availability & Hours (Collapsible)
- Four-state availability toggle (same as dashboard)
- Opening hours: Mon-Fri, Saturday, Sunday with time inputs
- Emergency toggle: Switch

### Section: Skills (Collapsible)
- Chip input: type and press enter to add skill chips
- Each chip: `--primary-light` bg, X to remove
- Pre-populated with existing skills

### Section: Work Photos (Collapsible)
- Grid of existing photos (3 columns, 80px each)
- Add photo button: dashed border, camera icon
- Tap photo: expand in lightbox
- Long-press/delete: confirmation dialog

### Section: Documents (Collapsible)
- List of documents with verification status
- Each: document name + status badge + re-upload button
- Upload area for new documents

### Save Button
- Fixed at bottom, full-width, primary solid
- Shows "Saving..." spinner during save
- Success: toast + checkmark animation

## Animations
- Sections expand/collapse with accordion (0.25s ease)
- Save button slides up from bottom (0.2s)
- Photo grid items stagger in (0.03s each)

## Data
Provider object from localStorage, editable form fields.
