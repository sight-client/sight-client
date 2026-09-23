---
status: implemented
created: 2026-09-21
parent: 2026-09-17-sight-ui-theme-design.md
also-touches:
  - 2026-09-17-sight-viewer-crs-design.md
  - 2026-09-17-sight-map-tools-design.md
---

# Sight — mobile UI chrome (implemented)

> **Parent:** [ui-theme as-is](./2026-09-17-sight-ui-theme-design.md). As-is уже содержат этот хром: ui-theme (хром, device), viewer-crs (fullscreen, mixin, курсор), map-tools (кнопка в CameraViewTools, окна). План [2026-09-21-mobile-ui-chrome](../plans/2026-09-21-mobile-ui-chrome.md) **executed** 2026-09-22 — не гонять заново. **Скилы:** `.cursor/skills/sight-a11y-touch/SKILL.md`, `.cursor/skills/sight-angular-ui/SKILL.md`, `.cursor/skills/sight-map-tools/SKILL.md`.

**Цель:** на узком экране тем же набором виджетов пользоваться пальцем: крупнее hit-area, без наложений, без второго UI.

**Non-goals:** PWA, отдельный mobile shell, нижний док, MatDialog/bottom sheet вместо floating windows, смена UX групп `tools-panel`, i18n, отдельная альбомная сетка, `visualViewport` API.

## Breakpoints and hit-area

Существующие миксины: `tablet` ≤767px, `mobile` ≤460px, `laptop` ≤1080px.

| Ярус    | Ширина    | Кнопка                                  |
| ------- | --------- | --------------------------------------- |
| Desktop | >767px    | `--regular-btn-size: 32px` (как сейчас) |
| Compact | 583–767px | **44px**                                |
| Phone   | ≤460px    | **44px**                                |

Шевроны групп tools: высота как `.tool-panel-button`, толщина `--tool-chevron-thickness` (⅓ кнопки; на телефоне ≤582 — ½). Отступы `margin-left` / `margin-bottom` выводятся из толщины (ось и overlap как при ⅓). Toggle sidenav: высота 2× кнопки, ширина кнопки / 2.25 на `tablet`.

Отступы от края: плюс `env(safe-area-inset-*)`. Для iOS в `viewport` — `viewport-fit=cover`. Альбом = тот же хром, теснее; второй сетки нет.

## Two detectors, one service

Не плодить второй сервис. В `CheckMobileDeviceService`:

1. **Раскладка** — только CSS (миксины / `matchMedia` тех же порогов). Sidenav overlay — `tabletLayout` ≤767. Столбик высоты, центр `tools-panel`, свёртка coords, старт окон во вкладки — `phoneLayout` ≤582, не UA.
2. **Виртуальный курсор** — существующий UA-regex телефона/планшета **без** `maxTouchPoints` / `ontouchstart`. Включает: красный `+` в центре холста (это курсор, не «тач»), координаты и постановка точек рисования из центра, mixin навигации выкл.

Ноутбук с тачскрином в широком окне: мышь, mixin, без крестика. Узкое окно на ПК: телефонный хром по CSS, курсор мыши если UA не телефон.

Чекбокс и поле «координаты под курсором» **не менять**: «курсор» на телефоне — центр холста.

## Compact 583–767

Плотный laptop: координаты слева снизу развёрнуты (без шеврона свёртки); высота сверху у меню; `tools-panel` как сейчас в laptop (`left: 194px`). Sidenav `mode=over`, старт закрыт (`tabletLayout` ≤767). На всей этой ширине закрытую панель открывает свайп одним пальцем слева направо от левого края (полоска 24px + `safe-area-inset-left`; порог 48px, движение сильнее по горизонтали). Шеврон и шапка поверх полоски. Не `touchmove` на `document`. Столбик высоты+coords и свёртка coords — нет.

## Phone ≤582

Те же компоненты, другие `top`/`left`/`right`/`width`. Без общего wrapper вокруг высоты и координат.

