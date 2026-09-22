# Mobile UI chrome Implementation Plan

> **Status:** executed 2026-09-22 (Tasks 1–8 on 2026-09-21, visual follow-ups through 2026-09-22). History only — do not re-run.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Same Sight widgets on ≤767: 44px hit-area, no overlap, UA virtual cursor without `maxTouchPoints`, fullscreen as a CameraViewTools button.

**Architecture:** Layout is CSS mixins plus `matchMedia` signals on the existing `CheckMobileDeviceService` (no second device service). `isMobile` stays UA-only and keeps driving the center `+` cursor, drawing-from-center, and mixin skip. Phone overlay sidenav, coords chevron, and “create window collapsed” bind to `phoneLayout` (≤520). Windows sit on the left when tabs are top-right (`narrowChromeLayout` ≤1660). New `ToggleFullscreen` copies `take-screenshot.ts`; Cesium’s corner button is off; the znemz compass+zoom block drops into that corner as one unit.

**Tech Stack:** Angular 22 zoneless, SCSS mixins `tablet`/`mobile`/`laptop`, Cesium `Fullscreen`, Vitest 4.1

**Spec:** `.cursor/superpowers/specs/2026-09-21-mobile-ui-chrome-design.md`

**SDD skills (put in every task brief; do not dump the catalog):** `.cursor/skills/sight-a11y-touch/SKILL.md`, `.cursor/skills/sight-angular-ui/SKILL.md`, `.cursor/skills/sight-map-tools/SKILL.md`

## File map

| File | Role |
|---|---|
| `src/app/global/services/check-mobile-device-service/check-mobile-device.service.ts` | UA `isMobile` + layout signals |
| `src/index.html` | `viewport-fit=cover` |
| `src/app/global/styles/common-global.scss` | `--regular-btn-size: 44px` inside `tablet` |
| `src/app/planet/common/styles/common-core.scss` | compact/phone positions, drop Cesium fullscreen chrome |
| `src/app/planet/planet.html` / `planet.scss` | sidenav by `phoneLayout`; toggle ≥44px; safe-area |
| `src/app/planet/components/tools/tools-panel.ts` / `.scss` | register fullscreen tool; phone center; chevron ≥ button |
| `src/app/planet/components/cursor-coords-info/*` | phone chevron collapse |
| `src/app/planet/components/camera-position-tools/camera-height-tool/camera-height-tool.ts` | phone stack width via CSS class already on host inner div |
| `src/app/planet/components/floating-windows/**` | left when tabs top-right; phone starts collapsed |
| `src/app/planet/components/tools/camera-view-tools/components/toggle-fullscreen/` | new tool |
| `src/app/planet/common/services/viewer-service/viewer.service.ts` | `fullscreenButton: false` |
| `src/app/planet/components/camera-position-tools/znemz-navigation-mixin/znemz-navigation-mixin.scss` | lower compass+zoom as a unit |
| as-is specs + `.cursor/skills/sight-a11y-touch/SKILL.md` | product contract after behavior lands |

Do **not** touch `DeviceService` / `mouse-coords-info` (legacy parallel). Do **not** rewrite `renderToolsGroupTemplates` / `moveToolToDefault`. Do **not** wrap height+coords in a shared DOM parent.

## Global Constraints

- Spec `.cursor/superpowers/specs/2026-09-21-mobile-ui-chrome-design.md` is normative.
- `provideZonelessChangeDetection()` in every new/changed TestBed.
- Vitest matchers (`toBe(true)`), not Jasmine.
- Breakpoints only from `media-breakpoints-global.scss`: `tablet` ≤767, `mobile` ≤520, `laptop` ≤1080. Existing `max-width: 1660px` for tabs stays; do not add new px thresholds except that one already in `common-core.scss`.
- `--regular-btn-size` is 32px above 767 and 44px at `tablet` (covers compact and phone).
- `isMobile` / `checkMobile()` = UA-regex only. Never `maxTouchPoints` / `ontouchstart`.
- Layout JS = `phoneLayout` / `laptopLayout` / `narrowChromeLayout` from `matchMedia`, never UA.
- Tool `toolName` = `toggleFullscreen`, tooltip/aria «На весь экран», `matTooltipShowDelay="1000"`.
- No Playwright, PWA, dock, MatDialog, `visualViewport`, i18n, landscape grid.
- Do not commit unless Evgeniy asks (skip git commit steps).
- Worker must Read the three skill files in this plan’s brief **before** coding.
- Console: run allowlisted commands immediately (`npx ng test`, `npm test`, `npm start`, `git status`/`diff`/`log`/`show`/`add`/`commit`, `ls`, `head`, `dir`, `Get-ChildItem`). One Shell call = one allowlisted command. Never `git diff --no-index` or `/dev/null` (Auto-review cards those even with a `git diff` prefix). Do **not** prompt Evgeniy and do **not** set `request_smart_mode_approval`. If Auto-review still blocks an allowlisted command, return BLOCKED to the parent — the parent reruns it. Ask only for `git push`, amend, `--no-verify`, deploy, or destructive deletes.

