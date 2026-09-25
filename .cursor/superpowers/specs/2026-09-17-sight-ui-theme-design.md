---
status: approved-as-is
created: 2026-09-17
parent: 2026-09-17-sight-product-design.md
---

# Sight — UI, theme, device (as-is)

> **Parent:** [product](./2026-09-17-sight-product-design.md). **Скилы для SDD brief:** `.cursor/skills/sight-angular-ui/SKILL.md`, `.cursor/skills/sight-a11y-touch/SKILL.md`.

**Цель:** zoneless Angular UI вокруг глобуса: Material, четыре палитры, светлая/тёмная, тач, русский хром. Настоящих аккаунтов нет.

## Angular conventions (норматив)

- Standalone-компоненты, `ChangeDetectionStrategy.OnPush`.
- Имена файлов без `.component` (`main-menu.ts`). У селекторов **нет** префикса `app-`, кроме `app-root` (`prefix` в `angular.json` — `""`).
- Инжекты в существующих файлах с префиксом `$` — в правимом файле сохранять.
- Колокация `*.ts` / `*.html` / `*.scss` / `*.spec.ts`. Сервисы фичи: `services/<name>/<name>.service.ts`.
- Тесты: `TestBed` + `provideZonelessChangeDetection()`. Раннер: `ng test` (Vitest 4.1).

Конструктор `App` вызывает `SetLightDarkModeService.getStartColorScheme()` и `SetUserThemeService.setUserTheme()`.

## Theme

Палитры в `src/app/global/configs/angular-material.config.scss` (`$theme-palettes-list`):

- `azure-blue` (по умолчанию)
- `rose-red`
- `magenta-violet`
- `cyan-orange`

В CSS: `--theme-palettes-default` и `--theme-palettes-list`. `SetUserThemeService` читает их и пишет `localStorage.themePalettes`. UI: `UiTheme` / `ThemeColorPalette`.

Светлая/тёмная: `SetLightDarkModeService`, ключ `localStorage.colorScheme`. Первый визит — `prefers-color-scheme`, дальше storage. В коде есть пометки, что часть смены схемы требует **перезагрузки** — не считать, что все токены переключаются на лету.

Не подключать Tailwind / CSS-in-JS. Миксины: `src/app/global/styles/media-breakpoints-global.scss` — `desktop-large` 2560+, `desktop-small` ≤1200, `laptop` ≤1080, `tablet` ≤767, `mobile` ≤460, `tiny` ≤320.

## Device and a11y

`CheckMobileDeviceService` (`providedIn: 'root'`): `isMobile` / `checkMobile()` — UA-regex телефона/планшета **без** `maxTouchPoints` / `ontouchstart` (виртуальный курсор и постановка точек из центра холста). Раскладка — CSS mixins + сигналы `phoneLayout` (≤460), `tabletLayout` (≤767), `laptopLayout` (≤1080), `narrowChromeLayout` (≤1660). `wideMobile` — UA mobile и `innerWidth` >767 (`resize` только при `isMobile`). Не плодить второй сервис. `DeviceService` не использовать для нового хрома. Миксин компаса на UA mobile остаётся.

С `laptop` ≤1080 `--regular-btn-size: 44px` и `--tool-chevron-thickness` ½ кнопки; выше 1080 кнопка 32px, толщина шеврона ⅓. Отступы `margin-left` / `margin-bottom` из толщины. Sidenav toggle: высота 6× кнопки (на `tablet` ≤767 — 4×), ширина ½ кнопки. `viewport-fit=cover` + `env(safe-area-inset-*)`. Альбом = тот же хром, второй сетки нет.

Sidenav `mode=over`, backdrop, старт закрыт, без `disableClose` — при `tabletLayout` ≤767, в том числе на десктопном UA. Шире 767 — `side`, старт открыт, `disableClose` (включая UA mobile с `wideMobile`). Полоска `.sight-main-sidenav-edge-swipe` (24px + `safe-area-inset-left`) есть при UA mobile или `tabletLayout` и содержит кнопку-шеврон; свайп вправо открывает, влево закрывает (порог 48px, сильнее по горизонтали). На десктопном UA шире 767 кнопка вне полоски. Слушатель не на `document`.

