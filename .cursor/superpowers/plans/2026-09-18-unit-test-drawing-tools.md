# Unit-test drawing tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Characterize drawing store APIs, Russian tool names, erase emptiness flags, and drawing tool activation — with a fake Viewer, without `drawing-tool-blank` and without WebGL picks.

**Architecture:** `DrawingService` store methods take `Cesium.Entity` objects you construct in memory (`new Cesium.Entity({ id, name })`) when they do not require a live DataSource. If a method immediately does `viewer.dataSources.getByName`, fake that DataSource collection. Do not `drillPick` a canvas.

**Tech Stack:** Vitest 4.1, Cesium Entity (no Viewer), Angular TestBed

**Spec:** `.cursor/superpowers/specs/2026-09-18-sight-unit-test-suite-design.md` and `.cursor/superpowers/specs/2026-09-17-sight-map-tools-design.md`

**Depends on:** hygiene green. Viewer fake from unit-test spec.

## Global Constraints

- Production frozen; park bugs.
- `drawing-tool-blank/**` stays excluded.
- `drawingToolsNames` literals: `drawMark`, `drawLine`, `drawRectangle`, `drawCircle`, `drawPolygon` only.
- Skills: `.cursor/skills/sight-testing/SKILL.md`, `.cursor/skills/sight-map-tools/SKILL.md`

---

### Task 1: drawingToolsNames and Russian labels (no TestBed)

**Files:**
- Modify: `src/app/planet/components/tools/drawing-tools/services/drawing-service/drawing.service.spec.ts`

- [ ] **Step 1:**

```typescript
import {
  drawingToolsNames,
  getRusDrawingToolName,
  getOriginDrawingToolName,
} from './drawing.service';

it('maps frozen English literals to Russian labels and back', () => {
  expect([...drawingToolsNames]).toEqual([
    'drawMark',
    'drawLine',
    'drawRectangle',
    'drawCircle',
    'drawPolygon',
  ]);
  expect(getRusDrawingToolName('drawMark')).toBe('Метка');
  expect(getRusDrawingToolName('drawLine')).toBe('Линия');
  expect(getRusDrawingToolName('drawRectangle')).toBe('Прямоугольник');
  expect(getRusDrawingToolName('drawCircle')).toBe('Окружность');
  expect(getRusDrawingToolName('drawPolygon')).toBe('Многоугольник');
  expect(getOriginDrawingToolName('Метка')).toBe('drawMark');
  expect(getRusDrawingToolName('unknownTool')).toBe('unknownTool');
});
```

- [ ] **Step 2: Run this spec. PASS. Commit** `test: characterize drawing tool name literals`

---

### Task 2: DrawingService stores and cleanup

**Files:**
- Modify: `src/app/planet/components/tools/drawing-tools/services/drawing-service/drawing.service.spec.ts`

Provide `DrawingService` + fake `ViewerService` + fake `ToolsService`.

- [ ] **Step 1: Named behaviors**

1. Empty lists: `isMarks()`, `isLines()`, `isRectangles()`, `isCircles()`, `isPoligons()` are `false`.
2. `pushGroupWithoutTemporal` (read signature) with a group `{ groupId, entities, defaultEntity, toolName: 'drawMark' }` makes `isMarks()` true if the method does not need a DataSource; if it requires `viewer.dataSources`, fake `getByName` returning `{ entities: { add: vi.fn(), remove: vi.fn() } }`.
3. `removeEntitiesByGroupId` removes that group; `isMarks()` false again.
4. `cancelDrawingTool` / `clearTemporalEntitiesList` empties `temporalEntitiesList`.
5. `allToolEntitiesCleaning` clears the named store.

Do not test heatmap/dome/route leftovers except: `isHeatmap` currently aliases dome length — if you assert it, you are characterizing a bug. Prefer **not** asserting heatmap unless you park it.

- [ ] **Step 2: Run. PASS or park. Commit.**

---

### Task 3: EntityRubberService emptiness

**Files:**
- Modify: `src/app/planet/components/tools/drawing-tools/components/entity-rubber/services/entity-rubber.service.spec.ts`
- Modify: `src/app/planet/components/tools/drawing-tools/components/entity-rubber/entity-rubber.spec.ts` (create + click if it calls the service)

Map-tools spec: `storesAreEmpty` must include every “has entities” flag. Read `EntityRubberService` and assert the boolean expression / method result when all drawing+measure flags are false vs when `DrawingService.isMarks()` is true (stub drawing service signals).

- [ ] **Step 1: Write those tests with fakes, not a Viewer.**
- [ ] **Step 2: Run. Commit** `test: characterize entity-rubber empty-store flags`

---

### Task 4: Per-tool services and buttons (one cluster per tool)

**Files (each cluster = service spec + component spec; floating-window specs stay create-only unless they call a pure method):**
- `draw-mark`, `draw-line`, `draw-rectangle`, `draw-circle`, `draw-polygon`

Shared pattern: TestBed providers: zoneless, real tool service, fake `ViewerService`, fake `CursorCoordsService` (`cursorOnViewerCanvas: signal(true)`, `getCursorXY: () => undefined`), real or fake `DrawingService`, fake `ToolsService` (`drawingsBlocker: signal(false)`, `setDrawingsBlocker`).

Named tests per tool service (read the class; skip any method that only `viewer.scene.pick`):

1. Default `isActive()` is `false`.
2. Activation method (whatever the public API is — often a click handler on the component) sets `isActive()` true and does not throw.
3. Deactivation / `cancel` sets `isActive()` false.
4. `drawingsBlocker` true → activation no-ops if that guard exists.

Component specs: `should create` with the same fakes; if the template has a button calling activate, click it.

Do all five tools. Do not add `drawing-tool-blank`.

- [ ] **Step 1: drawMark cluster, run its two specs, commit.**
- [ ] **Step 2: drawLine cluster, run, commit.**
- [ ] **Step 3: drawRectangle cluster, run, commit.**
- [ ] **Step 4: drawCircle cluster, run, commit.**
- [ ] **Step 5: drawPolygon cluster, run, commit.**

Each commit message: `test: characterize <tool> activation without Cesium.Viewer`

---

### Task 5: ToolsService shared input + tools-panel create

**Files:**
- Modify: `src/app/planet/components/tools/services/tools-service/tools.service.spec.ts`
- Modify: `src/app/planet/components/tools/tools-panel.spec.ts`
- Modify: `src/app/planet/components/tools/lib/buttons-subgroups-visibility` — **create** `buttons-subgroups-visibility.spec.ts`

- [ ] **Step 1: ToolsService**

`drawingsBlocker` default false; `setDrawingsBlocker(true)` → true. Do not call `startToolsService` unless you fake `viewer.scene.canvas` and `ScreenSpaceEventHandler` — if constructor/start always new `ScreenSpaceEventHandler`, mock `Cesium.ScreenSpaceEventHandler` with `vi.spyOn` or skip start and park.

- [ ] **Step 2: buttons-subgroups-visibility**

DOM: two `div` ElementRefs. Default child + hidden children. `setNormalButtonsVisibility` sets `button-visibility=true` on default firstChild and `false` on hidden children. Empty default → returns `false`. `toggleAuxillarySubgroupVisibility` flips `true`/`false`.

- [ ] **Step 3: tools-panel** `should create` with fakes for every provided tool service it injects.

- [ ] **Step 4:** `npx ng test --no-watch` exit 0. Commit `test: characterize tools panel visibility helpers`
