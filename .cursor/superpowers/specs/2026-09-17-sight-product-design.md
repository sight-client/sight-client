---
status: approved-as-is
created: 2026-09-17
---

# Sight — product design (as-is)

> **Для агентов:** снимок текущего продукта, не роадмап. Дочерние спеки — источник правды по подсистемам. Пункты README «на потом» (поиск, навигация, L10n, пользовательские растры/3D) **вне скоупа**, пока не одобрена новая спека.

**Цель:** бесплатная фронтенд-карта в браузере на GitHub Pages: координаты, рисование/измерения, экспорт/импорт векторов, камера и тема.

**Non-goals (не начинать без новой одобренной спеки):** backend/API, Keycloak, Cesium Ion, использование OpenLayers, включение роута landing, geocoder/поиск, английская L10n, пользовательские растры/3D Tiles.

## Product

Sight (пакет `sight-client` v1.4.0) — некоммерческий CV-проект. Хостинг — статический GitHub Pages. Серверной сессии нет: данные живут в сцене Cesium, в `localStorage` (тема / scene mode) или в файлах, которые пользователь сам скачивает/загружает (KML/KMZ, ODS).

**Пользователи:** любой браузер; тач поддерживается. Тексты UI на русском.

## Constraints (глобальные)

- Растры OSM: `https://tile.openstreetmap.org/` (ToS; провайдера не менять без одобрения).
- Рельеф: только `EllipsoidTerrainProvider` — без world terrain / 3D Tiles.
- `docs/` — **результат сборки** (`ng build --configuration docs`), не исходники. См. [спеку GitHub Pages](./2026-09-17-sight-github-pages-design.md).
- Секретов в репозитории и в клиентском бандле нет.
- Артефакты Superpowers: `.cursor/superpowers/specs|plans/`. Проектные скилы: `.cursor/skills/sight-*/SKILL.md`. Соглашения: `AGENTS.md`.

## Stack

| Слой | As-is |
|---|---|
| App | Angular 22, zoneless (`provideZonelessChangeDetection`), standalone, `OnPush` |
| Map | Cesium 1.144, `@znemz/cesium-navigation` |
| Geodesy | `proj4`, `@turf/turf`. `egm96-universal` есть в `package.json`, но **в `src/` не импортируется** |
| UI | Angular Material / CDK, SCSS |
| Files | `odf-kit` (ODS), Cesium KML, `dompurify` |
| Tests | Vitest 4.1 (`ng test`, `@angular/build:unit-test`, jsdom). `environment.test.ts` через build-конфиг `testing` |
| Unused dep | `ol` (OpenLayers) — не подключать без одобрения |

Алиасы путей: `@/*` → `src/app/planet/*`, `@global/*` → `src/app/global/*`, `@landing/*` → `src/app/landing-page/*`.

## Routing and shell

- `src/app/app.routes.ts`: `path: ''` → `Planet`, title `Sight: map`. Wildcard → `''`.
- Landing (`LandingPage`) **закомментирован**. Не включать без одобрения.
- Bootstrap: `src/main.ts` задаёт `CESIUM_BASE_URL = '/sight-client/assets/cesium/'`.
- `App` стартует сервисы темы и держит `RouterOutlet`.

HTTP interceptors (`app.config.ts`): `badHtmlInterceptor`, `doubleReqPreventionInterceptor`, `getReqCachingInterceptor`; класс `DownloadProgressInterceptor`. API-proxy interceptor закомментирован (бэкенда нет).

## Module map

| Область | Path | Дочерняя спека |
|---|---|---|
| Viewer, CRS, камера, координаты под курсором | `src/app/planet/common/`, camera-view-tools | [viewer-crs](./2026-09-17-sight-viewer-crs-design.md) |
| Рисование, измерения, список, KML/ODS, плавающие окна | `src/app/planet/components/tools/`, `floating-windows/` | [map-tools](./2026-09-17-sight-map-tools-design.md) |
| Тема, Material, устройство, меню | `src/app/global/`, `main-menu` | [ui-theme](./2026-09-17-sight-ui-theme-design.md) |
| Хостинг Pages, `docs/`, env | `angular.json`, `src/main.ts`, `src/environments/` | [github-pages](./2026-09-17-sight-github-pages-design.md) |

`Planet` (`src/app/planet/planet.ts`) — корень композиции: **provides** `ViewerService`, `CursorCoordsService`, `ToolsService`, сервисы drawing/measure/camera, `FloatingWindowsService`, `DrawingsListService` (скоуп компонента, не `providedIn: 'root'`).

## Features (README → спека)

| Фича | Спека |
|---|---|
| Карта OSM 3D / 2D / Columbus | viewer-crs |
| Координаты под курсором; СК WGS-84, СК-42 м, СК-42 °, ПЗ-90.11 | viewer-crs |
| Метки и фигуры; экспорт/импорт ODS | map-tools |
| Экспорт/импорт KML / KMZ | map-tools |
| Линейные и площадные измерения | map-tools (+ геодезия в viewer-crs) |
| Камера, скриншот, fullscreen | viewer-crs (виджет Cesium + camera tools) |
| Светлая/тёмная + четыре палитры | ui-theme |
| Тач / mobile | ui-theme + viewer-crs (мышь vs центр canvas) |

## Planning rule

Один план Superpowers закрывает **одну дочернюю спеку** (или явно названный срез). Не планировать весь продукт одним планом. В каждой задаче плана указывать 1–3 пути `.cursor/skills/…`.

## Спроси до

Всё из Non-goals; новая подложка/рельеф; новая СК; новый класс инструментов; включение landing или API interceptors.
