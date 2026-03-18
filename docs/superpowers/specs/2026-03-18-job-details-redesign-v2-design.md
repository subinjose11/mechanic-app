# Job Details Page — Redesign V2 (Glassmorphism)

## Problem

The v1 redesign improved structure but lacks the visual polish and section ordering the user wants. Specific issues:
- Section order doesn't match mechanic workflow (description and odometer should come first)
- Odometer is read-only — needs to be editable
- Payments cannot be deleted — need delete functionality
- No payment summary breakdown
- UI needs glassmorphism treatment for an advanced, premium feel

## Design Goals

- Glass/frosted card aesthetic with translucent backgrounds, blur effects, subtle glows
- Section order matching mechanic workflow: Description → Odometer → Labor → Parts → Payments → Summary → Status
- Editable odometer reading
- Delete payments (matching labor/parts delete UX)
- Payment summary with line-item breakdown and progress bar
- All existing features preserved (add labor, add parts, record payment, status updates, delete order, preview receipt)

## Section Order & Design

### 0. Vehicle Header Card (Glass)
- Glass card: `rgba(255,255,255,0.04)` background, `border: 1px solid rgba(255,255,255,0.08)`, borderRadius 18
- Radial gradient glow in top-right corner: `rgba(99,102,241,0.15)`
- Left: 52px icon with glass gradient background (`rgba(99,102,241,0.3)` to `rgba(139,92,246,0.3)`), 1px border `rgba(99,102,241,0.2)`, car emoji
- Center: Vehicle name (17px bold), customer name (12px muted), license plate chip
- Right: Status badge with glass styling — `rgba(99,102,241,0.12)` bg, `rgba(99,102,241,0.2)` border, `#818CF8` text
- Below: centered creation date

### 1. Work Description (Glass Card)
- Glass card with small radial glow top-left
- Icon: clipboard emoji in glass icon box (28px, `rgba(99,102,241,0.12)` bg)
- Label: "Work Description" (13px, 600 weight)
- Body: description text (13px, indented below icon)
- Only shown when `order.description` exists

### 2. Editable Odometer (Glass Card)
- Glass card, single row layout
- Left: speedometer emoji in glass icon box (`rgba(34,211,238,0.12)` — cyan tint)
- Label: "Odometer Reading"
- Right: glass input box showing current value (`42,350 km`) + edit button (pencil emoji in glass circle)
- Tap edit → inline TextInput becomes editable, save on blur or confirm
- Calls `orderController.update(id, { kmReading: newValue })`
- Only shown (but always shown, even if null — shows "Not recorded" with edit button)

### 3. Labor Section (Glass Collapsible)
- Glass card with radial glow bottom-right
- Header: wrench emoji in glass icon box (`rgba(99,102,241,0.12)`), "Labor" title, count badge, subtotal, + add button (glass circle)
- Items: left accent border `rgba(99,102,241,0.2)`, indented list
- Each item: name, detail (hours × rate), amount, ✕ delete button (`rgba(239,68,68,0.5)`)
- + button opens AddLaborSheet
- Collapsible: tap header to expand/collapse

### 4. Parts Section (Glass Collapsible)
- Same structure as Labor but pink accent
- Glass icon box: `rgba(236,72,153,0.12)`, count badge pink, border accent `rgba(236,72,153,0.2)`
- + button opens AddPartSheet

### 5. Payments Section (Glass Collapsible) — NEW: with delete
- Same collapsible structure but green accent
- Glass icon box: `rgba(34,197,94,0.12)`, count badge green
- Each payment item shows: payment method ("Cash Payment" / "UPI Payment" / "Card Payment"), type + date as detail, amount in green, ✕ delete button
- + button navigates to payment recording screen
- **Delete**: each payment has ✕ button that calls `orderController.deletePayment(orderId, paymentId)` with confirmation alert

### 6. Payment Summary (Glass Card) — NEW
- Glass card with radial glow top-center
- Icon: chart emoji in glass icon box (`rgba(245,158,11,0.12)` — amber tint)
- Line items:
  - Labor Total: muted label → amount
  - Parts Total: muted label → amount
  - Divider
  - Grand Total: bold label → bold amount
  - Amount Paid: green label → green amount with minus sign
  - Divider
  - Balance Due: highlighted row with red glass background (`rgba(239,68,68,0.08)`, `rgba(239,68,68,0.12)` border), red bold text
    - When balance is 0: show green "Fully Paid" instead
- Payment progress bar below: glass track, green gradient fill, percentage label

