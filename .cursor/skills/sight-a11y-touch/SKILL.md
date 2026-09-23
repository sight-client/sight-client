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

- Детектор: `CheckMobileDeviceService`. `isMobile` = UA-regex, **не** `maxTouchPoints`. Раскладка = CSS / `phoneLayout` (≤460) и `tabletLayout` (≤767), не UA. Overlay sidenav — `tabletLayout` ≤767, в том числе десктопный UA: `over`, backdrop, старт закрыт. Шире 767 — `side`, старт открыт, `disableClose`, включая `wideMobile` (UA mobile и `innerWidth` >767).
- План `.cursor/superpowers/plans/2026-09-21-mobile-ui-chrome.md` — **executed** 2026-09-22. Не реализовывать заново; хром уже в as-is ui-theme / viewer-crs / map-tools.
- Жесты карты — Cesium. Компас и кнопки зума `@znemz/cesium-navigation` монтируются и на UA mobile: `attachNavigationTouchBridge` в `znemz-navigation-mixin.ts` переводит touch в mouse/click миксина. Подписи этих элементов — `MatTooltip` (задержка 1000, слева), не атрибут `title`. Файлы пакета не менять и не снимать виджет с мобильного UA. `preventDefault` у этого моста только на жесте, который начался на `.compass` или `.navigation-controls`. Не вешать `preventDefault` на `touchmove` всего `document` без спроса (сломает скролл UI).
- Свайп sidenav: полоска `.sight-main-sidenav-edge-swipe` в `planet` при `isMobile` или `tabletLayout` (кнопка-шеврон внутри неё). Вправо открывает, влево закрывает (порог 48px, сильнее по горизонтали). Не слушатель на `document`. На десктопном UA шире 767 полоски нет, кнопка отдельно.
- Брейкпоинты только из `media-breakpoints-global.scss`: `tablet()` ≤767px, `mobile()` ≤460px, `tiny()` ≤320px.
- Hit-area: с `laptop` ≤1080 `--regular-btn-size: 44px` и `--tool-chevron-thickness` ½ кнопки (выше 1080 — 32px и ⅓). `margin-left`/`margin-bottom` из толщины. Sidenav toggle — высота 6× кнопки (на `tablet` ≤767 — 4×), ширина ½ кнопки.
- Hover-only действия дублировать кликом/тапом.

## Phone stack (≤460, высота + coords)

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