---

### Task 1: Two detectors on CheckMobileDeviceService

**Skills:** `.cursor/skills/sight-a11y-touch/SKILL.md`, `.cursor/skills/sight-angular-ui/SKILL.md`, `.cursor/skills/sight-testing/SKILL.md`

**Files:**
- Modify: `src/app/global/services/check-mobile-device-service/check-mobile-device.service.ts`
- Modify: `src/app/global/services/check-mobile-device-service/check-mobile-device.service.spec.ts`

**Interfaces:**
- Consumes: `navigator.userAgent`, `window.matchMedia`
- Produces:
  - `readonly isMobile: boolean` — set once in constructor from `checkMobile()`
  - `checkMobile(): boolean` — UA regex `/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i` only
  - `readonly phoneLayout: Signal<boolean>` — `(max-width: 520px)`
  - `readonly laptopLayout: Signal<boolean>` — `(max-width: 1080px)`
  - `readonly narrowChromeLayout: Signal<boolean>` — `(max-width: 1660px)`

- [ ] **Step 1: Rewrite the failing/updated tests**

Replace the `maxTouchPoints` case. Stub `matchMedia` **before** `TestBed.inject` when asserting layout signals. Recreate the service per test (`TestBed.resetTestingModule` or inject after stubs).

```typescript
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { CheckMobileDeviceService } from './check-mobile-device.service';

function stubMatchMedia(matchesByQuery: Record<string, boolean>): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: !!matchesByQuery[query],
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  }));
}

describe('CheckMobileDeviceService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createService(): CheckMobileDeviceService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    return TestBed.inject(CheckMobileDeviceService);
  }

  it('checkMobile is true when userAgent matches iPhone', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      maxTouchPoints: 0,
    });
    stubMatchMedia({});
    expect(createService().checkMobile()).toBe(true);
  });

  it('checkMobile is false when desktop UA has maxTouchPoints', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 2,
    });
    stubMatchMedia({});
    const service = createService();
    expect(service.checkMobile()).toBe(false);
    expect(service.isMobile).toBe(false);
  });

  it('phoneLayout follows max-width 520px matchMedia, not UA', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    });
    stubMatchMedia({ '(max-width: 520px)': true });
    const service = createService();
    expect(service.isMobile).toBe(false);
    expect(service.phoneLayout()).toBe(true);
  });

  it('narrowChromeLayout follows max-width 1660px', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      maxTouchPoints: 0,
    });
    stubMatchMedia({ '(max-width: 1660px)': true, '(max-width: 1080px)': true });
    const service = createService();
    expect(service.narrowChromeLayout()).toBe(true);
    expect(service.laptopLayout()).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — UA+touch case must FAIL on current code**

Run: `npx ng test --no-watch --include=src/app/global/services/check-mobile-device-service/check-mobile-device.service.spec.ts`

Expected: FAIL — `checkMobile is false when desktop UA has maxTouchPoints` (current code ORs `maxTouchPoints`).

- [ ] **Step 3: Implement the service**

```typescript
import { Injectable, signal, Signal } from '@angular/core';

const UA_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
const PHONE_MQ = '(max-width: 520px)';
const LAPTOP_MQ = '(max-width: 1080px)';
const NARROW_MQ = '(max-width: 1660px)';

@Injectable({ providedIn: 'root' })
export class CheckMobileDeviceService {
  readonly isMobile: boolean;
  readonly phoneLayout: Signal<boolean>;
  readonly laptopLayout: Signal<boolean>;
  readonly narrowChromeLayout: Signal<boolean>;

  private readonly _phoneLayout = signal(false);
  private readonly _laptopLayout = signal(false);
  private readonly _narrowChromeLayout = signal(false);

  constructor() {
    this.isMobile = this.checkMobile();
    this.phoneLayout = this._phoneLayout.asReadonly();
    this.laptopLayout = this._laptopLayout.asReadonly();
    this.narrowChromeLayout = this._narrowChromeLayout.asReadonly();
    this.bindQuery(PHONE_MQ, this._phoneLayout);
    this.bindQuery(LAPTOP_MQ, this._laptopLayout);
    this.bindQuery(NARROW_MQ, this._narrowChromeLayout);
  }

  public checkMobile(): boolean {
    return UA_MOBILE.test(navigator.userAgent);
  }

  private bindQuery(query: string, target: ReturnType<typeof signal<boolean>>): void {
    const mq = window.matchMedia(query);
    target.set(mq.matches);
    const onChange = (event: MediaQueryListEvent) => target.set(event.matches);
    mq.addEventListener('change', onChange);
  }
}
```

- [ ] **Step 4: Re-run**

Run: `npx ng test --no-watch --include=src/app/global/services/check-mobile-device-service/check-mobile-device.service.spec.ts`

Expected: PASS.

---

### Task 2: 44px hit-area, viewport-fit, safe-area, chevrons

**Skills:** `.cursor/skills/sight-a11y-touch/SKILL.md`, `.cursor/skills/sight-angular-ui/SKILL.md`

**Files:**
- Modify: `src/index.html` (viewport meta)
- Modify: `src/app/global/styles/common-global.scss` (`:root` already has `--regular-btn-size: 32px`; add tablet override)
- Modify: `src/app/planet/components/tools/tools-panel.scss` (chevron min size at tablet)
- Modify: `src/app/planet/planet.scss` (sidenav toggle min size at tablet; header safe-area)

**Interfaces:**
- Consumes: `--regular-btn-size`, mixin `tablet`
- Produces: 44px buttons/chevrons/toggle on ≤767; `viewport-fit=cover`; edge offsets `15px + env(safe-area-inset-*, 0px)`

- [ ] **Step 1: Viewport**

In `src/index.html` replace the viewport meta with:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```

