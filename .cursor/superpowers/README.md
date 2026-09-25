# Superpowers artifacts

Каталог — override дефолтных путей Superpowers (`docs/superpowers/…` сюда не подходит: `docs/` это сборка GitHub Pages).

Спеки, планы и журнал сессий коммитятся. Не писать их в `docs/`.

| Kind | Location |
|---|---|
| Design specs | `specs/` |
| Implementation plans | `plans/YYYY-MM-DD-<feature-name>.md` |
| AI session log | [`log/`](./log/) — `log/YYYY-MM-DD.md`, append-only |

## Specs (as-is, 2026-09-17)

Индекс продукта: [specs/2026-09-17-sight-product-design.md](./specs/2026-09-17-sight-product-design.md)

Дочерние as-is (один Superpowers-план = одна из них, пока нет to-be среза):

- [Viewer, scene, camera, CRS](./specs/2026-09-17-sight-viewer-crs-design.md)
- [map tools](./specs/2026-09-17-sight-map-tools-design.md)
- [UI, theme, device](./specs/2026-09-17-sight-ui-theme-design.md)
- [GitHub Pages](./specs/2026-09-17-sight-github-pages-design.md)

[mobile UI chrome](./specs/2026-09-21-mobile-ui-chrome-design.md) — implemented, merged into as-is (ui-theme / viewer-crs / map-tools). План [2026-09-21-mobile-ui-chrome](./plans/2026-09-21-mobile-ui-chrome.md) **executed** 2026-09-22 (не гонять заново).

Новая **продуктовая** архитектурная спека — файл `specs/YYYY-MM-DD-<topic>-design.md` и строка в этом списке плюс таблица в корневой product-спеке. Не класть сюда процессные спеки (тесты, раннер).

## Process (не product)

- [Unit-test suite (Vitest)](./specs/2026-09-18-sight-unit-test-suite-design.md) — покрытие поведением. Не строка в таблице фич продукта.
  Планы 0–5 **executed** (не гонять заново): [0 hygiene](./plans/2026-09-18-unit-test-hygiene.md) → [1 ui-theme](./plans/2026-09-18-unit-test-ui-theme.md) → [2 viewer-crs](./plans/2026-09-18-unit-test-viewer-crs.md) → [3 drawing](./plans/2026-09-18-unit-test-drawing-tools.md) → [4 measuring](./plans/2026-09-18-unit-test-measuring-tools.md) → [5 list/KML/ODS/windows](./plans/2026-09-18-unit-test-list-export-windows.md). CI: [2026-09-20-ci-and-kml-sanitize](./plans/2026-09-20-ci-and-kml-sanitize.md).
- Качество TypeScript (рефакторинг, поведение инструментов то же). Планы **executed** 2026-09-25 (не гонять заново): [кнопки панели](./plans/2026-09-23-tool-panel-shared-button.md), [ошибки](./plans/2026-09-23-error-reporting.md), [авторизация](./plans/2026-09-23-user-data-auth-flow.md), [типы](./plans/2026-09-23-type-holes.md), [ресайз курсора](./plans/2026-09-23-cursor-canvas-resize.md). `strictPropertyInitialization` не включать.
