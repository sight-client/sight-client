# Unit-test viewer / CRS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Characterize CRS conversion, humanify formatters, cursor-coords (with Viewer fake), scene-mode persistence, and camera-tool services — without creating `Cesium.Viewer`.

**Architecture:** Libs called directly. `ViewerService` methods that only set signals can run on the real class if they do not construct a Viewer; `getNewViewer` is never called. Mouse-coords uses the fake from the unit-test spec.

**Tech Stack:** Vitest 4.1, proj4, Cesium math (no WebGL), Angular TestBed

**Spec:** `.cursor/superpowers/specs/2026-09-18-sight-unit-test-suite-design.md` and `.cursor/superpowers/specs/2026-09-17-sight-viewer-crs-design.md`

**Depends on:** hygiene plan green.

## Global Constraints

- Characterization as-is; production frozen; park bugs.
- No `Cesium.Viewer`, no WebGL, no `getNewViewer` in tests.
- Geodesy: `toBeCloseTo`; SK-42 m autozone rules from `.cursor/skills/sight-geodesy/SKILL.md`.
- Keep existing `coord-sistems.lib.spec.ts` cases; add missing CRS, do not delete Moscow/autozone tests.
- Skills: `.cursor/skills/sight-testing/SKILL.md`, `.cursor/skills/sight-geodesy/SKILL.md`, `.cursor/skills/sight-cesium-map/SKILL.md`

---

### Task 1: CoordSystems remaining CRS

**Files:**
- Modify: `src/app/planet/common/lib/coord-sistems.lib.spec.ts`

Moscow fixture already in file (`longitude: 37.6173`, `latitude: 55.7558`).

- [ ] **Step 1: Add cases (must pass on current lib)**

1. `fromWGS84Cartographic('WGS-84', MOSCOW_WGS84)` round-trips through `toWGS84Cartographic` with `toBeCloseTo(..., 6)`.
2. `'СК-42 °'` forward+back: longitude/latitude stay near Moscow degrees, not GK meters (`longitude < 180`).
3. `'ПЗ-90.11'` forward+back `toBeCloseTo` 4 digits.
4. Explicit SK-42 m zone `7` vs `8` already exists — do not regress.
5. `toWGS84Cartographic('СК-42 м', { longitude: 7376173, latitude: 6180000, height: 0 }, '')` yields finite WGS degrees (easting-derived zone). If this fails — park; do not "fix" DEFS.

- [ ] **Step 2: Run** `npx ng test --no-watch --include=src/app/planet/common/lib/coord-sistems.lib.spec.ts`

Expected: PASS (including the four existing tests).

- [ ] **Step 3: Commit** `test: characterize WGS-84, SK-42 deg, and PZ-90 CRS round-trips`

---

### Task 2: humanify.lib

**Files:**
- Create: `src/app/planet/common/lib/humanify.lib.spec.ts`

- [ ] **Step 1: Literal expectations (do not call formatters to build `want`)**

```typescript
import { formatDec, formatNumber, distanceM, distanceKm, areaM, areaKm, latitude, longitude } from './humanify.lib';

it('formatDec applies south as negative', () => {
  expect(formatDec(55, 45, 0, 'S')).toBeCloseTo(-55.75, 6);
});

it('formatNumber uses comma decimals and grouped thousands above 9999', () => {
  expect(formatNumber(12345.6, 1)).toBe('12 345,6');
});

it('distanceM switches to km text at 1000 m', () => {
  expect(distanceM(0)).toMatch(/0/);
  expect(distanceM(1500)).toMatch(/км|km|1/i);
});
```

Read `distanceM` / `areaKm` / `latitude` bodies and assert the **actual** Russian unit strings and sign (`N`/`S`). `longitude(..., dms)` / `latitude(..., dms)` for a known degree.

- [ ] **Step 2: Run the new spec. Expected: PASS.**
- [ ] **Step 3: Commit** `test: characterize humanify distance, area, and DMS formatters`