- [ ] **Step 2: Button token at tablet**

At the end of `src/app/global/styles/common-global.scss` (file already `@use`s `media-breakpoints-global`):

```scss
@include media-breakpoints-global.tablet {
  :root {
    --regular-btn-size: 44px;
  }
}
```

That scales `.tool-panel-button`, menu, height-tool height, mixin zoom buttons — all already use the token.

- [ ] **Step 3: Tools chevrons not narrower than the button**

In `tools-panel.scss`, after the existing `.tool-chevron-button` block, add:

```scss
@use 'media-breakpoints-global';

@include media-breakpoints-global.tablet {
  .tool-chevron-button {
    min-width: var(--regular-btn-size);
    width: var(--regular-btn-size);
  }
}
```

If `@use` cannot sit mid-file, put `@use 'media-breakpoints-global';` at the **top** of `tools-panel.scss` (first line after any charset). Do not leave chevron at `calc(var(--regular-btn-size) / 3)` on ≤767.

- [ ] **Step 4: Sidenav toggle ≥44px on tablet; header safe-area**

In `planet.scss` `.header-buttons-container`:

```scss
left: calc(15px + env(safe-area-inset-left, 0px));
top: calc(15px + env(safe-area-inset-top, 0px));
```

After `.sight-main-sidenav-toggle-button` block, add (file must `@use 'media-breakpoints-global'` at top if not already):

```scss
@include media-breakpoints-global.tablet {
  .sight-main-ui-container .sight-main-sidenav-toggle-button {
    min-width: var(--regular-btn-size);
    width: var(--regular-btn-size);
  }
}
```

Keep current height `calc(var(--regular-btn-size) * 2)`.

- [ ] **Step 5: No unit-test required for tokens** (jsdom does not apply these mixins reliably). Visual check is Task 8. Run existing suite slice if you touched TS: none in this task.

Run: `npx ng test --no-watch --include=src/app/planet/planet.spec.ts`

Expected: PASS (unchanged bindings yet).

---

### Task 3: Compact and phone widget positions (CSS)

**Skills:** `.cursor/skills/sight-a11y-touch/SKILL.md`, `.cursor/skills/sight-angular-ui/SKILL.md`

**Files:**
- Modify: `src/app/planet/common/styles/common-core.scss` — fill empty `tablet` / `mobile` mixins; laptop block stays
- Modify: `src/app/planet/components/tools/tools-panel.scss` — only if center transform must live on `:host` (prefer `common-core` like today’s `left: 194px !important`)

**Interfaces:**
- Consumes: mixins `laptop` / `tablet` / `mobile`; classes `.camera-height-container`, `.coords-container-main`, `.tools-panel-container`, `.header-buttons-container`
- Produces: compact = current laptop positions + 44px token; phone = centered 46% stack, tools center bottom; **no** shared wrapper

`laptop` already applies at ≤1080 (includes phone). Phone rules **must** override with `!important` the same way laptop does.

- [ ] **Step 1: Phone positions in `common-core.scss` `mobile` mixin**

Replace the empty/commented `@include media-breakpoints-global.mobile` body with:

```scss
@include media-breakpoints-global.mobile {
  .header-buttons-container {
    left: calc(15px + env(safe-area-inset-left, 0px)) !important;
    top: calc(15px + env(safe-area-inset-top, 0px)) !important;
    transform: none !important;
  }

  .camera-height-container,
  .coords-container-main {
    left: 50% !important;
    width: 46% !important;
    transform: translateX(-50%);
    right: auto !important;
  }

  .camera-height-container {
    top: calc(15px + env(safe-area-inset-top, 0px)) !important;
    bottom: auto !important;
  }

  .coords-container-main {
    top: calc(15px + env(safe-area-inset-top, 0px) + var(--regular-btn-size) + 4px) !important;
    bottom: auto !important;
  }

  .tools-panel-container {
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
    bottom: calc(15px + env(safe-area-inset-bottom, 0px)) !important;
  }
}
```

Leave the `laptop` block as-is (`camera-height` `left: 86px; top: 15px`, `.tools-panel-container { left: 194px !important; }`). Compact 521–767 therefore stays dense laptop. Do not add a coords chevron in CSS here (Task 4).

- [ ] **Step 2: Confirm no wrapper**

`planet.html` still has sibling `<cursor-coords-info />` and `<camera-height-tool />`. Do not wrap them.

