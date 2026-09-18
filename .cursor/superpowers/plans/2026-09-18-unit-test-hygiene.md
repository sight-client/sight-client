# Unit-test hygiene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `npx ng test --no-watch` exit 0 on the current stub specs, with zoneless TestBed, a compiling Autofocus spec, and broken filenames fixed — without deepening behavior and without changing production.

**Architecture:** Characterization hygiene only. Provide mocks so constructors do not create `Cesium.Viewer`. Keep `drawing-tool-blank/**` and `use-api-serv-proxy/**` excluded. Remove Autofocus from exclude after its spec compiles.

**Tech Stack:** Angular 22 zoneless, Vitest 4.1, `@angular/build:unit-test`, jsdom

**Spec:** `.cursor/superpowers/specs/2026-09-18-sight-unit-test-suite-design.md`

## Global Constraints

- Vitest 4.1 via `ng test` (`@angular/build:unit-test`, jsdom). No Karma/Jasmine.
- `provideZonelessChangeDetection()` in every TestBed.
- `toBe(true)` / `toBe(false)`, not `toBeTrue()` / `toBeFalse()`.
- Do not create `Cesium.Viewer` / WebGL. Fake `ViewerService` as in the spec.
- Production TypeScript under `src/app` is frozen except if a spec cannot compile without a type-only import path fix — prefer fixing the spec.
- `drawing-tool-blank/**` and `use-api-serv-proxy/**` stay in `tsconfig.spec.json` and `angular.json` `test.exclude`.
- Do not add behavior assertions beyond `should create` / `should be created` in this plan.
- Skills: `.cursor/skills/sight-testing/SKILL.md`, `.cursor/skills/sight-change-control/SKILL.md`

---

### Task 1: Rename the caching interceptor spec

**Files:**
- Rename: `src/app/global/interceptors/caching-get-req-interceptor/caching-get-req,interceptor.spec.ts` → `caching-get-req.interceptor.spec.ts`
- Do not modify: `caching-get-req.interceptor.ts`

**Skills:** `.cursor/skills/sight-testing/SKILL.md`

- [ ] **Step 1: Rename the file**

Git mv (or delete+add) so the spec sits next to the interceptor:

`src/app/global/interceptors/caching-get-req-interceptor/caching-get-req.interceptor.spec.ts`

Keep the existing `should be created` body. Add zoneless if missing:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import cachingGetReqInterceptor from './caching-get-req.interceptor';

