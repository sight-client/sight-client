---
status: characterization-complete
created: 2026-09-18
kind: process
parent: none
---

# Sight — unit-test suite (Vitest)

> **Не продуктовая дочерняя спека.** Не добавлять в таблицу фич [product](./2026-09-17-sight-product-design.md). Контракт unit-сюиты после Karma → Vitest. Исполнители планов читают этот файл плюс дочернюю product-спеку среза.

**Цель:** характеризовать текущее поведение живого кода в jsdom так, чтобы падение теста означало баг, а не «у файла нет spec».

## Decisions (зафиксировано 2026-09-18)

| Тема | Выбор |
|---|---|
| Покрытие | Поведение, не `%` statements. Нет порога Vitest coverage. |
| Подход | Характеризация as-is. Production не менять в сессиях покрытия. |
| Cesium | Не создавать `Cesium.Viewer` / WebGL. Мок `ViewerService`. |
| Exclude | `drawing-tool-blank/**` и `api-url-chunk-proxy/**` остаются снаружи. `AutofocusDirective` — внутри. |
| Нарезка | Нулевой план гигиены, затем пять доменных. GitHub Pages unit-планом не закрывается. |
| Баги | Находка в характеристике — парковать, не чинить в той же сессии. Фикс — отдельный TDD. |

## Non-goals

- Playwright / Cypress / component harness как обязательный CI.
- Снапшоты шаблонов, отдельный `vitest.config.ts` / `runnerConfig`.
- Порог coverage, Vitest 5+, возврат на Karma/Jasmine.
- Включение landing-роута или API-proxy interceptor.
- Рефакторинг production «чтобы тестировалось», `src/testing/` как новый слой.
- Покрытие `app.config.ts`, `environment*.ts`, токенов без логики «ради файла».
- Тесты, которым нужен реальный Viewer.

## Живое vs снаружи

**Внутри сюиты:** всё, что входит в `tsconfig.app.json`, плюс `LandingPage` (компонент есть; роут в `app.routes.ts` не включать) и `AutofocusDirective`.

**Снаружи (exclude остаётся):**

- `src/app/planet/components/tools/drawing-tools/components/drawing-tool-blank/**`
- `src/app/global/interceptors/api-url-chunk-proxy-interceptor/**`

## Готово (одна исполнительная сессия)

1. `npx ng test --no-watch` завершается с кодом 0 (вся сюита, не только срез).
2. В срезе плана публичные ветки сервисов / lib / interceptor / listener / directive с логикой имеют именованные тесты на эффект, не только `should create`.
3. UI-компоненты: `should create` плюс только поведение, которое есть в классе или шаблоне (клик, `@Output`, сигнал, `localStorage`).
4. Production-diff пустой, кроме гигиены spec/TestBed/exclude autofocus.
5. Найденный баг записан в блок «Parked bugs» плана / журнал сессии, код продукта не «чинят».

## Конвенции spec

Раннер: Vitest 4.1 через `@angular/build:unit-test` (jsdom). Команда: `npm test` / `npx ng test --no-watch`. `buildTarget` `sight-client:build:testing` → `environment.test.ts`. Globals: `"types": ["vitest/globals"]` в `tsconfig.spec.json`.

- Colocated `foo.spec.ts` рядом с `foo.ts`.
- Каждый `TestBed`: `provideZonelessChangeDetection()`.
- Standalone: `imports: [ComponentUnderTest]`, не `declarations`.
- Vitest: `toBe(true)` / `toBe(false)`, не Jasmine `toBeTrue()` / `toBeFalse()`.
- Геодезия: `toBeCloseTo`, не `===` для float.
- Чистые lib (`humanify.lib.ts`, `common-global.lib.ts`, `coord-sistems.lib.ts`, `basic-measure-calculations.lib.ts`, `buttons-subgroups-visibility.ts`) — без TestBed, прямые вызовы.
- Не добавлять production-методы только для тестов.
- Ожидания — литералы / ручные фикстуры, не зеркало кода под тестом.

### Канонический фейк ViewerService

Копировать в spec, не заводить общий `src/testing/` в этой работе. `viewerHasLoaded` по умолчанию `false`, чтобы `RunViewerDirective` не ставил OSM и не звал `startCursorCoordsService`.

