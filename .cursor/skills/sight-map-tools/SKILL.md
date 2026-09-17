---
name: sight-map-tools
description: Use when adding or changing map drawing tools, measuring tools, floating windows, entity stores, KML/ODS export, or the drawing-tool-blank scaffold in Sight.
---

# Sight — инструменты карты

## Overview

Новый инструмент, который рисует сущности, копирует заготовку `drawing-tool-blank` и регистрируется в нескольких местах. Не изобретать параллельный стор.

## Рисование

Чеклист из комментария в `drawing-tool-blank.ts` (соблюдать, не сокращать):

1. Имя в `drawingToolsNames` и ветка в `getRusDrawingToolName()` (`drawing.service.ts`).
2. Стор групп сущностей; при clamp-to-ground — в соответствующий `effect`.
3. Флаг «есть сущности» + учёт в `erase-entity.service.ts` (`storesAreEmpty`).
4. Ссылка в `_allEntitiesListsLinks`.
5. При необходимости: KML (`tools-list-kml.service.ts`, `setEntitiesGroupDefaultEntity`), список (`tools-list`), отчёт ODS (`tools-list-report.service.ts`).
6. Кнопка в родителе (`drawing-tools.ts`), floating window в `tools-floating-windows.ts`.
7. `toolName` на entity должен совпадать с литералом типа `DrawingToolName`.

`drawing-tool-blank` сам по себе не удалять и не превращать в боевой инструмент — это шаблон.

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
