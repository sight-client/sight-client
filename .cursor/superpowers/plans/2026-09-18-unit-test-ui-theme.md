# Unit-test UI / theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Characterize public behavior of global UI, theme, device, interceptors, listeners, Autofocus, landing, and app shell — without changing production and without enabling the landing route.

**Architecture:** Tests against as-is code. HTTP interceptors via `HttpClient` + `HttpTestingController`. Theme via `localStorage` and `document.documentElement`. No Cesium.

**Tech Stack:** Angular 22 zoneless, Vitest 4.1, jsdom, DOMPurify (interceptor)

**Spec:** `.cursor/superpowers/specs/2026-09-18-sight-unit-test-suite-design.md` and `.cursor/superpowers/specs/2026-09-17-sight-ui-theme-design.md`

**Depends on:** plan `2026-09-18-unit-test-hygiene` (suite already green).

## Global Constraints

- Characterization: new tests must PASS against current production. If they fail, park a bug — do not patch `src/app` in this plan.
- `provideZonelessChangeDetection()` in every TestBed.
- Vitest matchers, not Jasmine.
- Do not enable `landing` in `app.routes.ts` or the API-proxy interceptor.
- Do not test `app.config.ts` / `environment*.ts` / HTTP tokens for existing.
- Skills: `.cursor/skills/sight-testing/SKILL.md`, `.cursor/skills/sight-angular-ui/SKILL.md`

---

### Task 1: Theme and light/dark services

**Files:**
- Modify: `src/app/global/services/set-light-dark-mode-service/set-light-dark-mode.service.spec.ts`
- Modify: `src/app/global/services/set-user-theme-service/set-user-theme.service.spec.ts`

**Product:** `getStartColorScheme` reads `localStorage.colorScheme` or `prefers-color-scheme`; writes `light-mode`/`dark-mode` classes. `setUserTheme` writes `localStorage.themePalettes` and a `*-theme` class. Fallback palette `'azure-blue'`.

- [ ] **Step 1: Add failing-to-exist assertions (they should pass on current code)**

`localStorage` + `matchMedia` stub:

```typescript
it('uses stored light colorScheme without rewriting from prefers-color-scheme', () => {
  localStorage.setItem('colorScheme', 'light');
  vi.spyOn(window, 'matchMedia').mockReturnValue({
    matches: true,
    addEventListener: () => {},
    removeEventListener: () => {},
  } as unknown as MediaQueryList);

  const service = TestBed.inject(SetLightDarkModeService);
  expect(service.getStartColorScheme()).toBe(false);
  expect(document.documentElement.classList.contains('light-mode')).toBe(true);
  expect(localStorage.getItem('colorScheme')).toBe('light');
});
```

```typescript
it('writes themePalettes and azure-blue-theme class on first setUserTheme', () => {
  localStorage.removeItem('themePalettes');
  const service = TestBed.inject(SetUserThemeService);
  service.setUserTheme();
  expect(localStorage.getItem('themePalettes')).toBeTruthy();
  expect(document.documentElement.classList.contains(`${service.nowUserPalettes()}-theme`)).toBe(
    true,
  );
});
```

Also characterize: `setColorScheme(true)` → `dark-mode` + `colorScheme=dark`; `setUserTheme('rose-red', 'cyan-orange')` swaps classes.

Clear `localStorage` in `afterEach`.

- [ ] **Step 2: Run**

Run: `npx ng test --no-watch --include=src/app/global/services/set-light-dark-mode-service/set-light-dark-mode.service.spec.ts`

Run: `npx ng test --no-watch --include=src/app/global/services/set-user-theme-service/set-user-theme.service.spec.ts`

Expected: PASS. If `getComputedStyle` palettes list is empty in jsdom, assert the documented fallback `'azure-blue'` — that is current code.

- [ ] **Step 3: Commit**

```bash
git add src/app/global/services/set-light-dark-mode-service/set-light-dark-mode.service.spec.ts src/app/global/services/set-user-theme-service/set-user-theme.service.spec.ts
git commit -m "$(cat <<'EOF'
test: characterize theme and color-scheme localStorage

EOF
)"
```

---

### Task 2: Device, spinner, error handler, cursor listener

**Files:**
- Modify: `src/app/global/services/check-mobile-device-service/check-mobile-device.service.spec.ts`
- Modify: `src/app/global/services/set-progress-spinner-service/set-progress-spinner.service.spec.ts`
- Modify: `src/app/global/services/global-error-handler-service/global-error-handler.service.spec.ts`
- Modify: `src/app/global/listeners/cursor-position-listener/cursor-position-listener.spec.ts`
- Skip `user-data.service.ts` auth helpers unless they have branches that run without a backend — then characterize those branches only.

- [ ] **Step 1: Tests**

Device: `checkMobile()` is true when UA matches `/iPhone/` **or** `navigator.maxTouchPoints > 0`. Stub `navigator.userAgent` / `maxTouchPoints`. Do not assert a specific jsdom default as a product rule.

Spinner: `setSpinnerOn` → `isShowSpinner() === true`; `setSpinnerOff` → `false`.

Error handler: `handleError({ cause: 'red', stack: 's' })` logs and returns (spy `console.log`). Error without `cause` still logs `error`.