```typescript
import { signal } from '@angular/core';
import * as Cesium from 'cesium';
import { ViewerService } from '@/common/services/viewer-service/viewer.service';

function fakeViewerService(overrides: Partial<{ viewer: object }> = {}) {
  return {
    viewer: {
      scene: { canvas: document.createElement('canvas'), mode: Cesium.SceneMode.SCENE3D },
      camera: { changed: { addEventListener: () => {} }, moveEnd: { addEventListener: () => {} } },
      ...overrides.viewer,
    },
    viewerHasLoaded: signal(false),
    clampToGroundSignal: signal(true),
    nowSceneMode: signal(Cesium.SceneMode.SCENE3D),
    nowSceneModeDescription: signal<'3D' | '2D' | 'Columbus'>('3D'),
    cameraIsFlyingAround: signal(false),
    setClampToGround: () => {},
    setNowSceneMode: () => {},
    setCameraFlyingAroundFlag: () => {},
    getNewViewer: () => {},
    setImageryProvider: () => {},
  } as unknown as ViewerService;
}
```

Сервисы, provided на `Planet` (не `root`): явно класть в `providers` TestBed вместе с фейками зависимостей.

Компоненты с `detectChanges()`, которые тянут `RunViewerDirective` / `Planet`: не вызывать `getNewViewer` на реальном Viewer — фейк или не дергать `detectChanges` до подмены.

### Характеризация vs TDD

Существующее поведение: написать assertion по коду as-is; прогон **должен пройти**. Если падает — либо неверно прочитан код (править тест), либо баг (парковать). Не ломать production, чтобы увидеть красный.

Красный цикл обязателен для **нового** production и фикса бага. Стартовая характеризация as-is (планы 0–5) **выполнена** 2026-09-18…2026-09-20 — не гонять эти планы заново.

## Планы (порядок сессий) — executed

Не очередь задач. Файлы — история нарезки. Новое покрытие — отдельный план или TDD по багу.

| # | План | Product-срез | Скилы (1–3) | Статус |
|---|---|---|---|---|
| 0 | [2026-09-18-unit-test-hygiene](../plans/2026-09-18-unit-test-hygiene.md) | — | `sight-testing`, `sight-change-control` | executed 2026-09-18 |
| 1 | [2026-09-18-unit-test-ui-theme](../plans/2026-09-18-unit-test-ui-theme.md) | [ui-theme](./2026-09-17-sight-ui-theme-design.md) | `sight-testing`, `sight-angular-ui` | executed 2026-09-20 |
| 2 | [2026-09-18-unit-test-viewer-crs](../plans/2026-09-18-unit-test-viewer-crs.md) | [viewer-crs](./2026-09-17-sight-viewer-crs-design.md) | `sight-testing`, `sight-geodesy`, `sight-cesium-map` | executed 2026-09-20 |
| 3 | [2026-09-18-unit-test-drawing-tools](../plans/2026-09-18-unit-test-drawing-tools.md) | [map-tools](./2026-09-17-sight-map-tools-design.md) | `sight-testing`, `sight-map-tools` | executed 2026-09-20 |
| 4 | [2026-09-18-unit-test-measuring-tools](../plans/2026-09-18-unit-test-measuring-tools.md) | [map-tools](./2026-09-17-sight-map-tools-design.md) | `sight-testing`, `sight-map-tools`, `sight-geodesy` | executed 2026-09-20 |
| 5 | [2026-09-18-unit-test-list-export-windows](../plans/2026-09-18-unit-test-list-export-windows.md) | [map-tools](./2026-09-17-sight-map-tools-design.md) | `sight-testing`, `sight-map-tools`, `sight-client-security` | executed 2026-09-20 |

CI: [2026-09-20-ci-and-kml-sanitize](../plans/2026-09-20-ci-and-kml-sanitize.md) — executed 2026-09-20 (`ng test` на Actions + санитайз KML).

## Спроси до

Всё из `sight-testing` «Спроси до»; смена exclude blank/proxy; порог coverage; общий `src/testing/`; WebGL Viewer.
