---
name: sight-geodesy
description: Use when converting coordinates, adding a CRS, displaying mouse position, computing geodesic length or area, or touching proj4 / Turf / SK-42 / PZ-90 in Sight.
---

# Sight — геодезия и проекции

## Overview

Cesium внутри работает в WGS-84. Пользовательские СК: `'WGS-84' | 'СК-42 м' | 'СК-42 °' | 'ПЗ-90.11'` (`crsLiterals` в `coord-systems.lib.ts`). Проверка строки — `isCRS`, не `as CRS`.

## Правила

- Любой ввод в не-WGS84 → `CoordSystems.toWGS84Cartesian` / `toWGS84Cartographic` **до** записи в Cesium entity.
- Вывод в UI → `fromWGS84Cartographic`.
- Определения SRS только в `CoordSystems.DEFS` (`Record<CRS, …>`, не `[key: string]`). Не плодить `proj4.defs` по компонентам.
- Зона Гаусса–Крюгера для СК-42 м обязательна, где её уже спрашивает API (`zone`).
- `fromWGS84Cartographic(..., zone)`: `''` и `undefined` значат автозону. Не оставлять `zone === ''` (это становилось зоной 0, `lon_0=-3`). Явное число зоны не затирать.
- Автозона СК-42 м: смотреть `longitude`/`latitude` у plain object. HUD и tools передают литерал, не `new CartographicLike()` — `instanceof` не сработает.
- Перед `proj4` — только конечные числа (`Number.isFinite`). Иначе библиотека бросает `coordinates must be finite numbers`. Невалидный ввод возвращать как исходный объект, не писать NaN в Cesium.
- Обратный ход (`toWGS84Cartographic` / импорт ODS): в тех же полях могут быть метры Гаусса–Крюгера (Y ≈ 7e6, не градусы). Зону брать из easting `floor(lon/1e6)` / `floor(x/1e6)`. Не кормить метры в longlat-автозону — будет NaN / «normalized result is not a number».
- Длины: `EllipsoidGeodesic` + поправка по высоте (`calculatePosDistancesWithoutHumanify`). Комментарий в lib: `Cartesian3.distance` срезает дугу — только для отладки.
- Площади: Turf в `basic-measure-calculations.lib.ts`, не сырой план на Web Mercator.
- Высоты: учитывать `systemHeight` в DEFS и `egm96-universal`, если трогаешь ортометрическую высоту. Не смешивать ellipsoidal и orthometric без спроса.

## Типы

- `CartographicLike` / `Cartesian3Like` — широта/долгота Cesium в **радианах** для cartographic, метры для cartesian. Не кормить градусы в cartesian-методы Cesium.

## Спроси до

- Новая СК (СК-63, UTM, Web Mercator как пользовательский режим).
- Смена эллипсоида Красовского / констант в DEFS.
- Подключение другой proj-библиотеки вместо `proj4`.
