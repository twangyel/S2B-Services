# Admin Payment Verification Page

## Route
`/admin/payments`

## Purpose
Admin reviews and verifies provider payment proofs for subscriptions. Can approve/reject payments, set expiry dates, and see payment history. Critical for the subscription revenue model.

## Layout
```
┌──────────────────────────────────────────────────────┐
│  ☰  Payments                                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 2 payments need verification                     ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌────────┐┌──────────┐┌──────────┐┌──────────┐    │
│  │Pending │ │Verified │ │Rejected │ │ All     │    │
│  │ [2]   │ │ [45]    │ │ [3]    │ │ [50]    │    │
│  └────────┘└──────────┘└──────────┘└──────────┘    │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌────────┐  Karma Electric Solutions             ││
│  │ │ 48px   │  🟣 Pro Provider Plan                ││
│  │ │ Avatar │  💰 Nu. 599 / month                   ││
│  │ └────────┘  📅 Submitted 2 hours ago            ││
│  │                                                   ││
│  │ ┌──────────────────────────────────────────────┐  ││
│  │ │ ⏳ Awaiting Verification                      │  ││
│  │ └──────────────────────────────────────────────┘  ││
│  │                                                   ││
│  │ 💳 Payment Screenshot                             ││
│  │ ┌──────────────────────────────────────────────┐  ││
│  │ │ [Screenshot thumbnail - tap to expand]       │  ││
│  │ └──────────────────────────────────────────────┘  ││
│  │                                                   ││
│  │ Bank: Bank of Bhutan                             ││
│  │ Account: 0000XXXXXXXX                             ││
│  │ Amount: Nu. 599                                   ││
│  │ Date: January 15, 2026                            ││
│  │                                                   ││
│  │ 📅 Set Subscription Expiry:                       ││
│  │ ┌──────────────────────────────────────────────┐  ││
│  │ │ January 15, 2027                             │  ││
│  │ └──────────────────────────────────────────────┘  ││
│  │                                                   ││
│  │ ┌──────────────┐ ┌──────────────┐               ││
│  │ │  ✅ Approve  │ │  ❌ Reject   │               ││
│  │ └──────────────┘ └──────────────┘               ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ ┌────────┐  Tashi Cleaning Pro                   ││
│  │ │ 48px   │  🔵 Basic Verified Plan               ││
│  │ │ Avatar │  💰 Nu. 299 / month                   ││
│  │ └────────┘  📅 Submitted 5 hours ago            ││
│  │              ...same pattern...                   ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Payment History                                     │
│  ┌──────────────────────────────────────────────────┐│
│  │ Karma Electric — Pro — Nu.599 — ✅ Verified     ││
│  │ Jan 15 · Bank of Bhutan                          ││
│  ├──────────────────────────────────────────────────┤│
│  │ Sonam Welding — Basic — Nu.299 — ✅ Verified    ││
│  │ Jan 14 · Bank of Bhutan                          ││
│  ├──────────────────────────────────────────────────┤│
│  │ Dorji Plumbing — Pro — Nu.599 — ❌ Rejected     ││
│  │ Jan 13 · Invalid amount                          ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Header
- Hamburger + "Payments" (h1)

### Section: Alerts Banner
- Shows count of pending verifications
- Hidden if none pending

### Section: Status Tabs
- **Pending [count]** / **Verified [count]** / **Rejected [count]** / **All [count]**
- Active tab: underline + text color

### Section: Payment Verification Cards
Each pending payment is a **PaymentProofCard** / **AdminActionCard**:

```
┌──────────────────────────────────────────────────────┐
│ ┌────────┐  Provider Business Name                    │
│ │ 48px   │  [Plan badge] · Nu. XXX / month           │
│ │ Avatar │  📅 Submitted [relative time] ago         │
│ └────────┘                                           │
│                                                       │
│ ┌──────────────────────────────────────────────────┐  │
│ │ ⏳ Awaiting Verification                        │  │
│ └──────────────────────────────────────────────────┘  │
│                                                       │
│ 💳 Payment Screenshot                                 │
│ [Thumbnail — tap to expand full screen]               │
│                                                       │
│ Bank: [Name]                                          │
│ Account: [Number]                                     │
│ Amount: Nu. [Amount]                                  │
│ Transfer Date: [Date]                                 │
│                                                       │
│ 📅 Set Subscription Expiry:                           │
│ [Date picker input]                                   │
│                                                       │
│ ┌──────────────┐ ┌──────────────┐                    │
│ │ ✅ Approve   │ │ ❌ Reject    │                    │
│ └──────────────┘ └──────────────┘                    │
└──────────────────────────────────────────────────────┘
```

- White card, border-radius `md`, shadow `shadow-md` (elevated)
- Provider info row with plan badge
- Status banner: `--warning-light`, "Awaiting Verification"
- Screenshot: thumbnail (tap opens full-screen lightbox)
- Transfer details: bank name, account, amount, date (read-only)
- Expiry date: date picker input (defaults to 1 year from payment date)
- Actions: Approve (success solid) / Reject (destructive outline)

### Section: Approve Flow
1. Admin reviews screenshot and details
2. Adjusts expiry date if needed
3. Taps "Approve"
4. Brief loading state
5. Success toast: "Payment verified! Subscription activated until [date]."
6. Card fades out, moves to "Verified" tab

### Section: Reject Flow
1. Taps "Reject"
2. Bottom sheet opens:
   - Title: "Reject Payment"
   - **Required:** Rejection reason textarea
   - Radio options: "Invalid screenshot", "Wrong amount", "Transfer not found", "Other"
   - Provider notification: "Provider will be notified to resubmit."
   - Buttons: Cancel (ghost) + "Reject Payment" (destructive)
3. On confirm: toast "Payment rejected. Provider notified."
4. Card fades out, moves to "Rejected" tab

### Section: Payment History
- Reverse chronological list of all processed payments
- Each entry: provider name, plan, amount, status badge (verified/rejected), date, bank
- Verified: green checkmark + "Verified" text
- Rejected: red X + rejection reason

## Entrance Animations
1. Header: fade in (0s)
2. Alert banner: slide down (0.1s)
3. Tabs: slide in (0.05s)
4. Cards: stagger 0.08s, slide up 20px + fade (0.15s base)
5. History: fade in on scroll (0.3s base)

## Loading State
- Skeleton: Alert shimmer → tabs → 2 payment card skeletons → history skeleton

## Empty States
- Pending empty: `CheckCircle2` + "All payments verified!" + "No pending verifications."
- Verified empty: "No verified payments yet"
- Rejected empty: "No rejected payments"

## Data
Mock payment submissions from providers. Each payment:
`id`, `providerId`, `providerName`, `providerPhoto`, `planId`, `planName`, `amount`, `bankName`, `accountNumber`, `screenshotUrl`, `transferDate`, `submittedAt`, `status`, `expiryDate`, `verifiedAt`, `rejectionReason`
