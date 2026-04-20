# Required vs Optional Step Distinction — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visual required/optional badges to the form editor canvas and sidebar, and gate the enable toggle for required steps.

**Architecture:** Purely presentation-layer. A shared `REQUIRED_STEP_TYPES` constant determines classification by step type. Two existing components are modified — `EditorCanvas.tsx` for canvas badges and `EditorSidebarStepTab.tsx` for sidebar indicator + toggle gating. No type changes, no server changes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS (inline classes)

**Spec:** `docs/superpowers/specs/2026-04-19-required-optional-step-distinction-design.md`

---

### File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `apps/admin/src/components/form-editor/EditorCanvas.tsx` | Modify | Canvas badge rendering |
| `apps/admin/src/components/form-editor/EditorSidebarStepTab.tsx` | Modify | Sidebar label + toggle gating |

No new files created. No types modified.

---

### Task 1: Canvas Badges in EditorCanvas.tsx

**Files:**
- Modify: `apps/admin/src/components/form-editor/EditorCanvas.tsx:20-30` (stepTypeBadge function)
- Modify: `apps/admin/src/components/form-editor/EditorCanvas.tsx:113-118` (badge JSX)

- [ ] **Step 1: Add the REQUIRED_STEP_TYPES constant**

At the top of `EditorCanvas.tsx` (after imports, before `EditorCanvasProps`), add:

```typescript
const REQUIRED_STEP_TYPES = new Set([
  'welcome', 'core', 'rating', 'textarea', 'identity', 'success',
])
```

- [ ] **Step 2: Refactor stepTypeBadge() to remove the lock emoji**

Replace the existing `stepTypeBadge` function (lines 20-30) with:

```typescript
function stepTypeBadge(step: FormStep, index: number) {
  const label =
    step.type === 'welcome' ? 'Welcome' :
    step.type === 'core' ? 'Core' :
    step.type === 'identity' ? 'Identity' :
    step.type === 'success' ? 'Success' :
    step.type === 'custom' ? 'Custom' :
    step.type === 'rating' ? 'Rating' :
    step.type === 'textarea' ? 'Textarea' :
    step.type === 'informative' ? 'Informative' :
    step.type === 'attribution' ? 'Attribution' :
    step.type

  return `Step ${index + 1}: ${label}`
}
```

Key change: removed `${step.locked ? ' 🔒' : ''}` — the badge replaces it.

- [ ] **Step 3: Add the classification pill JSX next to the existing badge**

In the step card's badge area (lines 113-118), add a classification pill after the existing step label `<div>`. Replace this block:

```tsx
              {/* Step badge */}
              <div className="absolute top-4 left-4 z-20">
                <div className="bg-[#0A0A0A]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                  {stepTypeBadge(step, index)}
                </div>
              </div>
```

With:

```tsx
              {/* Step badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <div className="bg-[#0A0A0A]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/10">
                  {stepTypeBadge(step, index)}
                </div>
                <div className={`backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                  REQUIRED_STEP_TYPES.has(step.type)
                    ? 'bg-[#0D9E75]/15 text-[#0D9E75]'
                    : 'bg-white/8 text-white/50'
                }`}>
                  {REQUIRED_STEP_TYPES.has(step.type) ? '● Required' : '○ Optional'}
                </div>
              </div>
```

- [ ] **Step 4: Verify the admin app compiles**

Run: `cd apps/admin && bunx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/components/form-editor/EditorCanvas.tsx
git commit -m "feat(form-editor): add required/optional classification badges to canvas steps"
```

---

### Task 2: Sidebar Indicator + Toggle Gating in EditorSidebarStepTab.tsx

**Files:**
- Modify: `apps/admin/src/components/form-editor/EditorSidebarStepTab.tsx:1-3` (imports area — add REQUIRED_STEP_TYPES)
- Modify: `apps/admin/src/components/form-editor/EditorSidebarStepTab.tsx:43-54` (above "Currently editing" block)
- Modify: `apps/admin/src/components/form-editor/EditorSidebarStepTab.tsx:243-252` (enable toggle area)

- [ ] **Step 1: Add the REQUIRED_STEP_TYPES constant**

At the top of `EditorSidebarStepTab.tsx` (after imports, before `FIELD_LABELS`), add:

