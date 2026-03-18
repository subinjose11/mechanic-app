# Job Details Page — Complete UI Redesign

## Problem

The current job details page (`src/app/(main)/orders/[id]/index.tsx`) has poor visual hierarchy and is not user-friendly. Key issues:
- Large gradient header takes too much space without adding value
- No quick action access — users must scroll to find actions
- Work items (labor/parts) presented as flat lists without clear grouping
- Status update is buried at the bottom as three separate buttons
- No visual progression indicator for job lifecycle
- The component is 1,133 lines with inline bottom sheets and mixed concerns

## Design Goals

- Better visual hierarchy so all key info is scannable at a glance
- Quick access to frequent actions (add labor, add part, record payment, preview receipt)
- Clearer organization of work items with expand/collapse
- Visual job status progression
- Context-aware bottom bar that shows the next logical action
- Component decomposition for maintainability

## Design

### 1. Header — Compact Icon Card

**Replaces:** Large dark gradient hero with centered text

**New design:**
- Slim breadcrumb top bar: `‹ Jobs` on left, overflow menu (⋮) on right
- Single card row containing:
  - Left: 52px gradient icon (vehicle emoji on indigo→purple gradient, rounded 14px)
  - Center: Vehicle name (16px bold), customer name (12px secondary), info chips row (reg number + odometer in `rgba(255,255,255,0.08)` pill badges)
  - Right: Status badge (e.g., "IN PROGRESS" in `primaryDim` background with `primary` text)
- Date shown below the card as centered tertiary text

**Key files to modify:**
- `src/app/(main)/orders/[id]/index.tsx` — main component

### 2. Financial Summary — 3-Column Stats

**Replaces:** Horizontal stats container with text dividers

**New design:**
- 3 equal-width cards in a row with 6px gap
- Each card: `surface` background, 12px border-radius, centered content
- Cards:
  1. **Total** — label in tertiary uppercase (8px), value in 15px bold white
  2. **Paid** — same layout, value in `success` green, subtle green border (`rgba(34,197,94,0.15)`)
  3. **Balance** — same layout, value in `error` red, subtle red border (`rgba(239,68,68,0.15)`)

### 3. Quick Actions — 4-Column Icon Grid

**New addition** (currently no quick action grid exists)

- 4 equal-width cards in a grid, 8px gap
- Each card: `surface` background, 12px border-radius, 1px border
- Each contains:
  - Gradient icon circle (34px, rounded 10px) with emoji
  - Label text below (9px, secondary color)
- Actions:
  1. **Labor** — wrench icon, indigo→blue gradient → opens labor bottom sheet
  2. **Parts** — gear icon, pink→purple gradient → opens parts bottom sheet
  3. **Payment** — card icon, green→teal gradient → navigates to payment screen
  4. **Receipt** — document icon, amber→yellow gradient → navigates to preview screen

### 4. Work Description — Conditional Card

**Minimal change from current.** Only shown when `order.description` exists.
- Card with clipboard icon + "Work Description" label
- Description text below in 12px

### 5. Work Items — Collapsible Section Cards

**Replaces:** ActionCard + itemsContainer flat list pattern

**New design — each section (Labor, Parts, Payments) is a collapsible card:**

**Card header (always visible):**
- Left: Color-coded dot (8px circle) — indigo for labor, pink for parts, green for payments
- Section name (13px bold)
- Count badge (colored dim background matching section, e.g., `primaryDim` for labor)
- Right: Subtotal amount (14px bold) + expand/collapse chevron

**Card body (when expanded):**
- Left accent border (2px, section color at 25% opacity)
- Item rows with:
  - Item name (12px, 500 weight)
  - Detail line (9px tertiary — e.g., "1 hr × ₹3,500/hr" for labor, "Qty: 2" for parts)
  - Amount on right (12px, 600 weight)
- Rows separated by subtle dividers (`rgba(255,255,255,0.04)`)
- Swipe-to-delete gesture on each item (replacing inline delete button with X icon)

**Interaction:**
- Tap section header to toggle expand/collapse
- Sections start expanded if they have items, collapsed if empty
- Swipe left on item row to reveal delete action

### 6. Status — Visual Progress Stepper

