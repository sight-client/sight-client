---
status: approved-as-is
created: 2026-09-17
parent: 2026-09-17-sight-product-design.md
---

# Sight — map tools (as-is)

> **Parent:** [product](./2026-09-17-sight-product-design.md). **Скилы для SDD brief:** `.cursor/skills/sight-map-tools/SKILL.md`, `.cursor/skills/sight-client-security/SKILL.md`. Формулы геодезии: [viewer-crs](./2026-09-17-sight-viewer-crs-design.md).

**Цель:** рисовать и мерить на глобусе, список/правка сущностей, экспорт/импорт KML/KMZ и ODS, плавающие окна с привязкой к `toolName`.

## Composition

Правая панель: `ToolsPanel` — три группы: drawing, measuring, camera (UI камеры описан в viewer-crs). На `phoneLayout` (≤582) панель по центру снизу (`column-reverse`); `renderToolsGroupTemplates` / `moveToolToDefault` не переписывать. Хром — [ui-theme](./2026-09-17-sight-ui-theme-design.md).

Слева: `DrawingsList` (список вкладки рисования, подлёт, переименование, импорт/экспорт).

Оверлей: `FloatingWindowsContainer` + `FloatingWindowTabsPanel`. Состояние: `FloatingWindowsService` (provided на `Planet`). `windowName === toolName`. Повторный pick — `viewer.forcedPickedEntity` + `forcedEntityPickingEffectFlag`.

Общий ввод с холста: `ToolsService` (`ScreenSpaceEventHandler`, `startToolsService` после cursor-coords). Handler-ы уничтожать на teardown.

`ToolOptions` / `EntitiesGroup` — в `tools.service.ts`. `groupId` важен глобально. `toolName` на entity должен совпадать с замороженными литералами имён.

## Drawing

`DrawingService` + сервисы инструментов, все provided на `Planet`.

`drawingToolsNames`: `drawMark`, `drawLine`, `drawRectangle`, `drawCircle`, `drawPolygon`. Русские подписи — `getRusDrawingToolName`.

Сторы **групп** сущностей живут на `DrawingService`. `effect` clamp-to-ground смотрит `ViewerService.nowSceneModeDescription` (выкл. в 2D/Columbus).

`EntityRubberService` / `EntityRubber`: удаление из этих сторов; в `storesAreEmpty` должен входить каждый флаг «есть сущности».

**Scaffold:** `drawing-tool-blank/` — копируемый шаблон, не боевой инструмент. Не удалять; не регистрировать как живой tool. При добавлении инструмента — нумерованный комментарий в `drawing-tool-blank.ts`:

1. Имя в `drawingToolsNames` + `getRusDrawingToolName`.
2. Стор групп + clamp `effect` при необходимости.
3. Флаг пустоты + `entity-rubber.service.ts`.
4. Ссылка в `_allEntitiesListsLinks`.
5. KML `setEntitiesGroupDefaultEntity`, если импортируется; drawings-list; ODS-отчёт, если таблица.
6. Кнопка в `drawing-tools` / `tools-panel`; окно в `tools-floating-windows.ts`.
7. `toolName` на сущностях = новый литерал.

## Measuring

`MeasureService` + четыре инструмента:

| Literal | UI |
|---|---|
| `calculateLine` | Дистанция |
| `calculateRectangle` | Прямоугольная площадь |
| `calculateCircle` | Площадь окружности |
| `calculatePolygon` | Полигональная площадь |

Длины/площади только через `basic-measure-calculations.lib.ts`. Та же регистрация, что у drawing (имена, сторы, erase, список если нужно).

Комментарий в `CameraViewToolsService`: методы measuring/drawing копировались из общей базы и могут содержать лишнюю логику; «чистить» сразу все типы без одобрения нельзя.

## List, KML, ODS

`DrawingsListService` — старт после tools service. Список, подлёт, дефолтные свойства entity из KML.

`DrawingsListKmlService` — экспорт/импорт `.kml` / `.kmz`. `CustomPropsFromKml` — JSON-безопасные кастомные поля (`toolName`, id, снимки графики). `entity.name` и `billboard.image` из импорта проходят `DOMPurify` (без HTML-тегов); строки с `javascript:` / `data:text/html` отбрасываются. Скил `sight-client-security`.

`DrawingsListReportService` (`providedIn` компонента drawings-list): ODS через `odf-kit`. Колонки: имя инструмента, широта, долгота, высота, СК, радиус. В пайплайне отчёта позиции — WGS-84 cartesian, затем `CoordSystems` / `Humanify`. Импорт ODS должен попадать в сторы drawing, а не в параллельную модель.

Скачивание/загрузка: `getMomentName`, `downloadBlob`, `uploadBlob` в `@global/lib/common-global.lib`.

## Floating windows

`FloatingWindowItem`: сигналы `collapsed`, `hidden`, `isActive`, `top`, опционально `left` / `right`. Когда вкладки сверху-справа (≤1660 / `narrowChromeLayout`) у item есть `left`, не `right`. При создании `collapsed` true если `phoneLayout`. Стопка сверху ~33px + высота шапки; clamp по `innerHeight - 300`.

Не заменять на `MatDialog` без одобрения (импорты dialog в `planet.ts` закомментированы).

## Спроси до

Новый **класс** инструментов (не drawing/measuring/camera); замена ODS/KML; включение плавающих окон камеры; удаление `drawing-tool-blank`; исполнение кода из KML.
