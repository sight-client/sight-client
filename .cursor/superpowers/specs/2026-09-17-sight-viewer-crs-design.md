---
status: approved-as-is
created: 2026-09-17
parent: 2026-09-17-sight-product-design.md
---

# Sight — Viewer, scene, camera, CRS (as-is)

> **Parent:** [product](./2026-09-17-sight-product-design.md). **Скилы для SDD brief:** `.cursor/skills/sight-cesium-map/SKILL.md`, `.cursor/skills/sight-geodesy/SKILL.md`.

**Цель:** один Cesium `Viewer` на эллипсоиде WGS-84, подложка OSM, три режима сцены, координаты курсора/центра в четырёх СК, инструменты камеры.

## Boot sequence

Владелец: `RunViewerDirective` (`[runViewerDirective]`) на контейнере глобуса в `planet.html`.

1. `afterNextRender` → `ViewerService.getNewViewer(el.nativeElement)`.
2. `effect` при `viewerHasLoaded()` → OSM `OpenStreetMapImageryProvider` через `setImageryProvider`.
3. Следующий `effect` → `CursorCoordsService.startCursorCoordsService()` (`untracked`).
4. При `underMouseEntityHasLoaded()` → `ToolsService.startToolsService()`.
5. При `toolsServiceHasStarted()` → `DrawingsListService.startDrawingsListService()`.

Цепочку не переставлять. Второй Viewer не создавать.

`Planet.afterNextRender` также передаёт `mainSightContainerRef` в `CursorCoordsService.getWatchedContainerRef`.

## ViewerService

Файл: `src/app/planet/common/services/viewer-service/viewer.service.ts`. Provided на `Planet`.

**Не оборачивать `viewer` в `WritableSignal`.** Объект большой; `set`/`update` меняют ссылку. Реактивность clamp/сцены/picked entity — **сигналы на полях** `CustomViewer` плюс параллельные сигналы сервиса (`clampToGroundSignal`, `_nowSceneMode`, `viewerHasLoaded`).

`viewer` типизирован как `CustomViewer = {} as CustomViewer` до `getNewViewer`, чтобы реже проверять undefined; до `afterNextRender` всё равно optional chaining.

### Constructor options (норматив as-is)

- Виджеты выкл.: `animation`, `baseLayerPicker`, `geocoder`, `homeButton`, `infoBox`, `sceneModePicker`, `selectionIndicator`, `timeline`, `navigationHelpButton`, `projectionPicker`.
- `fullscreenButton: false` (штатный контрол Cesium выкл.; fullscreen — `ToggleFullscreen` в CameraViewTools: `requestFullscreen(document.body)` / `exitFullscreen`, не `viewer.container`; иконка и тултип enter/exit по `fullscreenchange`).
- `sceneMode` из `_nowSceneMode` (persist `localStorage.sceneMode`: `'3D' | '2D' | 'Columbus'`).
- `terrainProvider`: `EllipsoidTerrainProvider`.
- `mapProjection`: `GeographicProjection` (не Web Mercator).
- `requestRenderMode: false` — не включать без одобрения.
- `msaaSamples: 4`, `shadows: false`.
- Начальный `imageryProvider`: `GridImageryProvider` (обход, чтобы смена на OSM не дёргала кадр). OSM ставится после загрузки.

Кастомные поля после construct: `newPickedEntity` / `Id`, `forcedPickedEntity` / `Id` (signals), `clampToGround` boolean (по умолчанию true).

Также: `viewerDragDropMixin` (drop CZML, `clearOnDrop: false`, `flyToOnDrop: true`). Ошибки drop — `alert`.

Стартовая камера: `startCamDestination` (вид на РФ), pitch −90°.

`setClampToGround` / `setNowSceneMode` пишут сигналы; `effect` копирует clamp в `viewer.clampToGround`. `nowSceneModeDescription` — `computed`; инструменты по нему снимают clamp в 2D/Columbus (конфликт label и billboard).

Picking: `setNewPickedEntity` обновляет и «new», и «forced» сигналы и переключает `_forcedEntityPickingEffectFlag`, чтобы плавающее окно открылось повторным кликом.

## Imagery and navigation

