# CI unit tests and KML name sanitization Implementation Plan

> **Status:** executed 2026-09-20. History only — do not re-run.

> **For agentic workers:** Parent executes (no Task). `npx ng test` is allowlisted. Do not `request_smart_mode_approval`. Do not `git push`.

**Goal:** Run `npx ng test --no-watch` on GitHub Actions; strip `javascript:` from KML-imported entity names via DOMPurify (TDD).

**Architecture:** Ubuntu Actions + Node 22 + committed `package-lock.json` + `npm ci`. KML import already parses `CustomPropsFromKml` in `prepareKmlEntities`; sanitize string name (and `billboard.image` if a second red test requires it) with existing `dompurify` — no new npm packages.

**Tech Stack:** GitHub Actions, Node 22, Vitest 4.1, DOMPurify 3.x, Angular 22 zoneless TestBed

## Global Constraints

- Skills: `.cursor/skills/sight-testing/SKILL.md`, `.cursor/skills/sight-client-security/SKILL.md`, `.cursor/skills/sight-change-control/SKILL.md`
- No Cesium.Viewer. No Playwright. No coverage threshold.
- Production change only in `drawings-list-kml.service.ts` for sanitization.
- Update owning specs: github-pages (CI + lockfile), map-tools (KML names sanitized).
- Windows PowerShell: `git commit -m "message"`.

---

### Task 1: GitHub Actions unit tests

**Files:**
- Create: `.github/workflows/unit-tests.yml`
- Modify: `.gitignore` (stop ignoring `package-lock.json`)
- Modify: `.cursor/superpowers/specs/2026-09-17-sight-github-pages-design.md`

- [ ] **Step 1:** Remove `package-lock.json` from `.gitignore`. Ensure lockfile exists (`npm install` if missing).
- [ ] **Step 2:** Workflow: `on: push` and `pull_request`; Node 22; `npm ci`; `npx ng test --no-watch`.
- [ ] **Step 3:** Spec row for CI. Commit `ci: run ng test on GitHub Actions`

---

### Task 2: KML javascript: name (TDD)

**Files:**
- Modify: `drawings-list-kml.service.spec.ts` (flip parked test)
- Modify: `drawings-list-kml.service.ts`
- Modify: `.cursor/superpowers/specs/2026-09-17-sight-map-tools-design.md`

- [ ] **Step 1 RED:** Expect imported `entity.name` not to contain `javascript:`. Safe name `TestMark` still applied. Run include spec — first test FAIL, second PASS.
- [ ] **Step 2 GREEN:** `DOMPurify.sanitize` on name; reject `javascript:` URLs (DOMPurify may keep them as text).
- [ ] **Step 3:** Full `npx ng test --no-watch`. Commit `fix: sanitize javascript: URLs in imported KML entity names`
