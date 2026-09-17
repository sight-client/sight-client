---
name: sight-geodesy
description: Use when converting coordinates, adding a CRS, displaying mouse position, computing geodesic length or area, or touching proj4 / Turf / SK-42 / PZ-90 in Sight.
---

# Sight — геодезия и проекции

## Overview

Cesium внутри работает в WGS-84. Пользовательские СК: `'WGS-84' | 'СК-42 м' | 'СК-42 °' | 'ПЗ-90.11'` (`crsLiterals` в `coord-sistems.lib.ts`).

## Правила

- Любой ввод в не-WGS84 → `CoordSystems.toWGS84Cartesian` / `toWGS84Cartographic` **до** записи в Cesium entity.
- Вывод в UI → `fromWGS84Cartographic`.
- Определения SRS только в `CoordSystems.DEFS`. Не плодить `proj4.defs` по компонентам.
- Зона Гаусса–Крюгера для СК-42 м обязательна, где её уже спрашивает API (`zone`).
- Длины: `EllipsoidGeodesic` + поправка по высоте (`calculatePosDistancesWhithoutHumanify`). Комментарий в lib: `Cartesian3.distance` срезает дугу — только для отладки.
- Площади: Turf в `basic-measure-calculations.lib.ts`, не сырой план на Web Mercator.
- Высоты: учитывать `systemHeight` в DEFS и `egm96-universal`, если трогаешь ортометрическую высоту. Не смешивать ellipsoidal и orthometric без спроса.

## Типы

- `CartographicLike` / `Cartesian3Like` — широта/долгота Cesium в **радианах** для cartographic, метры для cartesian. Не кормить градусы в cartesian-методы Cesium.

## Спроси до

- Новая СК (СК-63, UTM, Web Mercator как пользовательский режим).
- Смена эллипсоида Красовского / констант в DEFS.
- Подключение другой proj-библиотеки вместо `proj4`.