- URL OSM ставится только после `viewerHasLoaded`. URL тайлов не менять без одобрения.
- Компас/зум: `ZnemzNavigationMixin` (`@znemz/cesium-navigation`), не Cesium `homeButton`. Блок компас+зум в правом нижнем углу (бывшая позиция Cesium fullscreen), в том числе на UA mobile. Файлы пакета не меняются: на мобильном UA `attachNavigationTouchBridge` переводит touch виджета в `mousedown` / `mousemove` / `mouseup` / `dblclick` / `click`, которые миксин уже слушает. `preventDefault` только у жеста, начатого на `.compass` или `.navigation-controls`.
- Подписи кольца, гироскопа и кнопок `+/дом/−` — `MatTooltip` (задержка 1000, позиция слева), не атрибут `title`. На компасе долгое удержание подпись не открывает, чтобы не спорить с перетаскиванием. Долгое удержание кнопки зума показывает подпись и камеру не зумит.
- Высота камеры в UI: `CameraHeightTool`.

## Camera tools (остаются в этой спеке)

Панель: `FlyAround`, `TakeScreenshot`, `SceneModeChanger`, `ToggleFullscreen` в `tools-panel.ts`.

`CameraViewToolsService` (providers `Planet`): имена `flyAround`, `pointView`. `pointView` есть в типах/сторе «на потом»; отдельной кнопки «вид из точки» в UI нет. Плавающие окна camera tools **закомментированы** в `tools-floating-windows.ts`. Временный стор сущностей; смена clamp через `ToolsService` при смене режима сцены.

`SceneModeChanger` пишет `localStorage.sceneMode` и `ViewerService.setNowSceneMode`.

Скриншот: холст без UI (как в README).

## Mouse coordinates

`CursorCoordsService`: скрытая сущность Cesium `id: 'mouse'` в `CustomDataSource('mousePosition')` для pick/позиции; видимый HUD — HTML `CursorCoordsInfo` (label Cesium давал фризы).

- Desktop: `mousemove` по canvas.
- Mobile (`CheckMobileDeviceService`): координаты из **центра canvas**; `camera.moveEnd` + touch move. Не рассчитывать на курсор. Чекбокс «координаты под курсором» не переименовывать: на телефоне «курсор» — центр холста.

Хром HUD на узком экране (столбик, шеврон, две колонки, ширина стека) — [ui-theme](./2026-09-17-sight-ui-theme-design.md) / [mobile UI chrome](./2026-09-21-mobile-ui-chrome-design.md).

Отображение СК через `CoordSystems`. Выбранная СК видна в HUD.

## Coordinate systems

Файл: `src/app/planet/common/lib/coord-systems.lib.ts`.

`crsLiterals`: `'WGS-84' | 'СК-42 м' | 'СК-42 °' | 'ПЗ-90.11'`.

| CRS | Единицы | Заметки |
|---|---|---|
| WGS-84 | градусы | Identity; высота над эллипсоидом WGS-84 |
| СК-42 ° | градусы | Красовский, `towgs84=23.57,-140.95,-79.8,0,0.35,0.79,-0.22` (ГОСТ 51794-2008) |
| СК-42 м | метры Гаусса–Крюгера | Зона обязательна; `lon_0 = zone*6-3`, `x_0 = zone500000` |
| ПЗ-90.11 | градусы | `a=6378136`, указанный `towgs84`; высота над эллипсоидом ПЗ-90.11 |

**Инвариант:** сущности Cesium хранят WGS-84 cartesian. На вход — `toWGS84Cartesian` / `toWGS84Cartographic` **до** записи; на выход — `fromWGS84Cartographic`. Все строки SRS только в `CoordSystems.DEFS` — не размазывать `proj4.defs`.

Lon/lat cartographic для API Cesium — **радианы**. Градусы в `Cartographic.toCartesian` без перевода не кормить.

## Geodesic length / area (математика)

`src/app/planet/components/tools/lib/basic-measure-calculations.lib.ts`:

- Длина: `EllipsoidGeodesic.surfaceDistance` плюс гипотенуза по высоте (`calculatePosDistancesWithoutHumanify`). `Cartesian3.distance` — **не** продуктовый путь (срезает дугу эллипсоида).
- Площадь: Turf по массивам градусов WGS-84.
- Отображение: `humanify.lib.ts`.

**Инструменты** измерений (UI, сторы) — в спеке map-tools; они обязаны вызывать эту lib.

## Спроси до

Cesium Ion, Google 3D, свой terrain, `requestRenderMode: true`, проекция Web Mercator, второй Viewer, новая СК, смена URL OSM, подключение `ol`.
