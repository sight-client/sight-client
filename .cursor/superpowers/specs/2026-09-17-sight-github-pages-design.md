---
status: approved-as-is
created: 2026-09-17
parent: 2026-09-17-sight-product-design.md
---

# Sight — GitHub Pages and static build (as-is)

> **Parent:** [product](./2026-09-17-sight-product-design.md). **Скил для SDD brief:** `.cursor/skills/sight-change-control/SKILL.md`.

**Цель:** отдать SPA как статику по `https://<user>.github.io/sight-client/`, ассеты Cesium — в `docs/`.

## Build

| Команда | Роль |
|---|---|
| `npm start` | `ng serve`, host `0.0.0.0`, порт **9002**, конфигурация по умолчанию `development` |
| `npm test` | Karma / Jasmine; `fileReplacements` → `environment.test.ts` |
| `npm run build:docs` | `ng build --configuration docs` |
| `npm run watch` | watch-сборка development |

Конфигурация `docs` (`angular.json`): `outputPath.base = docs`, `browser = ""`, `baseHref = "/sight-client/"`. Хеширование как у production; это артефакт Pages.

У `development` тоже `baseHref: "/sight-client/"`, чтобы локальные пути совпали с Pages (`CESIUM_BASE_URL` в `src/main.ts` — `'/sight-client/assets/cesium/'` во всех режимах).

Статика Cesium: glob `node_modules/cesium/Build/Cesium` → `assets/cesium`. `public/` копируется как есть (шрифты, несколько PNG).

## `docs/` — не исходники

Закоммиченное дерево `docs/` — последняя сборка Pages (HTML, hashed JS, workers Cesium). Агенту нельзя:

- править `docs/` как исходники приложения;
- писать туда спеки/планы Superpowers (они в `.cursor/superpowers/`);
- индексировать (в `.cursorignore` указан `docs/`).

Когда изменения должны уйти на сайт, человек запускает `build:docs` и при необходимости коммитит `docs/`. Второй каталог вывода без одобрения не заводить.

`docs/404.html` нужен, чтобы GitHub Pages отдавал SPA на неизвестных путях; комментарии в `app.routes.ts`: непустой path требует копии `index.html` как `404.html`. Сейчас `path: ''` как раз под Pages.

Не ставить `path: 'sight-client'` — имя репозитория уже в `baseHref`.

## Environments

`src/environments/environment.ts` — `production: true`, `apiUrl` / `catalogUrl` **закомментированы**.  
`environment.development.ts` — `production: false`, те же закомментированные API.  
`environment.test.ts` — подмена для тестов.

`connections.config.ts` целиком в комментариях (старые API/catalog/Keycloak). Не раскомментировать без спеки бэкенда.

## Ignore / worktrees

`.gitignore`: `node_modules`, `.angular`, `.worktrees/` и т.д. **Не** `docs/` (публикуется). **Не** `.cursor/superpowers/` (в git).

`.cursorignore` дополнительно закрывает агенту `docs/`, вендор, секреты.

## Спроси до

Смена `baseHref` или `CESIUM_BASE_URL`; раздача с корня репо без `/sight-client/`; включение API URL в env; SSR; перенос вывода Pages из `docs/`.