**Replaces:** Three separate full-width status buttons

**New design:**
- Card with "JOB STATUS" label (9px uppercase tertiary)
- Horizontal stepper with 3 steps connected by lines:
  1. **Pending** — green checkmark circle when passed, label below
  2. **In Progress** — indigo filled circle with white inner dot when active, connecting line colored when reached
  3. **Completed** — gray outline circle with gray dot when not reached
- Tap any step to update status (same behavior as current buttons)
- Connecting lines are colored (green/indigo) for completed steps, `rgba(255,255,255,0.08)` for upcoming

### 7. Bottom Bar — Context-Aware Smart CTA

**Replaces:** Static bottom bar with balance display + "Preview Receipt" button

**New design:**
- `surface` background with top border
- Row containing:
  - Primary CTA button (flex: 1) — gradient indigo, 14px rounded, 14px bold text
    - When status is `pending`: "Start Job"
    - When status is `in_progress`: "Mark as Complete"
    - When status is `completed`: "Record Payment" (if balance > 0) or "View Receipt" (if fully paid)
  - Receipt icon button (52×52px, rounded 14px, subtle background) — always accessible

## Component Architecture

Split the current 1,133-line monolith into focused components:

```
src/app/(main)/orders/[id]/
├── index.tsx                    # Main screen (orchestration, data loading)
├── _layout.tsx                  # Stack navigator (existing)
└── _components/
    ├── VehicleInfoCard.tsx       # Header vehicle card
    ├── FinancialStats.tsx        # 3-column stats row
    ├── QuickActions.tsx          # 4-button action grid
    ├── CollapsibleSection.tsx    # Reusable expand/collapse section card
    ├── WorkItemRow.tsx           # Individual labor/parts item row
    ├── StatusStepper.tsx         # Visual progress stepper
    ├── SmartBottomBar.tsx        # Context-aware bottom bar
    ├── AddLaborSheet.tsx         # Bottom sheet for adding labor
    └── AddPartSheet.tsx          # Bottom sheet for adding parts
```

The main `index.tsx` will be reduced to ~200-300 lines of orchestration logic.

## Existing Code to Reuse

- `formatCurrency` from `@core/utils/formatCurrency`
- `formatDateTime` from `@core/utils/formatDate`
- `OrderStatus` constants from `@core/constants`
- `useOrderStore` and `useOrderController` hooks
- `colors` theme from `@theme/colors`
- `LinearGradient` from `expo-linear-gradient`
- `BottomSheet` component (extract and reuse, currently defined inline)
- `useSafeAreaInsets` for safe area padding
- Existing `observer` pattern from MobX

## Interactions & Animations

- **Collapsible sections:** Use `Animated.Value` for height animation (or `LayoutAnimation` for simplicity). Chevron rotates on toggle.
- **Swipe to delete:** Use `Swipeable` from `react-native-gesture-handler` or simple `PanResponder`. Red delete button revealed on swipe left.
- **Quick action press:** Scale animation on press (0.95 scale) using `Pressable` with `transform`.
- **Status stepper:** Tap animates the filling of connecting lines and step circles.
- **Bottom bar CTA:** Gradient button with press feedback.

## Verification

1. **Visual check:** Run the app on iOS/Android simulator. Navigate to a job detail and verify:
   - Vehicle card displays correctly with all info
   - Financial stats show correct totals
   - Quick action buttons all navigate/open correctly
   - Collapsible sections expand/collapse smoothly
   - Swipe to delete works on items
   - Status stepper reflects current state and allows changes
   - Bottom bar CTA changes based on job status
2. **Functional check:**
   - Add labor via quick action → bottom sheet opens → item appears in labor section
   - Add part via quick action → bottom sheet opens → item appears in parts section
   - Record payment → navigates to payment screen
   - Preview receipt → navigates to preview screen
   - Delete item via swipe → item removed, totals updated
   - Change status via stepper → status updates in header badge and stepper
3. **Edge cases:**
   - Empty job (no labor, no parts, no payments) — sections show collapsed with count 0
   - Completed job with zero balance — bottom bar shows "View Receipt"
   - Long vehicle names — text truncates properly
   - Many items — scroll performance remains smooth
