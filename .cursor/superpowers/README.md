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

Дочерние (один Superpowers-план = одна из них):

- [Viewer, scene, camera, CRS](./specs/2026-09-17-sight-viewer-crs-design.md)
- [map tools](./specs/2026-09-17-sight-map-tools-design.md)
- [UI, theme, device](./specs/2026-09-17-sight-ui-theme-design.md)
- [GitHub Pages](./specs/2026-09-17-sight-github-pages-design.md)

Новая **продуктовая** архитектурная спека — файл `specs/YYYY-MM-DD-<topic>-design.md` и строка в этом списке плюс таблица в корневой product-спеке. Не класть сюда процессные спеки (тесты, раннер).

## Process (не product)

- [Unit-test suite (Vitest)](./specs/2026-09-18-sight-unit-test-suite-design.md) — покрытие поведением. Не строка в таблице фич продукта.
  Планы 0–5 **executed** (не гонять заново): [0 hygiene](./plans/2026-09-18-unit-test-hygiene.md) → [1 ui-theme](./plans/2026-09-18-unit-test-ui-theme.md) → [2 viewer-crs](./plans/2026-09-18-unit-test-viewer-crs.md) → [3 drawing](./plans/2026-09-18-unit-test-drawing-tools.md) → [4 measuring](./plans/2026-09-18-unit-test-measuring-tools.md) → [5 list/KML/ODS/windows](./plans/2026-09-18-unit-test-list-export-windows.md). CI: [2026-09-20-ci-and-kml-sanitize](./plans/2026-09-20-ci-and-kml-sanitize.md).