Cursor listener: after `addListener`, dispatch `mousemove` on `document` with `clientX/Y` and expect `cursorXExport` / `cursorYExport`. Known production issue: `removeListener` adds a new function and does not remove the original — if a test would fail, **park** it, do not "fix" `removeListener`.

- [ ] **Step 2: Run those four specs. Expected: PASS.**

- [ ] **Step 3: Commit** `test: characterize device, spinner, error handler, cursor listener`

---

### Task 3: HTTP interceptors (live ones)

**Files:**
- Modify: `src/app/global/interceptors/bad-html-interceptor/bad-html.interceptor.spec.ts`
- Modify: `src/app/global/interceptors/double-req-prevention-interceptor/double-req-prevention.interceptor.spec.ts`
- Modify: `src/app/global/interceptors/get-req-caching-interceptor/get-req-caching.interceptor.spec.ts`
- Modify: `src/app/global/interceptors/download-progress-interceptor/download-progress.interceptor.spec.ts`

Do not open `api-url-chunk-proxy`.

- [ ] **Step 1: badHtml**

GET/DELETE pass through. POST with body `'<script>x</script>'` throws `/BAD HTML HAS DETECTED/`. POST with plain `'hello'` calls `next`.

```typescript
it('throws when POST body contains HTML that DOMPurify strips', () => {
  const req = new HttpRequest('POST', '/x', '<img src=x onerror=alert(1)>');
  expect(() =>
    interceptor(req, () => of({} as never)).subscribe(),
  ).toThrowError(/BAD HTML HAS DETECTED/);
});
```

Use a real `next` that returns `of(new HttpResponse({ status: 200 }))` for the clean-body case.

- [ ] **Step 2: stopDoubleRequest**

Two overlapping requests with the same `url` : second throws `'Double request has canceled'`. After `finalize`, a third request with that url is allowed. Use `Subject` as pending `next`.

- [ ] **Step 3: caching GET**

Without `CACHING_ENABLED_TOKEN`, `next` is always called. With token + GET, second identical request does not call `next` if the first stored a `HttpEventType.Response`. `Map` key is an object (current code) — characterize **actual** cache hit/miss; if hits never happen because keys are by reference, assert that (park as bug, do not rewrite the interceptor).

- [ ] **Step 4: ShowProgress**

Request sets spinner on; `HttpTestingController` flush sets spinner off in `finalize`.

- [ ] **Step 5: Run the four interceptor specs + `npx ng test --no-watch`. Commit.**

---

### Task 4: Routing listeners, Autofocus, common-global.lib

**Files:**
- Modify: `src/app/global/listeners/routing-errors-listener/routing-errors.listener.spec.ts`
- Modify: `src/app/global/listeners/routing-spinner-listener/routing-spinner.listener.spec.ts`
- Modify: `src/app/global/directives/autofocus-directive/autofocus.directive.spec.ts`
- Create: `src/app/global/lib/common-global.lib.spec.ts`

- [ ] **Step 1: RoutingErrorsListener**

`provideRouter([])` + emit `NavigationError` via a stub `Router.events` Subject **or** `Router.navigateByUrl` to a missing config. Expect `errorMessage()` `'Failed to load page. Please try again.'`. `dismissError()` clears the signal and navigates to `''`.

- [ ] **Step 2: Autofocus**

Host `<input autofocusDirective />`: after `detectChanges`, `document.activeElement` is the input (jsdom focus). Host with `[appAutoFocus]="false"` does not focus on init.

- [ ] **Step 3: common-global.lib**

`getMomentDate()` matches `/^\d{4}\.\d{2}\.\d{2}$/`. `jsonNullToUndefined({ a: null })` → `{ a: undefined }`. `undefinedToJsonNull({ a: undefined })` → `{ a: null }`. `uploadBlob` with empty `files` throws `'No imported data from input event'`. Fake `URL.createObjectURL` for `downloadBlob` and assert an `<a download>` is clicked (spy). `getMomentName('sight', 'ods')` contains `'sight-'` and `'.sight.ods'`.

- [ ] **Step 4: Run + full suite. Commit.**

---

### Task 5: UI components (create + real template behavior only)

**Files:**
- `src/app/app.spec.ts` — App constructor calls theme start (spy services).
- `src/app/landing-page/landing-page.spec.ts` — `should create` only; do not register the route.
- `src/app/global/components/ui-theme/**` — `should create`; if switcher calls `setColorScheme`, click it and assert the service spy.
- `src/app/global/components/progress-spinner/progress-spinner.spec.ts` — visible when `isShowSpinner` true if the template binds it.
- `src/app/global/common/components/custom-switch-toggle/custom-switch-toggle.spec.ts` — checkbox change emits `checkedChange`.
- `src/app/global/components/user-account-features/**` — `should create` (no real auth).
- `src/app/planet/components/main-menu/main-menu.spec.ts` — `should create` (+ menu open if it is a method, not only Material internals).

Do not snapshot templates. Do not assert Material internals.

- [ ] **Step 1: Implement the named behaviors above.**
- [ ] **Step 2:** `npx ng test --no-watch` exit 0.
- [ ] **Step 3: Commit** `test: characterize global UI shell and theme components`
