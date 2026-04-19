# Required vs Optional Step Distinction — Design Spec

**Issue:** [reviews-kits#112](https://github.com/reviews-kits-team/reviews-kits/issues/112)
**Parent:** [reviews-kits#104](https://github.com/reviews-kits-team/reviews-kits/issues/104)
**Date:** 2026-04-19
**Scope:** Presentation-layer only (~35 lines across 2 files)

## Problem

The form editor lacks visual distinction between required steps (essential to a complete review flow) and optional steps (user-added extras). Users cannot tell at a glance which steps are mandatory.

## Step Classification

Determined by step type, not the `locked` boolean.

| Type | Classification | Rationale |
|------|---------------|-----------|
| `welcome` | Required | Sets context, improves completion rate |
| `core` | Required | Rating + written review — main value |
| `rating` | Required | Core data — review score |
| `textarea` | Required | Written testimonial |
| `identity` | Required | Attribution and trust |
| `success` | Required | Closes the loop |
| `custom` | Optional | User-added custom questions |
| `informative` | Optional | Non-interactive info |
| `attribution` | Optional | Additional photo/details |

**Required types constant:**
```typescript
const REQUIRED_STEP_TYPES = new Set([
  'welcome', 'core', 'rating', 'textarea', 'identity', 'success'
])
```

## Changes

### 1. Canvas Badges — `EditorCanvas.tsx` (~15 lines)

**Current behavior:** `stepTypeBadge()` returns a string like `Step 1: Welcome 🔒`.

**New behavior:** The `stepTypeBadge()` helper is refactored to return only the step label string (e.g., `Step 1: Welcome`) without the 🔒 emoji. A new inline JSX element is added next to the existing badge `<div>` inside the step card to render the classification pill:

- **Required steps:** Teal pill — `● Required`
  - Background: `rgba(13,158,117,0.15)`, text color: `#0D9E75`
- **Optional steps:** Gray pill — `○ Optional`
  - Background: `rgba(255,255,255,0.08)`, text color: `rgba(255,255,255,0.5)`

Both badges use pill shape (`rounded-full`), 9px uppercase font, 800 weight.

### 2. Sidebar Indicator — `EditorSidebarStepTab.tsx` (~10 lines)

Above the "Currently editing" section, add a classification label:

- **Required steps:** Teal `REQUIRED` label + info tooltip: "This step cannot be removed"
- **Optional steps:** Gray `OPTIONAL` label (no tooltip)

Uses the same 9px uppercase styling as the existing `Currently editing` label.

### 3. Toggle Gating — `EditorSidebarStepTab.tsx` (~5 lines)

The "Enable this step" toggle is hidden for required steps. Required steps are always enabled. The toggle remains visible and functional for optional steps only.

## Files Modified

| File | Change | Est. Lines |
|------|--------|-----------|
| `apps/admin/src/components/form-editor/EditorCanvas.tsx` | Badge rendering in `stepTypeBadge()` + JSX | ~15 |
| `apps/admin/src/components/form-editor/EditorSidebarStepTab.tsx` | Classification label + toggle gating | ~20 |

**Total: ~35 lines**

## Out of Scope

- No `FormStep` type changes — no new properties added
- No server-side enforcement modifications
- No public form rendering changes
- No step reordering logic updates
- No "lock after first response" behavior
- The `locked` boolean continues to control deletion and reordering independently

## Testing

Manual verification:
1. Open form editor with default form (Welcome, Core, Identity, Success)
2. Verify Welcome, Core, Identity, Success show teal `● Required` badge on canvas
3. Add a Custom step — verify it shows gray `○ Optional` badge
4. Add Rating and Textarea steps — verify they show teal `● Required` badge
5. Click a required step in sidebar — verify `REQUIRED` label appears, "Enable this step" toggle is hidden
6. Click an optional step in sidebar — verify `OPTIONAL` label appears, toggle is visible
7. Verify delete button still hidden for `locked` steps (unchanged behavior)