describe('cachingGetReqInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => cachingGetReqInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the renamed spec**

Run: `npx ng test --no-watch --include=src/app/global/interceptors/caching-get-req-interceptor/caching-get-req.interceptor.spec.ts`

Expected: PASS (create-only).

- [ ] **Step 3: Commit**

```bash
git add src/app/global/interceptors/caching-get-req-interceptor/
git commit -m "$(cat <<'EOF'
test: colocate caching GET interceptor spec filename

EOF
)"
```

---

### Task 2: AutofocusDirective compiles and is included

**Files:**
- Modify: `src/app/global/directives/autofocus-directive/autofocus.directive.spec.ts`
- Modify: `tsconfig.spec.json` (remove autofocus exclude)
- Modify: `angular.json` `projects.sight-client.architect.test.options.exclude` (remove autofocus entry)
- Do not modify: `autofocus.directive.ts`

**Skills:** `.cursor/skills/sight-testing/SKILL.md`

Current stub does `new AutofocusDirective()` with no `ElementRef` — it cannot compile.

- [ ] **Step 1: Write a TestBed spec that compiles**

Replace the spec. Do not assert focus timing beyond create (behavior is plan 1).

```typescript
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AutofocusDirective } from './autofocus.directive';

@Component({
  selector: 'host-autofocus',
  imports: [AutofocusDirective],
  template: `<input autofocusDirective />`,
})
class HostAutofocus {}

describe('AutofocusDirective', () => {
  let fixture: ComponentFixture<HostAutofocus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostAutofocus],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(HostAutofocus);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

- [ ] **Step 2: Confirm it fails to run while still excluded (optional sanity)** then **remove exclude**

From `tsconfig.spec.json` `exclude` delete:

`"src/app/global/directives/autofocus-directive/autofocus.directive.spec.ts"`

From `angular.json` test `exclude` delete the same path.

Leave blank and proxy excludes untouched.

- [ ] **Step 3: Run**

Run: `npx ng test --no-watch --include=src/app/global/directives/autofocus-directive/autofocus.directive.spec.ts`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/global/directives/autofocus-directive/autofocus.directive.spec.ts tsconfig.spec.json angular.json
git commit -m "$(cat <<'EOF'
test: include compiling AutofocusDirective spec

EOF
)"
```

---

### Task 3: Zoneless on remaining TestBeds

**Files (missing `provideZonelessChangeDetection` today):**
- Modify: `src/app/planet/components/user-menu/user-menu.spec.ts`
- Modify: `src/app/planet/components/tools/services/tools-service/tools.service.spec.ts`
- Modify: `src/app/planet/components/tools/tools-list/services/tools-list-kml-service/tools-list-kml.service.spec.ts`
- Modify: `src/app/planet/components/tools/tools-list/services/tools-list-report-service/tools-list-report.service.spec.ts`
- Modify: `src/app/planet/common/directives/app-cesium-directive/app-cesium.directive.spec.ts`
- Do not add zoneless to `coord-sistems.lib.spec.ts` (no TestBed).
- `stop-double-request.interceptor.spec.ts` — add zoneless if the file on disk still lacks it.

**Skills:** `.cursor/skills/sight-testing/SKILL.md`

- [ ] **Step 1: Patch each TestBed**

Pattern for services:

```typescript
TestBed.configureTestingModule({
  providers: [provideZonelessChangeDetection()],
});
```

User-menu: add `providers: [provideZonelessChangeDetection()]` next to `imports: [UserMenu]`.

AppCesiumDirective: stop constructing with class tokens. Use TestBed + fakes (still create-only):

```typescript
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection, signal } from '@angular/core';
import { AppCesiumDirective } from './app-cesium.directive';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';
import { MouseCoordsService } from '@/common/services/mouse-coords-service/mouse-coords.service';
import { ToolsService } from '@/components/tools/services/tools-service/tools.service';
import { ToolsListService } from '@/components/tools/tools-list/services/tools-list-service/tools-list.service';

describe('AppCesiumDirective', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AppCesiumDirective,
        { provide: ViewerService, useValue: { viewerHasLoaded: signal(false), getNewViewer: () => {}, setImageryProvider: () => {} } },
        { provide: MouseCoordsService, useValue: { startMouseCoordsService: () => {}, underMouseEntityHasLoaded: signal(false) } },
        { provide: ToolsService, useValue: { startToolsService: async () => {}, toolsServiceHasStarted: signal(false) } },
        { provide: ToolsListService, useValue: { startToolsListService: () => {} } },
      ],
    });
    expect(TestBed.inject(AppCesiumDirective)).toBeTruthy();
  });
});
```

Directive needs `ElementRef` — if inject fails, wrap a host component with `[appCesiumDirective]` on a `div` instead of injecting the directive directly. Keep `viewerHasLoaded` false so OSM is not set.

- [ ] **Step 2: Run the touched specs**

Run: `npx ng test --no-watch --include=src/app/planet/components/user-menu/user-menu.spec.ts`

Repeat for the other files in this task until each PASSes or the remaining failure is missing Cesium providers (Task 4).

- [ ] **Step 3: Commit**

```bash
git add src/app/planet/components/user-menu/user-menu.spec.ts src/app/planet/components/tools/services/tools-service/tools.service.spec.ts src/app/planet/components/tools/tools-list/services/tools-list-kml-service/tools-list-kml.service.spec.ts src/app/planet/components/tools/tools-list/services/tools-list-report-service/tools-list-report.service.spec.ts src/app/planet/common/directives/app-cesium-directive/app-cesium.directive.spec.ts
git commit -m "$(cat <<'EOF'
test: add zoneless TestBed to remaining stub specs

EOF
)"
```

---

### Task 4: Stub specs that construct Cesium or HTTP do not explode

**Files (likely failures from the 67-fail baseline):**
- Modify: `src/app/planet/planet.spec.ts`
- Modify: `src/app/app.spec.ts` (if theme services throw without DOM CSS vars — stub `SetUserThemeService` / `SetLightDarkModeService` only if create fails)
- Modify: `src/app/global/interceptors/show-progress-inrerceptor/show-progress.interceptor.spec.ts`
- Modify: any tool/component spec that `detectChanges()` into a missing `ViewerService`

**Skills:** `.cursor/skills/sight-testing/SKILL.md`, `.cursor/skills/sight-change-control/SKILL.md`

- [ ] **Step 1: Run the full suite once and list failures**

Run: `npx ng test --no-watch`

Record fail messages. Do not start rewriting behavior tests.

- [ ] **Step 2: Planet — fake ViewerService, do not boot a Viewer**

`Planet` imports `AppCesiumDirective`. After first CD, `afterNextRender` calls `getNewViewer`. Override `ViewerService` at TestBed with the spec fake (`getNewViewer` no-op, `viewerHasLoaded` false). Provide the other `Planet` services as the real classes **only if** their constructors do not touch `viewer.scene`; otherwise fake them too. `should create` must not call WebGL.

If `createComponent(Planet)` still pulls Cesium internals, skip `fixture.detectChanges()` in this plan and assert `component` is truthy after `createComponent` only — note that in the commit body. Prefer providing fakes so `detectChanges` can stay.

- [ ] **Step 3: ShowProgressInterceptor spec — provide HTTP testing**

Replace the incomplete spec (TestBed without `provideHttpClient` / `HttpTestingController`) with create-only that actually injects:

```typescript
import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ShowProgressInterceptor } from './show-progress.interceptor';

describe('ShowProgressInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: HTTP_INTERCEPTORS, useClass: ShowProgressInterceptor, multi: true },
      ],
    });
  });

  it('should be created', () => {
    expect(TestBed.inject(HttpClient)).toBeTruthy();
  });
});
```

Do not assert spinner on/off here (plan 1).

- [ ] **Step 4: Sweep remaining create failures**

For each remaining red spec: add `{ provide: ViewerService, useValue: fakeViewerService() }` and other constructor deps. Do not add extra `it(...)` cases.

- [ ] **Step 5: Full suite green**

Run: `npx ng test --no-watch`

Expected: exit 0, 0 failed, 0 unhandled. Output may log Cesium warnings — if they fail the run, mock the call site in the spec, do not change production.

- [ ] **Step 6: Commit**

```bash
git add src/app/planet/planet.spec.ts src/app/app.spec.ts src/app/global/interceptors/show-progress-inrerceptor/show-progress.interceptor.spec.ts
# plus any other spec patched in the sweep
git commit -m "$(cat <<'EOF'
test: keep stub suite green without Cesium.Viewer

EOF
)"
```

---

### Task 5: Confirm excludes and skill trap

**Files:**
- Verify: `tsconfig.spec.json`, `angular.json` still exclude blank and proxy
- Modify only if hygiene uncovered a new broken spec that must stay out — **ask**, do not expand exclude silently

**Skills:** `.cursor/skills/sight-testing/SKILL.md`

- [ ] **Step 1: Grep exclude lists**

Both files must still list:

- `drawing-tool-blank/**`
- `use-api-serv-proxy-interceptor/**`

Must **not** list autofocus.

- [ ] **Step 2: Full suite again**

Run: `npx ng test --no-watch`

Expected: PASS.

- [ ] **Step 3: Commit only if exclude files changed; otherwise skip**
