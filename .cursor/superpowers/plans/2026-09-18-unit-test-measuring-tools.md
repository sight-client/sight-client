# Unit-test measuring tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Characterize geodesic length/area helpers and measuring-tool names/activation the same way as drawing — Turf/EllipsoidGeodesic in jsdom, fake Viewer, no canvas picks.

**Architecture:** `basic-measure-calculations.lib.ts` is the only length/area implementation (map-tools spec). Tool services get the same fake stack as drawing. Do not use `Cartesian3.distance` as the expected value for geodesic tests.

**Tech Stack:** Vitest 4.1, Cesium ellipsoid math, Turf, Angular TestBed

**Spec:** `.cursor/superpowers/specs/2026-09-18-sight-unit-test-suite-design.md`, `.cursor/superpowers/specs/2026-09-17-sight-map-tools-design.md`, geodesy rules in `.cursor/skills/sight-geodesy/SKILL.md`

**Depends on:** hygiene green.

## Global Constraints

- Production frozen; park bugs.
- Lengths: `calculatePosDistancesWhithoutHumanify` (geodesic + height). Areas: Turf in `calculateAreaWithTurfWhithoutHumanify`.
- `toBeCloseTo` for meters/m². Humanify strings: match `/км|м/` rather than mirroring `Humanify.distanceM` output by calling it in `want`.
- Skills: `.cursor/skills/sight-testing/SKILL.md`, `.cursor/skills/sight-map-tools/SKILL.md`, `.cursor/skills/sight-geodesy/SKILL.md`

---

### Task 1: basic-measure-calculations.lib

**Files:**
- Create: `src/app/planet/components/tools/lib/basic-measure-calculations.lib.spec.ts`

Use `Cesium.Cartesian3.fromDegrees`.

Moscow–Saint Petersburg roughly 600–650 km surface; a tiny triangle around 37.6°E 55.75°N for area.

- [ ] **Step 1:**

```typescript
import * as Cesium from 'cesium';
import {
  calculatePosDistancesWhithoutHumanify,
  calculatePosDistances,
  calculateAreaWithTurfWhithoutHumanify,
  calculateAreaWithTurf,
  transformCartesianArrayToWGS84Array,
} from './basic-measure-calculations.lib';

const moscow = Cesium.Cartesian3.fromDegrees(37.6173, 55.7558, 0);
const spb = Cesium.Cartesian3.fromDegrees(30.3351, 59.9343, 0);

it('returns 0 for empty or single-point distance', () => {
  expect(calculatePosDistancesWhithoutHumanify([])).toBe(0);
  expect(calculatePosDistancesWhithoutHumanify([moscow])).toBe(0);
});

it('geodesic Moscow to Saint Petersburg is hundreds of kilometers', () => {
  const m = calculatePosDistancesWhithoutHumanify([moscow, spb]);
  expect(m).toBeGreaterThan(600_000);
  expect(m).toBeLessThan(750_000);
});

it('adds height hypotenuse on top of surface distance', () => {
  const a = Cesium.Cartesian3.fromDegrees(37.6173, 55.7558, 0);
  const b = Cesium.Cartesian3.fromDegrees(37.6173, 55.7558, 300);
  const m = calculatePosDistancesWhithoutHumanify([a, b]);
  expect(m).toBeCloseTo(300, 0);
});

it('Turf area is 0 for fewer than 3 positions', () => {
  expect(calculateAreaWithTurfWhithoutHumanify([moscow, spb])).toBe(0);
});

it('Turf area of a small closed triangle is positive', () => {
  const p0 = Cesium.Cartesian3.fromDegrees(37.60, 55.75, 0);
  const p1 = Cesium.Cartesian3.fromDegrees(37.61, 55.75, 0);
  const p2 = Cesium.Cartesian3.fromDegrees(37.61, 55.76, 0);
  const area = calculateAreaWithTurfWhithoutHumanify([p0, p1, p2]);
  expect(area).toBeGreaterThan(0);
});
```

Also: empty `transformCartesianArrayToWGS84Array([])` → `[]`; one point has `lng`/`lat` near 37.62 / 55.76 (`toBeCloseTo` 2). Humanified `calculatePosDistances([])` uses `Humanify.distanceM(0)` — assert it is a non-empty string containing `0`.

Do not add tests for the commented legacy `getCartesian3FromPX` block.

- [ ] **Step 2: Run the spec. PASS.**
- [ ] **Step 3: Commit** `test: characterize geodesic distance and Turf area helpers`

---

### Task 2: measuring tool names

**Files:**
- Modify: `src/app/planet/components/tools/measuring-tools/services/measure-service/measure.service.spec.ts`

- [ ] **Step 1:**

```typescript
import { measuringToolsNames, getRusMeasuringToolName } from './measure.service';

it('maps frozen measuring literals to Russian labels', () => {
  expect([...measuringToolsNames]).toEqual([
    'linearMeasurements',
    'rectangleAreaMeasurements',
    'circleAreaMeasurements',
    'polygonalAreaMeasurements',
  ]);
  expect(getRusMeasuringToolName('linearMeasurements')).toBe('Дистанция');
  expect(getRusMeasuringToolName('rectangleAreaMeasurements')).toBe('Прямоугольная площадь');
  expect(getRusMeasuringToolName('circleAreaMeasurements')).toBe('Площадь окружности');
  expect(getRusMeasuringToolName('polygonalAreaMeasurements')).toBe('Площадь многоугольника');
});
```

- [ ] **Step 2: Run. Commit** `test: characterize measuring tool name literals`

---

### Task 3: MeasureService stores (mirror drawing Task 2)

**Files:**
- Modify: `src/app/planet/components/tools/measuring-tools/services/measure-service/measure.service.spec.ts`

Read public getters (`isLinear` etc. — use actual names). Empty → false. Push a group with `toolName: 'linearMeasurements'` if the API matches drawing; else characterize the real method names. Cleanup empties the flag.

Skip methods that only pick the globe.

- [ ] **Step 1: Implement. Run. Commit.**

---

### Task 4: Four measuring tools (clusters)

**Files:** service + component (+ floating-window create) for:

- `linear-measurements`
- `rectangle-area-measurements`
- `circle-area-measurements`
- `polygonal-area-measurements`

Same fakes as drawing Task 4. Named tests: `isActive` false by default; activate/deactivate; `drawingsBlocker` guard if present.

Linear: if a method computes length from an entity positions array via `calculatePosDistances`, feed two Cartesians and assert the string is non-empty. Do not reimplement geodesic in the spec.

- [ ] **Step 1–4:** one cluster per commit: `test: characterize <tool> activation without Cesium.Viewer`
- [ ] **Step 5:** `npx ng test --no-watch` exit 0.
