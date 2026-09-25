---
name: sight-cesium-map
description: Use when creating or changing Cesium Viewer, scene modes, imagery, camera, picking, requestRender, or map performance in Sight. Not for drawing-tool scaffolding or proj4 CRS conversion.
---

# Sight — Cesium Viewer и производительность

## Overview

Один Viewer живёт в `ViewerService`. Создание — `afterNextRender` в `run-viewer.directive.ts`, после `viewerHasLoaded()` стартуют cursor-coords и tools **по цепочке effect**.

## Viewer

- Тип `CustomViewer`: кастомные поля (`newPickedEntity`, `clampToGround`) — сигналы **на полях viewer**, не `signal(viewer)`.
- Комментарий в `viewer.service.ts` обязателен: `signal(viewer)` пересоздаёт объект и ломает ссылки.
- `clampToGround` и scene mode — отдельные сигналы + `effect`, который пишет в viewer.
- Scene modes: `'3D' | '2D' | 'Columbus'` (`sceneModeLiterals`). Persist в `localStorage` (`sceneMode`) через `isSceneModeLiteral`, не `as SceneModeLiterals`. Сравнивать `scene.mode` с `Cesium.SceneMode.*`, не с `1`/`2`/`3`. В 2D/Columbus учитывать конфликт label/billboard (`nowSceneModeDescription`).
- Imagery: OSM `https://tile.openstreetmap.org/` через `setImageryProvider`. Не менять провайдер тайлов без спроса (ToS OSM, GH Pages).
- Сейчас `requestRenderMode: false`. Не включать без спроса: сломает ожидания непрерывного рендера.

## Производительность

- Не создавать Viewer повторно. Не оборачивать его в Angular signal.
- `ScreenSpaceEventHandler` и listeners: `.destroy()` / `removeInputAction` в `ngOnDestroy` (как `tools.service.ts`, `cursor-coords.service.ts`).
- Не грузить 3D Tiles / terrain / Ion assets без спроса (объём, ключи, не-OSM лицензии).
- Тяжёлые расчёты — существующие lib (`basic-measure-calculations.lib.ts`), не в шаблоне.

План `.cursor/superpowers/plans/2026-09-23-cursor-canvas-resize.md` — **executed** 2026-09-25. Центр канваса на `resize` — `fromEvent` в `CursorCoordsService`, не `@HostListener` на сервисе.

## Спроси до

- Cesium Ion, Google photorealistic 3D, свой terrain.
- Смена `requestRenderMode`.
- Второй Viewer или переход на OpenLayers.