- [ ] **Step 3: Run a cheap spec**

Run: `npx ng test --no-watch --include=src/app/planet/components/cursor-coords-info/cursor-coords-info.spec.ts`

Expected: PASS.

---

### Task 4: Coords chevron on phoneLayout

**Skills:** `.cursor/skills/sight-a11y-touch/SKILL.md`, `.cursor/skills/sight-angular-ui/SKILL.md`, `.cursor/skills/sight-testing/SKILL.md`

**Files:**
- Modify: `src/app/planet/components/cursor-coords-info/cursor-coords-info.ts`
- Modify: `src/app/planet/components/cursor-coords-info/cursor-coords-info.html`
- Modify: `src/app/planet/components/cursor-coords-info/cursor-coords-info.scss`
- Modify: `src/app/planet/components/cursor-coords-info/cursor-coords-info.spec.ts`

**Interfaces:**
- Consumes: `CheckMobileDeviceService.phoneLayout`
- Produces: on phone, default collapsed (lat/lon/checkbox/select hidden); strip chevron same SVG as tools (`M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6l6 6z`); toggle **only** on chevron click; no outside-click close; width 100% of `.coords-container-main` (already 46% on phone)

- [ ] **Step 1: Failing tests**

Provide a stub service with writable `phoneLayout` so the test does not depend on jsdom width:

```typescript
import { signal } from '@angular/core';
import { CheckMobileDeviceService } from '@global/services/check-mobile-device-service/check-mobile-device.service';

const phoneLayout = signal(true);

// in TestBed providers, keep the existing planet provider list from cursor-coords-info.spec.ts and add:
{
  provide: CheckMobileDeviceService,
  useValue: {
    isMobile: false,
    checkMobile: () => false,
    phoneLayout,
    laptopLayout: signal(true),
    narrowChromeLayout: signal(true),
  },
}
```

Assertions (after `fixture.detectChanges()`):

```typescript
it('starts collapsed on phoneLayout: chevron visible, lat/lon and CRS hidden', () => {
  phoneLayout.set(true);
  fixture.detectChanges();
  const host: HTMLElement = fixture.nativeElement;
  expect(host.querySelector('.coords-phone-chevron')).toBeTruthy();
  expect(host.querySelector('.coords-description-main')).toBeNull();
  expect(host.querySelector('.coords-container-form-field')).toBeNull();
});

it('expands and collapses only via the chevron, not document click', () => {
  phoneLayout.set(true);
  fixture.detectChanges();
  const chevron = fixture.nativeElement.querySelector('.coords-phone-chevron') as HTMLButtonElement;
  chevron.click();
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('.coords-description-main')).toBeTruthy();
  expect(fixture.nativeElement.querySelector('.coords-container-form-field')).toBeTruthy();
  document.body.click();
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('.coords-description-main')).toBeTruthy();
  chevron.click();
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('.coords-description-main')).toBeNull();
});

it('does not render the chevron when phoneLayout is false', () => {
  phoneLayout.set(false);
  fixture.detectChanges();
  expect(fixture.nativeElement.querySelector('.coords-phone-chevron')).toBeNull();
  expect(fixture.nativeElement.querySelector('.coords-container-form-field')).toBeTruthy();
});
```

Do **not** change checkbox copy or `toggleCursorCoordsFieldDisplay`.

- [ ] **Step 2: Run — FAIL** (no `.coords-phone-chevron`)

Run: `npx ng test --no-watch --include=src/app/planet/components/cursor-coords-info/cursor-coords-info.spec.ts`

- [ ] **Step 3: Implement**

`cursor-coords-info.ts` — inject stays `$checkMobileDeviceService`. Add:

```typescript
protected coordsExpanded = signal(false);

protected get showPhoneChevron(): boolean {
  return this.$checkMobileDeviceService.phoneLayout();
}

protected get showCoordsBody(): boolean {
  return !this.showPhoneChevron || this.coordsExpanded();
}

protected toggleCoordsExpanded(event: Event): void {
  event.stopPropagation();
  this.coordsExpanded.update((v) => !v);
}
```

Use `showPhoneChevron` / `showCoordsBody` from the template (call as methods, or convert to `computed` reading `phoneLayout()` + `coordsExpanded()` — prefer `computed` for OnPush).

HTML: keep the floating `cursor-coords-cursor-field` block as-is. In `.coords-container-main`:

```html
<div class="coords-container-main">
  @if (showPhoneChevron()) {
    <button
      type="button"
      class="coords-phone-chevron"
      [class.coords-phone-chevron-expanded]="coordsExpanded()"
      [attr.aria-expanded]="coordsExpanded()"
      aria-label="Координаты"
      (click)="toggleCoordsExpanded($event)"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6l6 6z" />
      </svg>
    </button>
  }
  @if (showCoordsBody()) {
    <!-- existing @if latitude → .coords-description-main ... -->
    <!-- existing mat-form-field / mat-select -->
  }
</div>
```

No `document` click listener. No CDK overlay.

SCSS for the strip (height = tools chevron = `--regular-btn-size`; full width of the 46% panel):

