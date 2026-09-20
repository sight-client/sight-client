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

- Детектор: `CheckMobileDeviceService` (`userAgent` + `maxTouchPoints`). Не плодить второй `isMobile`.
- Жесты карты — Cesium + `@znemz/cesium-navigation`. Не вешать `preventDefault` на `touchmove` документа без спроса (сломает скролл UI).
- Брейкпоинты только из `media-breakpoints-global.scss`: `tablet()` ≤767px, `mobile()` ≤520px, `tiny()` ≤320px.
- Hit-area кнопок панели: не уменьшать меньше соседних `.tool-panel-button`.
- Hover-only действия дублировать кликом/тапом.

## Спроси до

- Полноценный screen-reader-режим карты (сложный, отдельная фича).
- Смена навигационного миксина Cesium.
- Отдельное мобильное приложение / PWA.