```typescript
const REQUIRED_STEP_TYPES = new Set([
  'welcome', 'core', 'rating', 'textarea', 'identity', 'success',
])
```

- [ ] **Step 2: Add classification label above the "Currently editing" block**

Replace the existing "Current step info" block (lines 43-54):

```tsx
      {/* Current step info */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0D9E75] block mb-1">
          Currently editing
        </span>
        <h3 className="text-sm font-bold truncate">
          {activeStep ? activeStep.title : 'No step selected'}
        </h3>
        <p className="text-[10px] text-white/40 mt-1 italic">
          Click on a step in the canvas to edit it.
        </p>
      </div>
```

With:

```tsx
      {/* Current step info */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
        {activeStep && (
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] block mb-2 ${
            REQUIRED_STEP_TYPES.has(activeStep.type)
              ? 'text-[#0D9E75]'
              : 'text-white/40'
          }`}
            title={REQUIRED_STEP_TYPES.has(activeStep.type) ? 'This step cannot be removed' : undefined}
          >
            {REQUIRED_STEP_TYPES.has(activeStep.type) ? '● Required step' : '○ Optional step'}
          </span>
        )}
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0D9E75] block mb-1">
          Currently editing
        </span>
        <h3 className="text-sm font-bold truncate">
          {activeStep ? activeStep.title : 'No step selected'}
        </h3>
        <p className="text-[10px] text-white/40 mt-1 italic">
          Click on a step in the canvas to edit it.
        </p>
      </div>
```

- [ ] **Step 3: Gate the "Enable this step" toggle for required steps**

Replace the enable toggle block (lines 242-252):

```tsx
          <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Enable this step</span>
              <button
                onClick={() => onToggleStepEnabled(activeStep.id)}
                className={`w-10 h-5 rounded-full transition-all relative ${activeStep.isEnabled ? 'bg-[#0D9E75]' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${activeStep.isEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
```

With:

```tsx
          <div className="pt-6 border-t border-white/5 space-y-4">
            {!REQUIRED_STEP_TYPES.has(activeStep.type) && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Enable this step</span>
                <button
                  onClick={() => onToggleStepEnabled(activeStep.id)}
                  className={`w-10 h-5 rounded-full transition-all relative ${activeStep.isEnabled ? 'bg-[#0D9E75]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${activeStep.isEnabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            )}
```

- [ ] **Step 4: Verify the admin app compiles**

Run: `cd apps/admin && bunx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/components/form-editor/EditorSidebarStepTab.tsx
git commit -m "feat(form-editor): add sidebar classification label and gate enable toggle for required steps"
```

---

### Task 3: Manual Verification

- [ ] **Step 1: Start the dev server**

Run: `cd /Users/habuild/codes/other/reviews-kits && bun run dev`
Open: `http://localhost:5180`

- [ ] **Step 2: Open the form editor**

Navigate to a form editor page. The default form has Welcome, Core, Identity, Success steps.

- [ ] **Step 3: Verify canvas badges**

Check each step card on the canvas:
- Welcome → teal `● Required` badge
- Core → teal `● Required` badge
- Identity → teal `● Required` badge
- Success → teal `● Required` badge

- [ ] **Step 4: Add a Custom step and verify**

Click "Add a step" → new Custom step should show gray `○ Optional` badge.

- [ ] **Step 5: Verify sidebar for a required step**

Click on the Welcome step. In the sidebar:
- `● Required step` label appears in teal above "Currently editing"
- Hovering the label shows tooltip "This step cannot be removed"
- "Enable this step" toggle is NOT visible

- [ ] **Step 6: Verify sidebar for an optional step**

Click on the Custom step. In the sidebar:
- `○ Optional step` label appears in gray above "Currently editing"
- "Enable this step" toggle IS visible

- [ ] **Step 7: Verify delete button unchanged**

- On a locked step (Welcome): delete button is hidden (unchanged `locked` behavior)
- On an unlocked required step (Identity): delete button is visible (unchanged — `locked` controls this, not the badge)
- On an optional step (Custom): delete button is visible

- [ ] **Step 8: Run lint**

Run: `cd /Users/habuild/codes/other/reviews-kits && bun run lint`
Expected: No lint errors.