```scss
.coords-phone-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: var(--regular-btn-size);
  padding: 0;
  border: none;
  border-radius: 6px;
  background-color: var(--theme-ui-background-color);
  outline: 1px solid var(--theme-outline-color);
  cursor: pointer;
  svg {
    transform: rotate(90deg); // down when collapsed
  }
}
.coords-phone-chevron-expanded svg {
  transform: rotate(-90deg); // up when open
}
```

- [ ] **Step 4: Re-run**

Run: `npx ng test --no-watch --include=src/app/planet/components/cursor-coords-info/cursor-coords-info.spec.ts`

Expected: PASS.

---

### Task 5: Sidenav overlay only when phoneLayout

**Skills:** `.cursor/skills/sight-a11y-touch/SKILL.md`, `.cursor/skills/sight-angular-ui/SKILL.md`

**Files:**
- Modify: `src/app/planet/planet.html`
- Modify: `src/app/planet/planet.spec.ts` if there is an assertion on sidenav; otherwise add one

**Interfaces:**
- Consumes: `CheckMobileDeviceService.phoneLayout` (not `isMobile`)
- Produces: `mode=over`, `opened=false`, backdrop, `disableClose=false` **only** when `phoneLayout()`; otherwise current `side` / opened / no backdrop. `drawings-list` unchanged. Crosshair `#crosshairForMobiles` **stays** on `isMobile` (UA).

- [ ] **Step 1: Bind layout in `planet.html`**

Keep canvas cursor + `#crosshairForMobiles` on `$checkMobileDeviceService.isMobile`.

Change only the sidenav container:

```html
<mat-sidenav-container
  class="sight-main-sidenav-global"
  [hasBackdrop]="$checkMobileDeviceService.phoneLayout() ? 'true' : 'false'"
>
  <mat-sidenav
    class="sight-main-sidenav"
    #sidenavRef
    [mode]="$checkMobileDeviceService.phoneLayout() ? 'over' : 'side'"
    position="start"
    [opened]="!$checkMobileDeviceService.phoneLayout()"
    [disableClose]="$checkMobileDeviceService.phoneLayout() ? 'false' : 'true'"
  >
```

- [ ] **Step 2: Test**

In `planet.spec.ts`, override `CheckMobileDeviceService` with `phoneLayout: signal(true)` and `isMobile: false`. After `detectChanges`, query `mat-sidenav` and expect `mode` over (attribute `ng-reflect-mode` or component `sidenavRef.mode === 'over'`). Second test: `phoneLayout false` → `mode === 'side'` and `opened === true` even if `isMobile` were true — prove UA does not drive overlay. Easiest: `isMobile: true`, `phoneLayout: signal(false)` → still `side`.

If `Planet` TestBed cannot reach `#sidenavRef` without Cesium, assert via `fixture.debugElement.query` on `mat-sidenav`. Do not create a real Viewer.

- [ ] **Step 3: Run**

Run: `npx ng test --no-watch --include=src/app/planet/planet.spec.ts`

Expected: PASS.

---

### Task 6: Floating windows — left when tabs top-right; phone starts collapsed

**Skills:** `.cursor/skills/sight-map-tools/SKILL.md`, `.cursor/skills/sight-a11y-touch/SKILL.md`, `.cursor/skills/sight-testing/SKILL.md`

**Files:**
- Modify: `src/app/planet/components/floating-windows/services/floating-windows-service/floating-windows.service.ts`
- Modify: `src/app/planet/components/floating-windows/services/floating-windows-service/floating-windows.service.spec.ts`
- Modify: `src/app/planet/components/floating-windows/common/components/floating-window/floating-window.html`
- Modify: `src/app/planet/components/floating-windows/common/components/floating-window/floating-window.ts` (`FloatingWindowItem` type is in the service)
- Modify: `src/app/planet/components/floating-windows/common/components/floating-window/floating-window.scss` only if CSS fallback needed
- Modify: `src/app/planet/common/styles/common-core.scss` — phone tabs stay top-right (already); optional `top` tweak so first tab matches first window

**Interfaces:**
- Consumes: `phoneLayout`, `laptopLayout`, `narrowChromeLayout`
- Produces: `FloatingWindowItem` gains optional `left?: number`. When `narrowChromeLayout`: `left: 15` (plus we cannot add safe-area in the number easily — use `15`), `right` unset. When not narrow: keep `right: 33`, no `left`. `collapsed: signal(phoneLayout())` on create. First `top`: phone `15 + 44 + 44 + 8` (111); else if `laptopLayout` 50; else if `narrowChromeLayout` 15; else existing `33 + header`. Do not use MatDialog.

- [ ] **Step 1: Failing tests in `floating-windows.service.spec.ts`**

Stub `CheckMobileDeviceService` in this spec’s TestBed (service is `providedIn: 'root'` — override `provide:`).

```typescript
const phoneLayout = signal(false);
const laptopLayout = signal(false);
const narrowChromeLayout = signal(false);

{
  provide: CheckMobileDeviceService,
  useValue: {
    isMobile: false,
    checkMobile: () => false,
    phoneLayout,
    laptopLayout,
    narrowChromeLayout,
  },
}
```

