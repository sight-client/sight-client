---
name: sight-a11y-touch
description: Use when changing keyboard access, aria attributes, focus, tooltips, touch handlers, mobile layout, or CheckMobileDeviceService behavior in Sight.
---

# Sight — a11y и тач

## Overview

Есть поддержка тача (`CheckMobileDeviceService.isMobile`). Иконки панели часто без видимого текста — нужен доступный имя.

## Клавиатура и ARIA

- У кнопки с одной иконкой: `aria-label` (как `main-menu.html`) **или** осмысленный `matTooltip`, не пустой `matTooltip="Test"`.
- Не снимать focus outline без замены на видимый фокус.
- Плавающие окна: не ломать Tab; не захватывать фокус на canvas без Escape.
- `matTooltipShowDelay="1000"` — паттерн репо; не ставить 0 без спроса (шум на таче).
- Цвет сущностей на карте не должен быть единственным носителем смысла (есть имя в drawings-list).

## Тач / mobile

- Детектор: `CheckMobileDeviceService`. `isMobile` = UA-regex, **не** `maxTouchPoints`. Раскладка = CSS / `phoneLayout` (≤582) и `tabletLayout` (≤767), не UA.
- План `.cursor/superpowers/plans/2026-09-21-mobile-ui-chrome.md` — **executed** 2026-09-22. Не реализовывать заново; хром уже в as-is ui-theme / viewer-crs / map-tools.
- Жесты карты — Cesium + `@znemz/cesium-navigation`. Не вешать `preventDefault` на `touchmove` документа без спроса (сломает скролл UI).
- Брейкпоинты только из `media-breakpoints-global.scss`: `tablet()` ≤767px, `mobile()` ≤582px, `tiny()` ≤320px.
- Hit-area: на `tablet` ≤767 `--regular-btn-size: 44px`; шевроны tools — высота кнопки, толщина `--tool-chevron-thickness` (⅓ кнопки, на `mobile` ≤582 — ½); `margin-left`/`margin-bottom` считаются из толщины. Sidenav toggle — высота 2× кнопки, ширина `/ 2.25`.
- Hover-only действия дублировать кликом/тапом.

## Phone stack (≤582, высота + coords)

Не плодить wrapper вокруг высоты и координат. Ширина — CSS-переменные на `#sightUiContainer` / `:root`: `--phone-height-stack-width`, `--phone-coords-content-width`.

- Мерить карточку coords как `max-content` (и SVG курсора), не `scrollWidth` растянутой колонки `1fr`. На время замера снять `max-width: 100%`.
- Стек = `max(натуральная высота, coordsMin)`, **без** ratchet от текущей ширины стека. Observer только при `phoneLayout`; не писать стек, пока нет `coordsMin`.
- `--phone-coords-content-width` только растёт. Смена СК не сужает стек.
- Тело coords в DOM при свёртке (`visibility` / `inert`). Показ после `phone-stack-ready`. Шеврон coords — `:has(.camera-height-container)`: высота `@defer (on idle)`.
- Подпись высоты на телефоне **«Обзор с:»**, не десктопная «Высота наблюдения» (раздует стек).

## Спроси до

- Полноценный screen-reader-режим карты (сложный, отдельная фича).
- Смена навигационного миксина Cesium.
- Отдельное мобильное приложение / PWA.