- **Меню:** `position: absolute`, отступ в **px** (~15px + safe-area). При ресайзе не едет к центру.
- **Высота и coords:** два хоста. Столбик по центру: `left: 50%; transform: translateX(-50%)`. Сверху `camera-height-tool`. На телефоне подпись **«Обзор с:»** (иначе — «Высота наблюдения»); шрифт и ширина инпута как на десктопе. Одна ширина `--phone-height-stack-width` на панель высоты, шеврон coords и контейнер coords (`max` из max-content высоты и содержимого раскрытых координат). При загрузке панель высоты уже в этой ширине: карточка шир/долг в DOM (в т.ч. без живых координат, строками-пробами WGS-84), стек не публикуется из одной короткой подписи.
- **Coords по умолчанию свёрнут целиком** (широта, долгота, чекбокс, select СК не видны). Видна только полоска-шеврон: высота `--tool-chevron-thickness` (на телефоне ½ кнопки), та же SVG `M15.41 16.58L10.83 12…`. Тело coords остаётся в DOM (скрыто), чтобы сразу знать ширину: шеврон и панель высоты уже в ширине раскрытого стека, без скачка при клике. На телефоне шеврон виден только когда в дереве есть `.camera-height-container` (`:has`, CSS): высота грузится `@defer (on idle)`, иначе шеврон «висит» без панели. Шеврон **приклеен** к низу панели высоты: overlap как у tools, сверху квадратные углы и `border-top` (`--theme-border-color`), снизу скругление 6px (свободный край, рост вниз). Разворачиваемый контент — после отступа `btn/9`. SVG `opacity: 0.8`, как у шевронов tools. Свёрнут — стрелка вниз, раскрыт — вверх.
- Раскрытие только по клику/тапу **на шеврон**. Клик по карте или вне панели не закрывает. Рост вниз; `mat-select` СК открывается вниз. Раскрытый блок шир/долг+чекбокс — **две колонки**: слева широта и долгота в две строки (`max-content`, масштаб как на десктопе), справа чекбокс по ширине контента (`auto`). Ширина стека = `max` из **внутренней** ширины панели высоты и карточки шир/долг (не min-width селекта СК и не растянутая колонка). При смене СК (в т.ч. на «СК-42 м») стек не сужается. Select СК на всю ширину под ними. Desktop/tablet — колонки не применяются.
- **`tools-panel`:** по центру снизу. `column-reverse`, шеврон **между** hidden и default. `renderToolsGroupTemplates` / `moveToolToDefault` не переписывать.
- **Sidenav:** `mode=over`, старт закрыт, backdrop. Тот же `drawings-list`. Toggle высота 2× `--regular-btn-size`, ширина `/ 2.25` на tablet. Свайп от левого края — тот же, что на всей ширине ≤767.

## Floating windows

Виджеты те же. Не MatDialog.

- Пока вкладки **сверху-справа** (уже с max-width 1660px / laptop): раскрытое окно у **левого** края. Не наезжать на меню, столбик, tools, вкладки.
- Верх первой табы и верх первого раскрытого окна — одна линия, чуть ниже шапки (на ≤582 — ниже высоты+шеврона).
- **≤582:** при создании окно сразу `collapsed` во вкладки. Слева — только после разворота вкладки.
- Compact и прочий ≤1660: окно слева при раскрытии; при создании не сворачивать.

## Fullscreen tool (все ширины)

Штатный Cesium `fullscreenButton: false`. Угол `.cesium-viewer-fullscreenContainer` убрать.

Новый инструмент группы `CameraViewTools` по образцу `take-screenshot.ts`:

- один `*.ts` + `*.spec.ts`, инлайн-шаблон;
- `tool-panel-button`, `setStartBtnVisibility` / `MutationObserver`, `mousedown` без `stopPropagation`;
- `ng-template` в `#hiddenNGCForCameraViewTools`, `position="3"`;
- нет service, стора сущностей, floating window;
- `toolName` вроде `toggleFullscreen`, русская подпись «На весь экран» / «Выйти из полноэкранного режима» и иконка enter/exit по текущему режиму;
- логика — вход/выход из fullscreen **всего Sight** (`document.body`, как штатная кнопка Cesium). Не `viewer.container`: иначе скрывается `#sightUiContainer`.

UX раскрытия группы камеры не менять.

## Navigation mixin

На UA телефона/планшета миксин монтируется. Тач переводится в mouse-события пакета в `ZnemzNavigationMixin` (`attachNavigationTouchBridge`); файлы `@znemz/cesium-navigation` не менять. Подписи кольца, гироскопа и кнопок — `MatTooltip` (1000 мс, слева), не `title`.

Блок компас+гироскоп и `+/⌂/−` стоит в углу, где был Cesium-fullscreen. Взаимные `right` и зазор компас↔зум не менять. На ширине `tablet` позиция задана в `znemz-navigation-mixin.scss`.

## Testing

`provideZonelessChangeDetection()`. Колоцированные spec:

- `CheckMobileDeviceService`: UA включает виртуальный курсор; `maxTouchPoints` без UA — нет.
- Раскладка не зависит от UA в тестах хрома (классы/стили от ширины — по возможности).
- Шеврон coords: не закрывается снаружи; по умолчанию свёрнут.
- Новый fullscreen-инструмент: видимость кнопки как у screenshot; клик не ломает `moveToolToDefault`.

Playwright не подключать.

## Out of scope (явно)

Нижний док; вкладки групп tools; общий `div` высоты+coords; свёртка coords с видимым select; автозакрытие coords; перепись шеврона CameraViewTools; PWA; отдельный landscape layout.

## Planning

План [2026-09-21-mobile-ui-chrome](../plans/2026-09-21-mobile-ui-chrome.md) **executed** 2026-09-22 (Tasks 1–8 и визуальные правки 21–22 сентября). History only — не гонять заново. As-is ui-theme / viewer-crs / map-tools уже содержат этот хром.
