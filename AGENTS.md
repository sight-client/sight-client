# Sight Client — agent instructions

Frontend-only Angular map app (Cesium + OSM) for GitHub Pages. Noncommercial.

## Superpowers

Skills from the Superpowers plugin override default agent habits. Check for a relevant skill before acting.

This file overrides Superpowers default artifact paths. **`docs/` is the GitHub Pages build output** (`ng build --configuration docs`). Never write specs, plans, or source there.

| Artifact                            | Path                                                                                                                                                                                                           |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design specs                        | `.cursor/superpowers/specs/` — index: `2026-09-17-sight-product-design.md`                                                                                                                                     |
| Implementation plans                | `.cursor/superpowers/plans/YYYY-MM-DD-<feature-name>.md`                                                                                                                                                       |
| AI session log                      | `.cursor/superpowers/log/YYYY-MM-DD.md` (append-only, end of a work unit)                                                                                                                                      |
| Slash command `/save-chat-text`     | `.cursor/commands/save-chat-text.md` — полный диалог чата в `.chats/` (gitignored)                                                                                                                             |
| Isolated worktrees                  | `.worktrees/<branch-name>/` (gitignored)                                                                                                                                                                       |
| Brainstorm companion (HTML mockups) | `.superpowers/` (gitignored). Not product. When the visual brainstorm unit ends, stop the companion server and delete `.superpowers/` unless I asked to keep the mockups. Never delete `.cursor/superpowers/`. |

Ask before creating a worktree unless this file already records a standing preference.

Project skills in `.cursor/skills/` (auto-invoke in this chat, do not copy Superpowers): `sight-change-control`, `sight-angular-ui`, `sight-cesium-map`, `sight-map-tools`, `sight-geodesy`, `sight-testing`, `sight-client-security`, `sight-a11y-touch`.

**SDD / Superpowers subagents:** they do not inherit this session's skill list. The controller (parent) must put **1–3 relevant** skill paths into the implementer brief and into the plan task (e.g. `.cursor/skills/sight-map-tools/SKILL.md`). Never dump the whole catalog. Reviewers judge against the spec, this file, and those named skills — not against Angular Style Guide. Permanent conventions stay here and in `.cursor/rules/`; skills are traps the neighboring file will not teach.

**Standing decisions:** when I approve a new convention, stack rule, trap, or checklist, update the existing owner file (`AGENTS.md`, a `.cursor/rules` rule, a `sight-*` skill, or a spec under `.cursor/superpowers/specs/`). If a user-facing behavior changes and an as-is spec or `sight-*` skill already states the old one (feature, tool, CRS, route, export format, layout, sidenav, breakpoint), update that owner in the same change, and the product index table if the feature is listed there. In that same change, review colocated `*.spec.ts` that still assert the old behavior (mocks of new signals, expected layout, sidenav mode, breakpoint, tool literal) and update them to the new behavior. A doc update with a stale unit spec is not done. Do not changelog bugfixes or refactors here. If the owner is unclear, ask.

At the end of a completed work unit, append a short block to `.cursor/superpowers/log/YYYY-MM-DD.md` (goal, spec/plan, skills, consequential files, decisions, status). Not after every approval.

When I close a plan in chat — intent like «закрывай план», «считаю, что все планы выполнены», «заканчиваем работу и обновляем документацию», «считай работу выполненной» — ask me first. Name the plan files and every as-is spec or `sight-*` skill that still describes the old behavior. Stamp `executed` and update those docs only after I confirm. No plan file does not skip the doc list. «Ок» on one diff is not that confirmation. Checklist: `.cursor/rules/superpowers.mdc`.

## Stack

- Angular 22 (zoneless), TypeScript strict, SCSS, Angular Material
- Cesium, OpenLayers, Turf, proj4, odf-kit
- Tests: Vitest 4.1 (`ng test` / `@angular/build:unit-test`), colocated `*.spec.ts`
- Prettier: `printWidth` 100, `singleQuote` true

## Layout

- `src/app/planet/` — map viewer, tools, Cesium; alias `@/*`
- `src/app/global/` — shared UI, theme, interceptors; alias `@global/*`
- `src/app/landing-page/` — landing; alias `@landing/*`
- `src/environments/` — `environment.ts` (prod), `.development.ts`, `.test.ts`
- `public/` — static assets copied into the build
- `docs/` — generated GitHub Pages output, not a source tree
- `.cursorignore` — extra Agent/index exclusions on top of `.gitignore` (`docs/` is committed but ignored by Cursor)

## Commands

```bash
npm start          # ng serve, host 0.0.0.0 port 9002
npm test           # Vitest via ng test
npm run build:docs # write GitHub Pages build into docs/
```

## Conventions

- Standalone components. File names omit `.component` (`draw-mark.ts`, not `draw-mark.component.ts`).
- Colocate `*.ts`, `*.html`, `*.scss`, `*.spec.ts`. Nest a feature's services under `services/<name>/`.
- Selectors have no `app-` prefix except `app-root` (Angular `prefix` is empty).
- Injected services are often named with a `$` prefix (`$drawMarkService`).
- New tests must call `provideZonelessChangeDetection()`.
- Follow existing folder patterns. Do not invent a parallel architecture.
- Do not commit secrets, `node_modules`, `.worktrees/`, or `.superpowers/`.
- Classes Evgeniy wrote stay classes. Do not turn them into interfaces, type aliases, or other shapes that TypeScript erases from the build, even when the file has no `instanceof` yet. He may add that check later. Example: `UserRegistrationData`.

## Agent permissions

Shared Auto-review allowlist and classifier hints: `.cursor/permissions.json` (commit this). Personal overlay for all projects: `~/.cursor/permissions.json`. Do not allowlist the prefix `git` — it matches `git push`. Keep read-only git prefixes (`git status`, `git diff`, `git log`, `git show`) plus `git add` and `git commit` for local test/docs commits. Push, deploy, `npm publish`, amend, `--no-verify`, and destructive deletes stay on approval.

Matching prefixes (`npx ng test`, `npx.cmd ng test`, `ng test`, `npm test`, `git add`, `git commit`, read-only git, `ls`, `head`, `dir`, `Get-ChildItem`, `gci`) are already approved. Parent **and every Task/SDD/reviewer subagent** must run them without a user-facing approval card and without asking in chat.

The card appears if an agent retries a classifier block with `request_smart_mode_approval` / `requestSmartModeApproval`, **or** if the command is not actually prefix-matched. **Never set that flag** for an allowlisted prefix. Never `git diff --no-index` / `/dev/null` (classifier cards it). Never `;`-chain a non-allowlisted first token after `git diff`. If Auto-review still blocks `npx ng test` / `npm test` / `git diff` / `dir`, the worker returns BLOCKED; the parent reruns the same command.

Always-on rule: `.cursor/rules/auto-review-allowlist.mdc`.

IDE Run Mode: **Auto-review** (Settings → Agents → Approvals & Execution). Cursor CLI is separate: `approvalMode` in `~/.cursor/cli-config.json`.
