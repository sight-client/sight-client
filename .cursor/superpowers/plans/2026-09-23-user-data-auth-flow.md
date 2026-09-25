# User data auth flow Implementation Plan

> **Status:** executed 2026-09-25. History only — do not re-run.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Login, logout, and registration are flat Observable chains that write the existing result signals. Interceptors read the user name from `UserDataService`, not a module global.

**Architecture:** `UserDataService` stays `providedIn: 'root'`. Public methods return `Observable<boolean>` (or complete without a value) instead of `Subscription`. Nested `subscribe` inside `getLoginSubscription` becomes `concatMap` / `switchMap`. `getUserNameGlobal` is deleted; `get-req-caching.interceptor.ts` injects `UserDataService` and reads `userName()`. `ngOnDestroy` on this root service is removed. `alert()` effects become one place that sets a message signal the auth UI already can show — do not add a new dialog library. Rename `getLoginObsevable` / `getLogoutObsevable` to `login$` / `logout$` only inside this service.

**Tech Stack:** Angular 22, RxJS 7.8, signals, Vitest

**SDD skills:** `.cursor/skills/sight-angular-ui/SKILL.md`, `.cursor/skills/sight-testing/SKILL.md`, `.cursor/skills/sight-client-security/SKILL.md`

## Global Constraints

- Do not add a backend or change HTTP URLs.
- Keep DOMPurify on any HTML body this service already sanitizes.
- Writable signals that templates bind stay. New writes go through methods; do not widen `any`.
- No commit unless Evgeniy asks.

---

### Task 1: Interceptor reads the service

**Files:**

- Modify: `src/app/global/interceptors/get-req-caching-interceptor/get-req-caching.interceptor.ts`
- Modify: its spec
- Modify: `src/app/global/services/user-data-service/user-data.service.ts` (stop writing `userNameGlobal` once the interceptor no longer calls the getter)

**Interfaces:**

- Consumes: `UserDataService.userName: Signal<string | undefined>`
- Removes: `getUserNameGlobal` after the interceptor and any other caller are updated

- [x] **Step 1: Spec — cache key uses the name from a stub `UserDataService`, not the module variable.**
- [x] **Step 2: `inject(UserDataService)` in the interceptor.**
- [x] **Step 3: Delete `userNameGlobal`, `getUserNameGlobal`, and the effect that only copied the signal into that variable.**
- [x] **Step 4: Run the interceptor spec.**

### Task 2: Flat login chain

**Files:**

- Modify: `user-data.service.ts`
- Modify: `auth-module.ts` callers of `getLoginSubscription` / `.add()`
- Specs for both

**Interfaces:**

- Produces: `login(login: string, password: string): Observable<boolean>`
- On failure sets `loginResult` to the same English strings the nested callbacks set today
- Success path order stays logout (only if another user is signed in) → login → user info

- [x] **Step 1: Spec the three outcomes: empty credentials, logout-then-login failure, full success sets `userName`.**
- [x] **Step 2: Implement with `concatMap`. Unsubscribe is the caller's `takeUntilDestroyed` or a single `Subscription` field replaced on the next attempt (`switchMap` on an internal trigger).**
- [x] **Step 3: Delete `ngOnDestroy` from this root service.**
- [x] **Step 4: Replace the three `alert()` effects with the existing result signals only. Auth template already displays them; if it only alerted, bind the string in `auth-module` template instead of `alert`.**
- [x] **Step 5: Run user-data and auth-module specs.**

### Task 3: Registration and logout the same way

- [x] **Step 1: Same Observable shape for registration and logout. Delete `declare public *Subscription` fields.**
- [x] **Step 2: Run the same specs.**
