# Cursor canvas resize Implementation Plan

> **Status:** executed 2026-09-25. History only — do not re-run.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After the viewer starts, a window resize updates the canvas center the mobile cursor uses.

**Architecture:** `CursorCoordsService` is provided on `Planet`, so `ngOnDestroy` runs when that injector is destroyed. `@HostListener` on an `@Injectable()` does not run. Replace it with `fromEvent(window, 'resize')`, the same RxJS style as `mousemove`. Re-read `viewer.scene.canvas` on each resize so a replaced canvas is picked up.

**Tech Stack:** Angular 22, RxJS `fromEvent`, Vitest + jsdom

**SDD skills:** `.cursor/skills/sight-cesium-map/SKILL.md`, `.cursor/skills/sight-testing/SKILL.md`

## Global Constraints

- Do not create a real `Cesium.Viewer` in the unit test.
- Do not change desktop mouse picking, only the stored center used when `isMobile` is true.
- No commit unless Evgeniy asks.

---

### Task 1: Resize subscription

**Files:**
- Modify: `src/app/planet/common/services/cursor-coords-service/cursor-coords.service.ts`
- Test: `src/app/planet/common/services/cursor-coords-service/cursor-coords.service.spec.ts`

**Interfaces:**
- `startCursorCoordsService` calls `bindCanvasResize()` after the canvas exists
- `ngOnDestroy` unsubscribes `resizeSubscription` along with the existing move subscriptions
- `syncCanvasCenter()` sets `canvas`, `canvasCenterX = scrollWidth / 2`, `canvasCenterY = scrollHeight / 2`

- [x] **Step 1: Spec — stub canvas `scrollWidth`/`scrollHeight`, call `bindCanvasResize`, dispatch `resize`, expect the new center. `ngOnDestroy` in `afterEach`.**
- [x] **Step 2: Remove `@HostListener`. Implement the subscription.**
- [x] **Step 3: `npx ng test --no-watch --include=src/app/planet/common/services/cursor-coords-service/cursor-coords.service.spec.ts`.**
