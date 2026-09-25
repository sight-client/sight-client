---
name: sight-map-tools
description: Use when adding or changing map drawing tools, measuring tools, floating windows, entity stores, KML/ODS export, or the drawing-tool-blank scaffold in Sight.
---

# Sight — инструменты карты

## Overview

Новый инструмент, который рисует сущности, копирует заготовку `drawing-tool-blank` и регистрируется в нескольких местах. Не изобретать параллельный стор.

## toolName

`toolName` — ключ стора, `windowName` плавающего окна и поле на entity. Это не произвольная `string`.

Литералы и типы живут в main-сервисе группы:

- рисование: `drawingToolsNames` → `DrawingToolName` в `drawing.service.ts`
- измерение: `measuringToolsNames` → `MeasuringToolName` в `measure.service.ts`
- камера: `cameraViewToolsNames` → `CameraToolName` в `camera-view-tools.service.ts`

Поле на кнопке, сервисе, entity и в ключе стора имеет этот union и совпадает с одним литералом массива. На `Cesium.Entity` оно объявлено в `src/cesium-entity.d.ts`, там же `Entity._children` и `ScreenSpaceEventHandler._initializer`. Не вешать на них `@ts-ignore` и не расширять `toolName` до `string`, не подменять тип локальным алиасом и не ослаблять его в сигнатурах. Проверка «это имя инструмента» — `isDrawingToolName` / `isMeasuringToolName` / `isCameraToolName`, не `as any`. `getRusDrawingToolName` / `getRusMeasuringToolName` / `getRusCameraToolName` принимают только свой union. Обратный маппинг ODS-листа — `isDrawingToolNameRus` и `getOriginDrawingToolName(DrawingToolNameRus)`, без `| string` и без эха неизвестного имени. `exportToolToKml` принимает `DrawingToolName`. Кнопки снимка/полноэкрана/режима сцены — подписи панели, не `CameraToolName`. Активный инструмент в `ToolsService` — `ActiveToolName` (три union плюс `'entityRubber'` и `'flyAroundWithoutPoint'`), не `string`. Новый инструмент добавляет литерал в массив имён своей группы — тип подхватится сам. `ToolOptions.toolName` — объединение трёх union, не `any`. Сам `ToolOptions` без `[key: string]: unknown`; произвольные JSON-поля только в `properties`.

## Рисование

Чеклист из комментария в `drawing-tool-blank.ts` (соблюдать, не сокращать):

1. Имя в `drawingToolsNames` и ветка в `getRusDrawingToolName()` (`drawing.service.ts`).
2. Стор групп сущностей; при clamp-to-ground — в соответствующий `effect`.
3. Флаг «есть сущности» + учёт в `entity-rubber.service.ts` (`storesAreEmpty`).
4. Ссылка в `_allEntitiesListsLinks`.
5. При необходимости: KML (`drawings-list-kml.service.ts`, `setEntitiesGroupDefaultEntity`), список (`drawings-list`), отчёт ODS (`drawings-list-report.service.ts`).
6. Кнопка в родителе (`drawing-tools.ts`), floating window в `tools-floating-windows.ts`.
7. `toolName` на entity должен совпадать с литералом типа `DrawingToolName`.

`drawing-tool-blank` сам по себе не удалять и не превращать в боевой инструмент — это шаблон.

План `.cursor/superpowers/plans/2026-09-23-tool-panel-shared-button.md` — **executed** 2026-09-25. Не возвращать `MutationObserver` / `setStartBtnVisibility`.

## Измерения

- Имена в `measuringToolsNames` / `measure.service.ts`.
- Длины/площади через `basic-measure-calculations.lib.ts` (геодезия эллипсоида, не `Cartesian3.distance` как основной путь).

## Плавающие окна

- Состояние окон: `FloatingWindowsService` (`planet.ts` providers).
- `windowName` = `toolName`. Клик по entity поднимает окно через `forcedPickedEntity`.
- Не заменять на MatDialog/CDK overlay без спроса.

## Спроси до

- Новый класс инструментов (не drawing и не measuring).
- Смена формата экспорта с ODS/KML.