---

### Task 3: ViewerService signals without a Viewer

**Files:**
- Modify: `src/app/planet/common/services/viewer-service/viewer.service.spec.ts`

- [ ] **Step 1: Do not call `getNewViewer`**

Provide `SetProgressSpinnerService`. `localStorage.sceneMode = '2D'` before `TestBed.inject`: `nowSceneModeDescription()` is `'2D'`. Invalid/missing storage → `'3D'`. `setClampToGround(false)` → `clampToGroundSignal() === false`. `setNowSceneMode(Cesium.SceneMode.COLUMBUS_VIEW)` → description `'Columbus'`.

If constructor `effect` touches `this.viewer.clampToGround` on the empty `{} as CustomViewer`, characterize that it does not throw (current `viewer?.clampToGround !== undefined` guard).

- [ ] **Step 2: Run. PASS. Commit** `test: characterize ViewerService scene-mode signals without Viewer`

---

### Task 4: CursorCoordsService (extend existing spec)

**Files:**
- Modify: `src/app/planet/common/services/cursor-coords-service/cursor-coords.service.spec.ts`

Keep the mobile `getCursorXY` / `cursorOnViewerCanvas` tests.

- [ ] **Step 1: Additional characterizations**

Desktop (`CheckMobileDeviceService` `{ checkMobile: () => false, isMobile: false }`): `getCursorXY` without event returns `undefined` (or whatever the code does — read `getCursorXY`). `setSelectedCrs('СК-42 м')` updates `selectedCrs()`.

Do not call `startCursorCoordsService` unless the fake `viewer.scene.canvas` is set — that method throws `'Scene canvas is undefined!'` when missing; one test may assert that throw.

- [ ] **Step 2: Run. PASS. Commit.**

---

### Task 5: Scene mode UI, camera tools, mouse HUD, Planet create

**Files:**
- Modify: `src/app/planet/components/tools/camera-view-tools/components/scene-mode-changer/scene-mode-changer.spec.ts`
- Modify: `src/app/planet/components/tools/camera-view-tools/services/camera-view-tools-service/camera-view-tools-service.spec.ts` (filename stays; production is `camera-view-tools.service.ts`)
- Modify: `src/app/planet/components/tools/camera-view-tools/components/fly-around/**/*.spec.ts` and `take-screenshot.spec.ts` — create + any method that only toggles a flag on the fake viewer
- Modify: `src/app/planet/components/cursor-coords-info/cursor-coords-info.spec.ts` — create; CRS select calls `setSelectedCrs` if the template has a control
- Modify: `src/app/planet/components/camera-position-tools/camera-height-tool/camera-height-tool.spec.ts` — create with fake viewer
- Modify: `src/app/planet/components/camera-position-tools/znemz-navigation-mixin/znemz-navigation-mixin.spec.ts` — create only (mixin needs viewer; do not instantiate Cesium widget)
- Modify: `src/app/planet/planet.spec.ts` — keep create-only with fakes from hygiene
- Modify: `src/app/planet/common/directives/run-viewer-directive/run-viewer.directive.spec.ts` — with `viewerHasLoaded` false, `setImageryProvider` is **not** called (spy)

SceneModeChanger: fake `viewerHasLoaded: signal(true)`, `viewer.scene.mode = 3`, `morphTo2D: vi.fn()`, `setNowSceneMode: vi.fn()`, `setDrawingsBlocker: vi.fn()`. Invoke `changeSceneMode` (via click or component instance). Expect `morphTo2D` called, `setNowSceneMode` with `SCENE2D`, and after fake timers 2000 ms `localStorage.sceneMode === '2D'`. Use `vi.useFakeTimers()`.

`pointView` has no UI — do not invent a button test.

- [ ] **Step 1: Implement named tests.**
- [ ] **Step 2:** `npx ng test --no-watch` exit 0.
- [ ] **Step 3: Commit** `test: characterize scene mode, mouse HUD, and camera tools without Viewer`
