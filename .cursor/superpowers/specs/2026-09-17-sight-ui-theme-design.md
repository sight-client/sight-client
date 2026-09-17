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
- Имена файлов без `.component` (`user-menu.ts`). У селекторов **нет** префикса `app-`, кроме `app-root` (`prefix` в `angular.json` — `""`).
- Инжекты в существующих файлах с префиксом `$` — в правимом файле сохранять.
- Колокация `*.ts` / `*.html` / `*.scss` / `*.spec.ts`. Сервисы фичи: `services/<name>/<name>.service.ts`.
- Тесты: `TestBed` + `provideZonelessChangeDetection()`. Раннер: `ng test` (Jasmine/Karma).

Конструктор `App` вызывает `SetLightDarkModeService.getStartColorScheme()` и `SetUserThemeService.setUserTheme()`.

## Theme

Палитры в `src/app/global/configs/angular-material.config.scss` (`$theme-poletts-list` — имя как в репо):

- `azure-blue` (по умолчанию)
- `rose-red`
- `magenta-violet`
- `cyan-orange`

В CSS: `--theme-palettes-default` и `--theme-palettes-list`. `SetUserThemeService` читает их и пишет `localStorage.themePalettes`. UI: `ThemeChanger` / `ThemeColorChanger`.

Светлая/тёмная: `SetLightDarkModeService`, ключ `localStorage.colorScheme`. Первый визит — `prefers-color-scheme`, дальше storage. В коде есть пометки, что часть смены схемы требует **перезагрузки** — не считать, что все токены переключаются на лету.

Не подключать Tailwind / CSS-in-JS. Миксины: `src/app/global/styles/media-breakpoints-global.scss` — `desktop-large` 2560+, `desktop-small` ≤1200, `laptop` ≤1080, `tablet` ≤767, `mobile` ≤520, `tiny` ≤320.

## Device and a11y

`DeviceService` (`providedIn: 'root'`): `isMobile` по UA-regex **или** `maxTouchPoints` / `ontouchstart`. Один детектор — не плодить второй.

У кнопок-иконок нужны `aria-label` и/или `matTooltip` (задержка 1000 ms — паттерн репо). Пустой `matTooltip="Test"` не оставлять. `preventDefault` на document `touchmove` без одобрения нельзя (ломает скролл UI; жесты глобуса — Cesium + znemz mixin).

Hit-area: не уменьшать `.tool-panel-button`.

## Shell chrome

- `UserMenu` — tooltip имя или «Не авторизован»; подменю темы.
- `AccountFeatures` / `auth-module` — **заглушка UI**. Не граница безопасности. Токены третьих сторон в `localStorage` не класть.
- `CursorProgressSpinner` + `SetCursorProgressSpinnerService` для долгих файлов/карты.
- `RoutingSpinnerListener` / `RoutingErrorsListener` на `App`.

`UserDataService` гоняет строки через `DOMPurify.sanitize` — так же для любого пользовательского текста.

## Landing (не активен)

`src/app/landing-page/` есть (`LandingPage` + `ThemeChanger`), но роут в `app.routes.ts` закомментирован. Не вызывать `loadComponent` без одобрения. Wildcard должен по-прежнему вести на карту.

## HTTP UI

`ShowProgressInterceptor` (класс, DI). Функциональные: `badHtmlInterceptor` (string-тело POST/PUT должно совпасть с `DOMPurify.sanitize`, иначе throw), `stopDoubleRequestInterceptor`, `cachingGetReqInterceptor`. `useApiServProxyInterceptor` выключен, пока нет спеки бэкенда.

## Спроси до

ngx-translate / i18n; включение landing; настоящий OAuth; палитра не из `$theme-poletts-list`; Zone.js; префикс селекторов `app-` / массовый ренейм в `*.component.ts`.