### 7. Status Stepper (Glass Card)
- Glass card
- Icon: traffic light emoji in glass icon box (`rgba(168,85,247,0.12)` — purple tint)
- Label: "Job Status"
- 3-step horizontal stepper: Pending → In Progress → Completed
- Active step has `box-shadow: 0 0 12px` glow effect
- Connecting lines have subtle glow when filled
- Tappable to change status

### 8. Bottom Bar (Glass)
- Glass background: `rgba(18,18,28,0.95)` with backdrop blur
- Smart CTA: gradient button with `box-shadow: 0 0 20px rgba(99,102,241,0.3)` glow
  - pending → "Start Job"
  - in_progress → "Mark as Complete"
  - completed + balance > 0 → "Record Payment"
  - completed + balance ≤ 0 → "View Receipt"
- Receipt icon button: glass circle

## Glass Card Component

Create a reusable `GlassCard` component:
```ts
Props: {
  children: ReactNode;
  glowColor?: string;    // radial gradient color, default primary
  glowPosition?: 'top-left' | 'top-right' | 'bottom-right' | 'center-top';
  style?: ViewStyle;
}
```
- Background: `rgba(255,255,255,0.04)`
- Border: `1px solid rgba(255,255,255,0.08)`
- BorderRadius: 16
- Optional radial gradient glow overlay
- Note: `backdrop-filter: blur()` is not natively supported in React Native. Use a solid glass-like background color instead. The visual effect comes from the translucent background + border + glow.

## Glass Icon Box Component

Create a reusable `GlassIconBox` component:
```ts
Props: {
  emoji: string;
  tintColor: string;  // e.g., 'rgba(99,102,241,0.12)'
  borderColor: string; // e.g., 'rgba(99,102,241,0.15)'
  size?: number;       // default 28
}
```

## Component Architecture

```
src/app/(main)/orders/[id]/
├── index.tsx                    # Main orchestrator (~300 lines)
├── _layout.tsx                  # Existing
└── _components/
    ├── GlassCard.tsx            # Reusable glass card wrapper
    ├── GlassIconBox.tsx         # Reusable glass icon circle
    ├── VehicleInfoCard.tsx      # Vehicle header (updated: glass style)
    ├── WorkDescription.tsx      # Work description card (NEW)
    ├── EditableOdometer.tsx     # Editable odometer card (NEW)
    ├── GlassCollapsibleSection.tsx  # Collapsible section with glass styling
    ├── WorkItemRow.tsx          # Item row with delete (reuse, minor style update)
    ├── PaymentSummary.tsx       # Payment breakdown card (NEW)
    ├── StatusStepper.tsx        # Status stepper (updated: glass style + glow)
    ├── SmartBottomBar.tsx       # Bottom bar (updated: glass style)
    ├── BottomSheet.tsx          # Existing
    ├── AddLaborSheet.tsx        # Existing
    └── AddPartSheet.tsx         # Existing
```

## New Feature: Delete Payment

The `OrderController` already has `deletePayment(orderId, paymentId)` — but we need to verify this exists. If not, add it following the same pattern as `deleteLaborItem` and `deleteSparePart`.

Delete flow:
1. User taps ✕ on payment row
2. Confirmation Alert: "Delete this payment of ₹X?"
3. On confirm: `orderController.deletePayment(orderId, paymentId)`
4. Payment removed, totals recalculated

## New Feature: Edit Odometer

Edit flow:
1. User taps ✏️ edit button on odometer card
2. Value field becomes an editable TextInput (numeric keyboard)
3. User types new value
4. On blur or pressing done: `orderController.update(id, { kmReading: newValue })`
5. Reverts to display mode

## Existing Code to Reuse

- `formatCurrency` from `@core/utils/formatCurrency`
- `formatDateTime` from `@core/utils/formatDate`
- `OrderStatus` from `@core/constants`
- `useOrderStore`, `useOrderController` hooks
- `colors` from `@theme/colors`
- `LinearGradient` from `expo-linear-gradient`
- `BottomSheet`, `AddLaborSheet`, `AddPartSheet` — existing `_components/`
- `Swipeable` from `react-native-gesture-handler`

## Verification

1. Navigate to job detail — all 7 sections render in correct order with glass styling
2. Work description shows when present, hidden when null
3. Odometer: tap edit → change value → save → verify updated
4. Labor: add, view expanded items, delete item, verify totals update
5. Parts: same as labor
6. Payments: add (navigates to payment screen), view list with delete buttons, delete payment with confirmation, verify totals update
7. Payment Summary: verify correct breakdown math, progress bar percentage, balance due highlighting
8. Status stepper: tap to change, verify glow effects
9. Bottom bar: verify CTA changes per status
10. Empty state: new order with no items renders cleanly