Inject `CheckMobileDeviceService` into `FloatingWindowsService` constructor (new dependency).

```typescript
it('creates expanded on the right when chrome is wide', () => {
  phoneLayout.set(false);
  narrowChromeLayout.set(false);
  service.addWindowItem('drawMark');
  const item = service.floatingWindowsList()[0];
  expect(item?.collapsed()).toBe(false);
  expect(item?.right).toBe(33);
  expect(item?.left).toBeUndefined();
});

it('creates expanded on the left when tabs are top-right', () => {
  phoneLayout.set(false);
  laptopLayout.set(true);
  narrowChromeLayout.set(true);
  service.addWindowItem('drawMark');
  const item = service.floatingWindowsList()[0];
  expect(item?.collapsed()).toBe(false);
  expect(item?.left).toBe(15);
  expect(item?.right).toBeUndefined();
  expect(item?.top).toBe(50);
});

it('creates collapsed on phoneLayout', () => {
  phoneLayout.set(true);
  laptopLayout.set(true);
  narrowChromeLayout.set(true);
  service.addWindowItem('drawMark');
  const item = service.floatingWindowsList()[0];
  expect(item?.collapsed()).toBe(true);
  expect(item?.left).toBe(15);
  expect(item?.top).toBe(111);
});
```

Put that same stub in `beforeEach` with all three layout signals **false**, so the existing `collapsed().toBe(false)` / `right: 33` case stays deterministic in jsdom.

- [ ] **Step 2: Run — FAIL** (no `left`, always `collapsed false`)

Run: `npx ng test --no-watch --include=src/app/planet/components/floating-windows/services/floating-windows-service/floating-windows.service.spec.ts`

- [ ] **Step 3: Implement `addWindowItem`**

Add to `FloatingWindowItem`:

```typescript
left?: number;
right?: number;
```

Constructor: inject `CheckMobileDeviceService` as `$checkMobileDeviceService`.

Replace the `collapsed: signal(false), top, right: 33` payload with:

```typescript
const phone = this.$checkMobileDeviceService.phoneLayout();
const laptop = this.$checkMobileDeviceService.laptopLayout();
const narrow = this.$checkMobileDeviceService.narrowChromeLayout();
let newTop: number;
if (phone) {
  newTop = 111;
} else if (narrow && laptop) {
  newTop = 50;
} else if (narrow) {
  newTop = 15;
} else {
  newTop = 33 + this._windowHeaderHeight;
}
// keep existing innerHeight-300 / <0 clamps after that
this._floatingWindowsList.update((arr) => [
  ...arr,
  {
    windowName,
    collapsed: signal(phone),
    hidden: signal(false),
    isActive: signal(true),
    top: newTop,
    ...(narrow ? { left: 15 } : { right: 33 }),
  },
]);
```

Keep the existing “stack subsequent windows by header height” logic, but seed from this `newTop` instead of always `33 + header`.

- [ ] **Step 4: Template left vs right**

`floating-window.html` replace the `[style.right]` binding with both edges (inline `right` currently wins over CSS, so it must be cleared):

```html
[style.top]="
  customTop
    ? customTop + 'px'
    : ($floatingWindowsService.floatingWindowsList()[windowIndex()]?.top ?? 33) + 'px'
"
[style.left]="
  customLeft
    ? customLeft + 'px'
    : $floatingWindowsService.floatingWindowsList()[windowIndex()]?.left !== undefined
      ? $floatingWindowsService.floatingWindowsList()[windowIndex()]!.left + 'px'
      : null
"
[style.right]="
  customRight
    ? customRight + 'px'
    : $floatingWindowsService.floatingWindowsList()[windowIndex()]?.right !== undefined
      ? $floatingWindowsService.floatingWindowsList()[windowIndex()]!.right + 'px'
      : null
"
```

Add `@Input() customLeft?: number` next to `customRight` on `FloatingWindow`.

- [ ] **Step 5: Re-run service spec**

Run: `npx ng test --no-watch --include=src/app/planet/components/floating-windows/services/floating-windows-service/floating-windows.service.spec.ts`

Expected: PASS.

---

### Task 7: ToggleFullscreen tool, kill Cesium button, drop mixin

**Skills:** `.cursor/skills/sight-map-tools/SKILL.md`, `.cursor/skills/sight-a11y-touch/SKILL.md`, `.cursor/skills/sight-angular-ui/SKILL.md`

