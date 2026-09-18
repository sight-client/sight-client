---
name: sight-change-control
description: Use when adding npm dependencies, changing architecture, renaming files to Angular Style Guide, switching test runners, enabling OpenLayers, adding a backend, or changing GitHub Pages / docs/ output.
---

# Sight — контроль изменений стека

## Overview

Соглашения репозитория важнее «канона» Angular. Новые практики можно **предложить**, внедрять — только после явного «да».

## Спроси человека до

- Новая зависимость или замена существующей (`ol`, NgRx, SSR, i18n-фреймворк, Vitest 5+).
- Смена нейминга: `*.component.ts`, префикс `app-`, отказ от `$` у инжектов.
- Бэкенд, прокси API, секреты в клиенте, Cesium Ion token в репозитории.
- Смена `outputPath` / запись исходников в `docs/` (это GitHub Pages-сборка).
- Включение `requestRenderMode` у Viewer, смена unit-test раннера (уход с Vitest 4.1 / `@angular/build:unit-test`).

## GitHub Pages

- Хостинг только статический. `baseHref` для docs: `/sight-client/`.
- Сборка: `npm run build:docs` → каталог `docs/`. Не править `docs/` вручную как исходники.
- Нет серверных cookie/сессий. Всё пользовательское — `localStorage` или файл (KML/ODS), который пользователь сам загружает.

## Не использовать

- `ol` / OpenLayers — в `package.json` есть, в `src/` нет. Карта = Cesium.
- Karma / Jasmine как раннер — снят; unit-тесты = Vitest 4.1 через `ng test`.
- Копирование Superpowers-скилов (TDD, отладка, review) сюда.

## After asking

Если человек отказал — работай в текущем стеке. Если согласился — узкий diff, без попутного рефакторинга нейминга по всему репо.