**>1080:** coords слева снизу (`--coords-panel-left` / `--coords-panel-width` в `common-core`); `tools-panel` `--tools-panel-left` 510px; панель высоты по центру зазора между ними (`translateX(-50%)`). Не хардкодить `left: 200px` / `460px`.

**768–1080:** coords слева снизу развёрнуты; высота сверху у меню (`left: 86px`, `transform: none`); `tools-panel` `left: 194px`. Компас znemz `scale(1.1)` вместе с кнопками 44px.

**461–767:** те же coords без шеврона свёртки, высота как на laptop, столбика высоты+coords нет. `tools-panel` по центру снизу. Sidenav `over`, старт закрыт.

**Phone ≤460:** те же виджеты, без общего wrapper. Меню `position: absolute`, ~15px + safe-area. Высота и coords — два хоста, столбик по центру (`left: 50%; transform: translateX(-50%)`). Подпись высоты **«Обзор с:»** (десктоп — «Высота наблюдения»). Одна ширина `--phone-height-stack-width` на высоту, шеврон и coords = `max` из натуральной высоты и карточки шир/долг (не min-width селекта, не растянутая `1fr`). `--phone-coords-content-width` только растёт (смена СК, в т.ч. «СК-42 м», стек не сужает). Карточка coords в DOM и свёрнутой (пробы WGS-84 до живых координат); показ после `phone-stack-ready`; шеврон coords только при `:has(.camera-height-container)` (высота `@defer (on idle)`). Шеврон приклеен к низу высоты (квадратный верх + `border-top`, низ 6px). Раскрытие только по шеврону; клик по карте не закрывает. Раскрытый шир/долг+чекбокс — две колонки (`max-content` / `auto`); select СК на всю ширину. `tools-panel` по центру снизу (уже с ≤767).

Полы окна: `body` `min-width: var(--right-part-min-width)` (350px) и `min-height: var(--min-height-global)` (440px). После телефонного хрома **не сужать** без спроса — mobile ещё может потребовать ширину.

У кнопок-иконок нужны `aria-label` и/или `matTooltip` (задержка 1000 ms — паттерн репо). Пустой `matTooltip="Test"` не оставлять. `preventDefault` на document `touchmove` без одобрения нельзя (ломает скролл UI; жесты глобуса — Cesium + znemz mixin).

Hit-area: не уменьшать `.tool-panel-button`.

## Shell chrome

- `MainMenu` — tooltip имя или «Не авторизован»; подменю темы.
- `UserAccountFeatures` / `auth-module` — **заглушка UI**. Не граница безопасности. Токены третьих сторон в `localStorage` не класть.
- `ProgressSpinner` + `SetProgressSpinnerService` для долгих файлов/карты.
- `RoutingSpinnerListener` / `RoutingErrorsListener` на `App`.

`UserDataService` гоняет строки через `DOMPurify.sanitize` — так же для любого пользовательского текста.

## Landing (не активен)

`src/app/landing-page/` есть (`LandingPage` + `UiTheme`), но роут в `app.routes.ts` закомментирован. Не вызывать `loadComponent` без одобрения. Wildcard должен по-прежнему вести на карту.

## HTTP UI

`DownloadProgressInterceptor` (класс, DI). Функциональные: `badHtmlInterceptor` (string-тело POST/PUT должно совпасть с `DOMPurify.sanitize`, иначе throw), `doubleReqPreventionInterceptor`, `getReqCachingInterceptor`. `apiUrlChunkProxyInterceptor` выключен, пока нет спеки бэкенда.

## Спроси до

ngx-translate / i18n; включение landing; настоящий OAuth; палитра не из `$theme-palettes-list`; Zone.js; префикс селекторов `app-` / массовый ренейм в `*.component.ts`.