**Files:**
- Create: `src/app/planet/components/tools/camera-view-tools/components/toggle-fullscreen/toggle-fullscreen.ts`
- Create: `src/app/planet/components/tools/camera-view-tools/components/toggle-fullscreen/toggle-fullscreen.spec.ts`
- Modify: `src/app/planet/components/tools/tools-panel.ts` (import, `imports`, `ng-template` `position="3"`)
- Modify: `src/app/planet/common/services/viewer-service/viewer.service.ts` (`fullscreenButton: false`; delete `.cesium-fullscreenButton` title hack)
- Modify: `src/app/planet/common/styles/common-core.scss` (remove/zero `.cesium-viewer-fullscreenContainer` rules)
- Modify: `src/app/planet/components/camera-position-tools/znemz-navigation-mixin/znemz-navigation-mixin.scss` (lower compass + navigation-controls by 55px; keep `right`)
- Modify: `src/app/planet/components/tools/tools-panel.spec.ts` — keep `should create`; do not assert DOM of `ng-template` children (they mount in `ngAfterViewInit`)

**Interfaces:**
- Consumes: `setStartBtnVisibility` / `getBtnVisibilityObserver`, `ToolsService.drawingsBlocker`, `ViewerService.viewer.container`, `Cesium.Fullscreen`
- Produces: selector `toggle-fullscreen`; `toolName = 'toggleFullscreen'`; `rusToolName = 'На весь экран'`; no service, no entity store, no floating window; mixin still **not** mounted when `isMobile` (existing `znemz-navigation-mixin.ts` guard — do not change)

- [ ] **Step 1: Failing tool spec**

Copy `take-screenshot.spec.ts` (same TestBed providers). Change import to `ToggleFullscreen`. Add:

```typescript
it('exposes toggleFullscreen toolName and does not stop mousedown propagation', () => {
  expect((component as unknown as { toolName: string }).toolName).toBe('toggleFullscreen');
  const event = {
    button: 0,
    stopPropagation: vi.fn(),
  } as unknown as MouseEvent;
  (component as unknown as { buttonHandler: (e: MouseEvent) => void }).buttonHandler(event);
  expect(event.stopPropagation).not.toHaveBeenCalled();
});

it('requests Cesium fullscreen on left click when not already fullscreen', () => {
  const request = vi.spyOn(Cesium.Fullscreen, 'request').mockImplementation(() => undefined);
  vi.spyOn(Cesium.Fullscreen, 'fullscreen', 'get').mockReturnValue(false);
  (component as unknown as { buttonHandler: (e: MouseEvent) => void }).buttonHandler({
    button: 0,
    stopPropagation: vi.fn(),
  } as unknown as MouseEvent);
  expect(request).toHaveBeenCalled();
});
```

`buttonVisibility` stays `false` until `button-visibility` attr — same as screenshot (host not inside a group). `should create` must still pass.

- [ ] **Step 2: Run — FAIL** (file missing)

Run: `npx ng test --no-watch --include=src/app/planet/components/tools/camera-view-tools/components/toggle-fullscreen/toggle-fullscreen.spec.ts`

- [ ] **Step 3: Implement `toggle-fullscreen.ts`**

Clone `take-screenshot.ts`. Differences:

- `selector: 'toggle-fullscreen'`
- `toolName = 'toggleFullscreen'`
- `rusToolName = 'На весь экран'`
- SVG: Material fullscreen icon path `M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z`
- `buttonHandler`:

```typescript
protected buttonHandler(event: MouseEvent): void {
  // do not call event.stopPropagation()
  if (event.button !== 0) return;
  const target = this.$viewerService.viewer.container as Element;
  if (Cesium.Fullscreen.fullscreen) {
    Cesium.Fullscreen.exit();
  } else {
    Cesium.Fullscreen.request(target);
  }
}
```

`import * as Cesium from 'cesium';` — screenshot currently does not; this file does.

Keep `mousedown` handler (not `click`) so `moveToolToDefault` on the parent still sees the event.

- [ ] **Step 4: Register in `tools-panel.ts`**

Import `ToggleFullscreen`. Add to `imports: [...]`. Inside `#hiddenNGCForCameraViewTools` after scene-mode `position="2"`:

```html
<ng-template #childNGTForCameraViewTools
  ><toggle-fullscreen [attr.position]="3"
/></ng-template>
```

Do not change chevron markup or `column-reverse`.

- [ ] **Step 5: Cesium widget off**

`viewer.service.ts` constructor options:

```typescript
fullscreenButton: false,
```

Delete the block that queries `.cesium-fullscreenButton` and clears `title` (approx lines 238–258).

In `common-core.scss` delete `.cesium-viewer-fullscreenContainer` and `.cesium-fullscreenButton` rules (including the `max-width: 380px` override) so the empty corner is gone.

- [ ] **Step 6: Lower mixin as one unit**

Current: `.navigation-controls { bottom: 70px; right: 40px; }`, `.compass { right: -22px; bottom: 152px; }`. Fullscreen sat at `bottom: 15px; right: 40px`. Delta `70 - 15 = 55`.

```scss
.compass {
  transform: scale(0.8);
  position: absolute;
  right: -22px;
  bottom: 97px; // was 152
  /* rest unchanged */
}

.navigation-controls {
  position: absolute;
  bottom: 15px; // was 70
  right: 40px;
  /* rest unchanged */
}
```

Do not change compass `right` or the relative gap (152−70=82 → 97−15=82). Do not edit `znemz-navigation-mixin.ts` `isMobile` skip.

