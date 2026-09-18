# Sight Client — agent instructions

Frontend-only Angular map app (Cesium + OSM) for GitHub Pages. Noncommercial.

## Superpowers

Skills from the Superpowers plugin override default agent habits. Check for a relevant skill before acting.

This file overrides Superpowers default artifact paths. **`docs/` is the GitHub Pages build output** (`ng build --configuration docs`). Never write specs, plans, or source there.

| Artifact | Path |
|---|---|
| Design specs | `.cursor/superpowers/specs/` — index: `2026-09-17-sight-product-design.md` |
| Implementation plans | `.cursor/superpowers/plans/YYYY-MM-DD-<feature-name>.md` |
| AI session log | `.cursor/superpowers/log/YYYY-MM-DD.md` (append-only, end of a work unit) |
| Slash command `/save-chat-text` | `.cursor/commands/save-chat-text.md` — полный диалог чата в `.chats/` (gitignored) |
| Isolated worktrees | `.worktrees/<branch-name>/` (gitignored) |

Ask before creating a worktree unless this file already records a standing preference.

Project skills in `.cursor/skills/` (auto-invoke in this chat, do not copy Superpowers): `sight-change-control`, `sight-angular-ui`, `sight-cesium-map`, `sight-map-tools`, `sight-geodesy`, `sight-testing`, `sight-client-security`, `sight-a11y-touch`.

**SDD / Superpowers subagents:** they do not inherit this session's skill list. The controller (parent) must put **1–3 relevant** skill paths into the implementer brief and into the plan task (e.g. `.cursor/skills/sight-map-tools/SKILL.md`). Never dump the whole catalog. Reviewers judge against the spec, this file, and those named skills — not against Angular Style Guide. Permanent conventions stay here and in `.cursor/rules/`; skills are traps the neighboring file will not teach.

**Standing decisions:** when I approve a new convention, stack rule, trap, or checklist, update the existing owner file (`AGENTS.md`, a `.cursor/rules` rule, a `sight-*` skill, or a spec under `.cursor/superpowers/specs/`). If the product contract changes (new/removed feature, tool name, CRS, route, export format), update the owning child spec (and the product index table if the feature is listed there). Do not changelog bugfixes or refactors here. If the owner is unclear, ask.

At the end of a completed work unit, append a short block to `.cursor/superpowers/log/YYYY-MM-DD.md` (goal, spec/plan, skills, consequential files, decisions, status). Not after every approval.

## Stack

- Angular 22 (zoneless), TypeScript strict, SCSS, Angular Material
- Cesium, OpenLayers, Turf, proj4, odf-kit
- Tests: Jasmine + Karma (`ng test`), colocated `*.spec.ts`
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
npm test           # Karma / Jasmine
npm run build:docs # write GitHub Pages build into docs/
```

## Conventions

- Standalone components. File names omit `.component` (`add-mark.ts`, not `add-mark.component.ts`).
- Colocate `*.ts`, `*.html`, `*.scss`, `*.spec.ts`. Nest a feature's services under `services/<name>/`.
- Selectors have no `app-` prefix except `app-root` (Angular `prefix` is empty).
- Injected services are often named with a `$` prefix (`$addMarkService`).
- New tests must call `provideZonelessChangeDetection()`.
- Follow existing folder patterns. Do not invent a parallel architecture.
- Do not commit secrets, `node_modules`, or `.worktrees/`.
