# Tool panel shared button Implementation Plan

> **Status:** executed 2026-09-25. History only — do not re-run.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One visibility mechanism for every tool-panel button, then one group model in `tools-panel` instead of three copied blocks.

**Architecture:** `ToolButtonVisibility` is a host directive. It keeps the existing `button-visibility` attribute contract so chevron show/hide does not change. Per-tool services, icons, badges, and `drawing-tool-blank` stay. Task 2 replaces the three copied `ViewChild` groups with one list of group descriptors. Do not introduce MatDialog or a second entity store.

**Tech Stack:** Angular 22 zoneless, existing `buttons-subgroups-visibility.ts`, Vitest 4.1

**SDD skills:** `.cursor/skills/sight-angular-ui/SKILL.md`, `.cursor/skills/sight-map-tools/SKILL.md`, `.cursor/skills/sight-testing/SKILL.md`

## Global Constraints

- Keep `$` inject names, selectors without `app-`, file names without `.component`.
- `drawing-tool-blank` stays a scaffold. Update its comment to the directive. Do not register it as a live tool.
- Do not rewrite drawing/measuring services or KML/ODS export in this plan.
- `provideZonelessChangeDetection()` in every new TestBed.
- No new npm dependencies. No commit unless Evgeniy asks.
- Console: one allowlisted command per Shell call (`npx ng test --no-watch --include=…`). Never set `request_smart_mode_approval`.

---

### Task 1: Host directive for button visibility

**Files:**
- Create: `src/app/planet/components/tools/lib/tool-button-visibility.directive.ts`
- Test: `src/app/planet/components/tools/lib/tool-button-visibility.directive.spec.ts`
- Modify: every panel button that calls `getBtnVisibilityObserver` (draw/calculate/camera tools listed in the grep of that function)
- Modify: `drawing-tool-blank.ts` comment only

**Interfaces:**
- Produces: `ToolButtonVisibility.visible: WritableSignal<boolean>`
- Consumes: `setStartBtnVisibility`, `getBtnVisibilityObserver`

- [x] **Step 1: Failing spec** — attribute `button-visibility="true"` before first CD makes `visible()` true; flipping the attribute to `false` makes `visible()` false.
- [x] **Step 2: Directive + `hostDirectives` on each button.** Template keeps `buttonVisibility()` by assigning `protected readonly buttonVisibility = inject(ToolButtonVisibility).visible`.
- [x] **Step 3: `npx ng test --no-watch --include=src/app/planet/components/tools/lib/tool-button-visibility.directive.spec.ts`** and one button spec (`draw-line.spec.ts`).
- [x] **Step 4: Do not commit.**

### Task 2: One group model in tools-panel

**Files:**
- Modify: `src/app/planet/components/tools/tools-panel.ts`
- Test: `src/app/planet/components/tools/tools-panel.spec.ts`

**Interfaces:**
- Produces: a private `toolGroups` array of `{ templates, defaultVcr, hiddenVcr, defaultDiv, hiddenDiv, expanded }`
- `renderToolsGroupTemplates` / `moveToolToDefault` / chevron handlers take one group, not six parallel arguments copied three times

- [x] **Step 1: Characterize current chevron behavior in `tools-panel.spec.ts` if it is not already covered (create the panel, expanded signal starts false).**
- [x] **Step 2: Replace the three field blocks with `toolGroups` and loop `ngAfterViewInit`.** Keep the same template refs and the same `button-visibility` writes.
- [x] **Step 3: Run `npx ng test --no-watch --include=src/app/planet/components/tools/tools-panel.spec.ts`.**
- [x] **Step 4: Do not commit.**

### Task 3: Drop the attribute bus

Only after Task 2 is green.

- [x] **Step 1: Group `expanded` signal is the source of truth.** Each button reads its group's expanded flag (or "is the default tool") instead of `MutationObserver`.
- [x] **Step 2: Delete `setStartBtnVisibility` / `getBtnVisibilityObserver` when nothing calls them.**
- [x] **Step 3: Run tools-panel and directive specs.**