- [ ] **Step 7: Run tool spec + a tools-panel create test**

Run: `npx ng test --no-watch --include=src/app/planet/components/tools/camera-view-tools/components/toggle-fullscreen/toggle-fullscreen.spec.ts`

Run: `npx ng test --no-watch --include=src/app/planet/components/tools/tools-panel.spec.ts`

Expected: PASS.

---

### Task 8: As-is specs, skill, product table, verify

**Skills:** `.cursor/skills/sight-a11y-touch/SKILL.md`, `.cursor/skills/sight-angular-ui/SKILL.md`, `.cursor/skills/sight-map-tools/SKILL.md`

**Files:**
- Modify: `.cursor/superpowers/specs/2026-09-17-sight-ui-theme-design.md`
- Modify: `.cursor/superpowers/specs/2026-09-17-sight-viewer-crs-design.md`
- Modify: `.cursor/superpowers/specs/2026-09-17-sight-map-tools-design.md`
- Modify: `.cursor/superpowers/specs/2026-09-17-sight-product-design.md`
- Modify: `.cursor/skills/sight-a11y-touch/SKILL.md`
- Modify: `.cursor/superpowers/specs/2026-09-21-mobile-ui-chrome-design.md` — set `status: implemented` only after tests pass; keep the file as history, do not delete
- Modify: `.cursor/superpowers/README.md` — move the chrome spec from **To-be** into a one-liner “implemented, merged into as-is”

**Product edits (exact intent, not placeholders):**

`2026-09-17-sight-ui-theme-design.md` Device section replace the detector sentence with:

```
CheckMobileDeviceService (`providedIn: 'root'`): `isMobile` / `checkMobile()` — UA-regex телефона/планшета **без** `maxTouchPoints` / `ontouchstart` (виртуальный курсор, mixin off). Раскладка — CSS mixins + сигналы `phoneLayout` (≤520), `laptopLayout` (≤1080), `narrowChromeLayout` (≤1660). Не плодить второй сервис. `DeviceService` не использовать для нового хрома.
На ≤767 `--regular-btn-size: 44px`. Sidenav `mode=over` только при `phoneLayout`. Coords на телефоне свёрнуты шевроном (клик только по шеврону).
```

`2026-09-17-sight-viewer-crs-design.md`: `fullscreenButton: false`. Camera tools list adds `ToggleFullscreen`. Mixin: на десктопе блок компас+зум в правом нижнем углу (бывшая позиция Cesium fullscreen); на UA mobile не монтируется. Product table row «Камера, скриншот, fullscreen» → `viewer-crs` (CameraViewTools, не виджет Cesium).

`2026-09-17-sight-map-tools-design.md` Floating windows: when tabs top-right (≤1660) item has `left` not `right`; `collapsed` true on create if `phoneLayout`.

`.cursor/skills/sight-a11y-touch/SKILL.md` trap:

```
- Детектор: `CheckMobileDeviceService`. `isMobile` = UA-regex, **не** `maxTouchPoints`. Раскладка = CSS / `phoneLayout`, не UA.
- Hit-area: на `tablet` ≤767 `--regular-btn-size: 44px`; шевроны tools и sidenav toggle не уже `.tool-panel-button`.
```

- [ ] **Step 1: Apply those doc edits after code is green**

- [ ] **Step 2: Full unit run**

Run: `npx ng test --no-watch`

Expected: PASS. If a characterization spec still expects `maxTouchPoints` → true, update that spec (same contract as Task 1), do not restore the OR.

- [ ] **Step 3: Browser check (implementer, not a screenshot-only)**

`npm start` (port 9002). Desktop: mixin sits in the old fullscreen corner; Camera group 4th hidden button toggles fullscreen; Cesium corner control absent. Narrow the window to ~700px: 44px buttons, laptop positions, sidenav still `side`. To ~400px: overlay sidenav closed, height+chevron centered 46%, tools centered bottom, new window appears as a tab then expands on the left below the stack. Touch-laptop emulation in DevTools with a desktop UA must **not** show the red `+`. iPhone UA (Device Mode) shows the `+` even if the window is wide.

---

## Self-review (author)

| Spec section | Task |
|---|---|
| Breakpoints / 44px / chevrons / safe-area / viewport-fit | 2 |
| Two detectors, checkbox unchanged | 1, 4 (checkbox not edited) |
| Compact 521–767 laptop positions | 3 (do not apply phone stack) |
| Phone menu px, 46% stack, no wrapper, tools center, column-reverse | 3, 4, 7 (tools UX untouched) |
| Coords chevron full collapse, click-only | 4 |
| Sidenav overlay ≤520 | 5 |
| Windows left + phone collapsed | 6 |
| Fullscreen tool + Cesium off | 7 |
| Mixin unit drop | 7 |
| Tests zoneless, no Playwright | 1, 4, 6, 7, 8 |
| As-is child specs in same change | 8 |
| Out of scope dock/wrapper/PWA | not tasked |

No TBD. `DeviceService` explicitly out of scope. `left: 194px` compact kept. Phone `laptop` mixin overrides called out (`!important`).
