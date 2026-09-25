# Type holes Implementation Plan

> **Status:** executed 2026-09-25. History only — do not re-run. `strictPropertyInitialization` stays `false` (Task 3 step 3 not flipped).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove `any`, `Function`, and the Internet Explorer download branch from `src/**/*.ts` without turning on new TypeScript language features.

**Architecture:** Fix call sites first. Turn `strictPropertyInitialization` back on only after the `declare` fields that are assigned before use are either initialized or given a definite assignment that is actually true. Do not enable `noUnusedLocals` in this plan.

**Tech Stack:** TypeScript strict (already on), Angular 22

**SDD skills:** `.cursor/skills/sight-angular-ui/SKILL.md`, `.cursor/skills/sight-testing/SKILL.md`, `.cursor/skills/sight-client-security/SKILL.md`

## Global Constraints

- No `satisfies` rewrites for their own sake, no new TS 5.5+ syntax as the point of a change.
- `UserRegistrationData` stays a class. Do not replace Evgeniy's classes with an interface or object type, even when the file has no `instanceof` yet. He may add that check later.
- No commit unless Evgeniy asks.

---

### Task 1: Download and JSON helpers

**Files:**

- Modify: `src/app/global/lib/common-global.lib.ts`
- Spec: `src/app/global/lib/common-global.lib.spec.ts` if present, else create one

- [x] **Step 1: Spec `downloadBlob` creates an object URL and clicks an anchor. No `msSaveOrOpenBlob`.**
- [x] **Step 2: Delete the IE branch and the `as any` casts. Delete try/catch that only rethrows.**
- [x] **Step 3: `jsonNullToUndefined` takes `unknown` and returns `unknown` (or a generic `T`). `null` becomes `undefined`. Objects are walked without `any`.**
- [x] **Step 4: Run the lib spec.**

### Task 2: Callback input on the drawings list row

**Files:**

- Modify: `drawings-list-entity-info.ts` and its template callers

**Interfaces:**

- `@Input() callback?: (args: readonly unknown[]) => void` or, better, `@Output()` if the parent only needs a click. Keep the current click behavior: the row still invokes the parent action with the same arguments.

- [x] **Step 1: Replace `Function` and `Array<any>`.**
- [x] **Step 2: Run `drawings-list-entity-info.spec.ts`.**

### Task 3: `catch (error: any)` and `declare` without a type

- [x] **Step 1: `catch (error: unknown)` everywhere under `src/**/*.ts`. Access `.cause` only after `error instanceof Error` — and Task 2 of the error-reporting plan deletes the color cause anyway.**
- [x] **Step 2: `declare public readonly toolName` on tool buttons keeps the literal union from the tool's main service (`DrawingToolName`, `MeasuringToolName`, `CameraToolName`). Do not widen `toolName` to `string`.**
- [ ] **Step 3: Re-enable `strictPropertyInitialization` in `tsconfig.json` only if `npx ng build` (or the existing unit-test compile) is green. If it is not, list the remaining fields in this plan and stop. Do not flip the flag red.**

Flag stays `false`. First compile errors (output was truncated, this is not the full list):

- `@Input() checked` in `custom-switch-toggle.ts`
- `@Input() inMenu` in `light-dark-mode.ts`, `theme-color-palette.ts`, `user-account-features.ts`
- `latitude` / `longitude` / `height` and `x` / `y` / `z` in `coord-sistems.lib.ts`
- `@Input() contentTemplate` and `parentName` in `floating-window.ts`
- `@ViewChild` refs in `main-menu.ts` and `tools-panel.ts`
- `takingScreenshotTimout` in `take-screenshot.ts`
- `@Input() objInCollection` in `drawings-list-entity-info.ts`
- `toolName` / `id` / `show` in `drawings-list-kml.service.ts`
- `lng` / `lat` / `alt` in `basic-measure-calculations.lib.ts`

### Task 4: Theme and cursor `any`

- [x] **Step 1: `set-user-theme.service.ts`, `set-light-dark-mode.service.ts`, `cursor-coords.service.ts` — `unknown` in catch.**
- [x] **Step 2: Run their specs.**

### Task 5: `Function` and live `any`

- [x] **Step 1: `ToolOptions.callback` is `() => void`. Znemz `distanceLabelFormatter` is `(length: number, units: string) => string`. Cesium `prototype.update` hooks use that call signature, not `Function`.**
- [x] **Step 2: KML `properties` and `material` drop `any`. Spec calls `prepareKmlEntities` through a typed view of the private method. `CESIUM_BASE_URL` is `Record<string, unknown>`.**
- [x] **Step 3: `Cesium.Entity.toolName` is the three-group literal union in `src/cesium-entity.d.ts`. Live `@ts-ignore` on that field is removed. Import from KML assigns it only after `isDrawingToolName` / `isMeasuringToolName` / `isCameraToolName`.**
- [x] **Step 4: `Entity._children` and `ScreenSpaceEventHandler._initializer` live in the same declaration. Esc deactivation reads one `initializer`. `flyAroundWithoutPoint` stays a literal. `imageryProvider` is passed via `ConstructorOptions & { imageryProvider?: ImageryProvider }`, so the constructor literal no longer needs `@ts-ignore`.**
