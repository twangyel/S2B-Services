# Provider Subscription Page

## Route
`/provider/subscription`

## Purpose
Shows subscription plans, current status, payment proof upload, and renewal flow. Subscription-based revenue model for providers.

## Layout
```
┌──────────────────────────────────────────────────────┐
│ ← Subscription                                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 💳 Current Plan                                   ││
│  │                                                   ││
│  │ ┌──────────────────────────────────────────────┐  ││
│  │ │ 🟣 Pro Provider                               │  ││
│  │ │ Active until December 31, 2025               │  ││
│  │ │                                               │  ││
│  │ │ ✅ Verified badge on profile                  │  ││
│  │ │ ✅ Priority in search results                 │  ││
│  │ │ ✅ Featured listing eligible                  │  ││
│  │ │ ✅ Unlimited leads                            │  ││
│  │ └──────────────────────────────────────────────┘  ││
│  │                                                   ││
│  │ Status: ✅ Active                                 ││
│  │ Renewed: November 1, 2025                        ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Available Plans                                     │
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🟢 Free Trial                                    ││
│  │ Nu. 0 / 14 days                                  ││
│  │ ✓ Basic listing                                  ││
│  │ ✗ No verified badge                              ││
│  │ ✗ Limited to 5 leads                             ││
│  │ [Start Trial] — disabled if already used         ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🔵 Basic Verified                                ││
│  │ Nu. 299 / month                                  ││
│  │ ✓ Verified badge                                 ││
│  │ ✓ Standard search ranking                        ││
│  │ ✓ Up to 20 leads/month                           ││
│  │ ✓ Customer reviews                               ││
│  │ [Subscribe]                                      ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🟣 Pro Provider                                  ││
│  │ Nu. 599 / month                                  ││
│  │ ✓ Everything in Basic                            ││
│  │ ✓ Priority search ranking                        ││
│  │ ✓ Unlimited leads                                ││
│  │ ✓ Featured listing eligible                      ││
│  │ ✓ Work photos gallery                            ││
│  │ [Current Plan — Active]                            ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 🟠 Featured Provider                             ││
│  │ Nu. 999 / month                                  ││
│  │ ✓ Everything in Pro                              ││
│  │ ✓ Featured badge on profile                      ││
│  │ ✓ Top of search results                          ││
│  │ ✓ Homepage featured placement                    ││
│  │ ✓ Priority customer support                      ││
│  │ [Upgrade]                                        ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  ┌──────────────────────────────────────────────────┐│
│  │ 💳 Payment Method                                 ││
│  ├──────────────────────────────────────────────────┤│
│  │ We accept Bank Transfer only                     ││
│  │                                                   ││
│  │ Bank: Bank of Bhutan                             ││
│  │ Account: S2B Services Pvt. Ltd.                  ││
│  │ Account No: 0000XXXXXXXX                         ││
│  │                                                   ││
│  │ After transfer, upload your proof:              ││
│  │ ┌──────────────────────────────────────────────┐  ││
│  │ │ 📷 Upload payment screenshot                 │  ││
│  │ └──────────────────────────────────────────────┘  ││
│  │                                                   ││
│  │ [Submit for Verification]                          ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
│  Payment History                                     │
│  ┌──────────────────────────────────────────────────┐│
│  │ ✅ Nov 1, 2025 — Pro — Nu. 599 — Verified       ││
│  ├──────────────────────────────────────────────────┤│
│  │ ✅ Oct 1, 2025 — Pro — Nu. 599 — Verified       ││
│  ├──────────────────────────────────────────────────┤│
│  │ ✅ Sep 1, 2025 — Basic — Nu. 299 — Verified     ││
│  └──────────────────────────────────────────────────┘│
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Sections

### Section: Current Plan Card
- White card with plan-specific left border color
- Plan name (h2) + SubscriptionBadge
- Expiry date
- Feature checklist with checkmarks
- Status: "Active" / "Expired" / "Pending Verification"

### Section: Plan Cards
- 4 cards stacked vertically:
  - **Free Trial** — green border, "0/14 days", limited features
  - **Basic Verified** — blue border, "Nu. 299/month"
  - **Pro Provider** — purple border, "Nu. 599/month", marked as current
  - **Featured Provider** — orange border, "Nu. 999/month"
- Each card: white bg, border-radius `md`, border-left 4px colored
- Feature list: checkmarks for included, gray X for excluded
- CTA button at bottom of each card

### Section: Payment Proof Upload
- Bank details card (read-only)
- FileUploadCard for screenshot
- "Submit for Verification" button
- After submit: status changes to "Pending Verification" with warning badge

### Section: Payment History
- Reverse chronological list
- Each entry: status icon + date + plan + amount + verification status
- Divider between entries

## Animations
- Plan cards: stagger in 0.1s each, slide up 20px
- Current plan: highlighted with subtle pulse on border
- Payment history: fade in on scroll

## Data
Subscription plans mock data + provider's current subscription from localStorage.
