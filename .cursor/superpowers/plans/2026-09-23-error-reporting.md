# Error reporting Implementation Plan

> **Status:** executed 2026-09-25. History only — do not re-run.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Browser errors go to `console.error` through one helper and `GlobalErrorHandlerService`, without `chalk` and without `error.cause` as a color.

**Architecture:** `reportError(error: unknown)` logs via `console.error`. The global handler logs the same way and, when present, the nested HTTP validation string `error.error.message`. Local `catch` blocks that only rethrow are deleted. Catches that today `console.log(chalk.red(error))` call `reportError` and keep their current control flow (`return false` stays until a caller is ready to see a throw).

**Tech Stack:** Angular `ErrorHandler`, Vitest 4.1. No new dependency.

**SDD skills:** `.cursor/skills/sight-angular-ui/SKILL.md`, `.cursor/skills/sight-testing/SKILL.md`, `.cursor/skills/sight-client-security/SKILL.md`

## Global Constraints

- Do not remove `DOMPurify`.
- Do not add a toast library.
- `alert()` in `UserDataService` is plan `2026-09-23-user-data-auth-flow.md`, not this one.
- No commit unless Evgeniy asks.
- `provideZonelessChangeDetection()` in TestBed.

---

### Task 1: Helper and global handler

**Files:**

- Create: `src/app/global/lib/report-error.lib.ts`
- Test: `src/app/global/lib/report-error.lib.spec.ts`
- Modify: `src/app/global/services/global-error-handler-service/global-error-handler.service.ts`
- Modify: `src/app/global/services/global-error-handler-service/global-error-handler.service.spec.ts`

**Interfaces:**

- Produces: `reportError(error: unknown): void`
- `GlobalErrorHandlerService.handleError(error: unknown): void` — `console.error(error)`, then `console.error(message)` when `error` is an object with `error.message: string`

- [x] **Step 1: Specs expect `console.error`, not `console.log`, and do not branch on `cause`.**
- [x] **Step 2: Implement helper and handler. Remove the `chalk` import from the handler.**
- [x] **Step 3: `npx ng test --no-watch --include=src/app/global/lib/report-error.lib.spec.ts` and the handler spec.**

### Task 2: Replace chalk catches

**Files:** every `src/**/*.ts` that imports `chalk` (production, not a new dependency removal from package.json until the import count is zero).

- [x] **Step 1: `console.log(chalk.red(error))` and `console.log(chalk.red(error.stack))` become `reportError(error)`.**
- [x] **Step 2: `console.log(chalk.blue/yellow/green(...))` informational strings become `console.info` / `console.warn` without chalk. Do not turn them into thrown errors.**
- [x] **Step 3: Delete `error.cause = 'red' | 'yellow' | 'green' | 'blue'` assignments.**
- [x] **Step 4: Delete `try/catch` whose catch only `throw error` (`common-global.lib.ts`).**
- [x] **Step 5: When no `src/**/*.ts` imports `chalk`, remove `chalk` from `package.json` dependencies. Ask before `npm uninstall` if the lockfile update is unclear; otherwise edit package.json and leave install to Evgeniy.** `package.json` updated. Lockfile still lists chalk until `npm install`.
- [x] **Step 6: Run `npx ng test --no-watch --include=src/app/global/**/*.spec.ts`.**
- [x] **Step 7: Catches that already call `reportError` no longer also `console.log(error.stack)`. Bare `console.log(error)` in catches is `reportError`. Commented logs stay.**
