# Superpowers artifacts

Каталог — override дефолтных путей Superpowers (`docs/superpowers/…` сюда не подходит: `docs/` это сборка GitHub Pages).

Спеки, планы и журнал сессий коммитятся. Не писать их в `docs/`.

| Kind | Location |
|---|---|
| Design specs | `specs/` |
| Implementation plans | `plans/YYYY-MM-DD-<feature-name>.md` (пока пусто) |
| AI session log | [`log/`](./log/) — `log/YYYY-MM-DD.md`, append-only |

## Specs (as-is, 2026-09-17)

Индекс продукта: [specs/2026-09-17-sight-product-design.md](./specs/2026-09-17-sight-product-design.md)

Дочерние (один Superpowers-план = одна из них):

- [Viewer, scene, camera, CRS](./specs/2026-09-17-sight-viewer-crs-design.md)
- [map tools](./specs/2026-09-17-sight-map-tools-design.md)
- [UI, theme, device](./specs/2026-09-17-sight-ui-theme-design.md)
- [GitHub Pages](./specs/2026-09-17-sight-github-pages-design.md)

Новая архитектурная спека — файл `specs/YYYY-MM-DD-<topic>-design.md` и строка в этом списке плюс таблица в корневой product-спеке.
