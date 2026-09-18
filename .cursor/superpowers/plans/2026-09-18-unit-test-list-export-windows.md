# Unit-test list, export, floating windows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Characterize tools-list, KML/ODS export-import boundaries, and floating-window stack — sanitizing untrusted KML strings, no real file picker UI, no Cesium.Viewer.

**Architecture:** ODS via `odf-kit` in memory. KML: call sanitizing/helpers with fixture strings, not `javascript:` URLs surviving. Floating windows: `FloatingWindowsService` with `windowName === toolName`. Download helpers already covered in ui-theme (`getMomentName` / `downloadBlob`) — reuse, do not duplicate unless the list service wraps them.

**Tech Stack:** Vitest 4.1, odf-kit, DOMPurify, Angular TestBed

**Spec:** `.cursor/superpowers/specs/2026-09-18-sight-unit-test-suite-design.md`, `.cursor/superpowers/specs/2026-09-17-sight-map-tools-design.md`

**Depends on:** hygiene green. Prefer drawing/measuring plans first so stores exist, but this plan can fake `DrawingService` lists.

## Global Constraints

- Production frozen; park bugs.
- Untrusted KML/HTML: assert sanitize / rejection, never `innerHTML` of raw KML. Skill: `sight-client-security`.
- ODS import must land in drawing stores, not a parallel model — if a test would require changing that, park.
- Skills: `.cursor/skills/sight-testing/SKILL.md`, `.cursor/skills/sight-map-tools/SKILL.md`, `.cursor/skills/sight-client-security/SKILL.md`

---

### Task 1: FloatingWindowsService stack

**Files:**
- Modify: `src/app/planet/components/floating-windows/services/floating-windows-service/floating-windows.service.spec.ts`
- Modify: `floating-window.spec.ts`, `floating-windows-container.spec.ts`, `floating-windows-tabs-panel.spec.ts`, `tools-floating-windows.spec.ts` — create + bind to service signals if the template shows titles

`windowName` equals a drawing tool literal e.g. `'addMark'`.

- [ ] **Step 1:**

```typescript
it('adds a window keyed by toolName and can hide it', () => {
  const service = TestBed.inject(FloatingWindowsService);
  service.addWindowItem('addMark');
  const items = service /* read the actual signal name, e.g. windowsList() */;
  expect(items.some((w) => w.windowName === 'addMark' || w === 'addMark')).toBe(true);
  service.hideWindowByToolName('addMark', new MouseEvent('click'));
  // assert hidden/collapsed signal on that item is true (read actual field names)
});
```

Also: `deleteWindowItem` removes it; `setActiveWindow` marks one active; `unsetActiveForAllWindows` clears. `collapseWindow` / `expandWindow` toggle `collapsed`. Clamp/top math: if `getWindowHeaderHeight` is independently callable, characterize return `true`/`false` on invalid val.

Use a real `MouseEvent` so `event.preventDefault` in production does not throw.

- [ ] **Step 2: Component specs stay `should create` unless they call `addWindowItem` on init — then fake the service.**
- [ ] **Step 3: Run. Commit** `test: characterize floating window stack by toolName`

---

### Task 2: ToolsListService list operations

**Files:**
- Modify: `src/app/planet/components/tools/tools-list/services/tools-list-service/tools-list.service.spec.ts`
- Modify: `src/app/planet/components/tools/tools-list/tools-list.spec.ts` (create)
- Modify: `tools-list-entity-info.spec.ts` (create + displayed name if `@Input`)

Do not call `startToolsListService` if it requires a loaded Viewer; fake `viewerHasLoaded` / dataSources.

Characterize: rename of an entity in a stub group if there is a public method; fly-to must be skipped or the camera `flyTo` mocked (`vi.fn()`).

- [ ] **Step 1: Read public methods; add one test per method that does not pick/WebGL.**
- [ ] **Step 2: Run. Commit** `test: characterize tools-list service without Viewer`

---

### Task 3: KML export/import sanitization

**Files:**
- Modify: `src/app/planet/components/tools/tools-list/services/tools-list-kml-service/tools-list-kml.service.spec.ts`

- [ ] **Step 1: Fixtures**

Minimal KML string with a Placemark name `TestMark`. If export is `exportKml()` reading drawing stores, stub `DrawingService.addMarkEntitiesList` as `signal([{ groupId: 'g1', defaultEntity: new Cesium.Entity({ name: 'TestMark' }), ... }])` matching `EntitiesGroup`.

Import: pass a KML containing `<description><script>alert(1)</script></description>` or `javascript:alert(1)` href. Assert DOMPurify-cleaned output / entity description does not contain `javascript:` or `<script`. If the service never sanitizes (bug), **park** — do not add DOMPurify in production here.

Do not execute KML. Do not network.

- [ ] **Step 2: Run. Commit** `test: characterize KML export fixtures and unsafe-string handling`

---

### Task 4: ODS report export/import

**Files:**
- Modify: `src/app/planet/components/tools/tools-list/services/tools-list-report-service/tools-list-report.service.spec.ts`

Public API: `provideReport()`. Import path uses private `getPseudoEntitiesFromReport` via `provideReport` / file input — if only private, characterize through the public import method (read the file for the public name; likely a change handler on tools-list).

- [ ] **Step 1: Empty stores**

`provideReport` with empty `drawingStores` / all lists empty: expect `alert` spy with `'Сущшости для ods-документа отсутствуют'` **or** `'Developer error'` depending on whether store names exist. Read the branches: no store names → `formReport` undefined → `'Developer error'`; names but no rows → `null` → Russian alert. Spy `window.alert`. Spy `SetCursorProgressSpinnerService` on then off (`finalize` style `finally`).

- [ ] **Step 2: One mark group**

Stub one `addMark` group with a `Cesium.Entity` whose position is `Cartesian3.fromDegrees(37.6173, 55.7558, 0)`. Stub `MouseCoordsService.selectedCrs` as `signal('WGS-84')`. If you can call the public export and intercept `OdsDocument.save` / `URL.createObjectURL`, assert blob type contains `opendocument` or that `save` was called. If `provideReport` is too I/O heavy, extract nothing from production — instead spy `HTMLAnchorElement.click`.

- [ ] **Step 3: Import SK-42 m meters**

Build a minimal `OdsDocument` (or the model `getPseudoEntitiesFromReport` expects) with GK meters in lon/lat columns and CRS `'СК-42 м'`. If the only entry is private, use `service as any` **only** if the plan cannot reach it publicly; prefer public import. Expect `CoordSystems.toWGS84Cartographic` result finite (this is the parked-risk from 2026-09-18 geodesy work — if NaN, park, do not change `coord-sistems.lib.ts` in this plan).

- [ ] **Step 4: Run. Commit** `test: characterize ODS empty-store alerts and SK-42 m import path`

---

### Task 5: Full suite gate

- [ ] **Step 1:** `npx ng test --no-watch` exit 0.
- [ ] **Step 2:** Append parked bugs (if any) to `.cursor/superpowers/log/YYYY-MM-DD.md` in the executing session, not here.
- [ ] **Step 3: Commit only if Step 1 required extra spec fixes.**
