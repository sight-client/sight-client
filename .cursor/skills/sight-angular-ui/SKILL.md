---
name: sight-angular-ui
description: Use when editing Angular components, templates, SCSS, Material, themes, signals, or zoneless change detection in Sight. Not for Cesium primitives or coordinate math.
---

# Sight — Angular UI

## Overview

Angular 22, **zoneless**, standalone-компоненты, сигналы. Не подключать Zone.js и NgModules.

## Паттерны репо

- `ChangeDetectionStrategy.OnPush` у компонентов, как у соседей.
- Имена файлов без `.component`: `ui-theme.ts`.
- Селекторы без `app-`, кроме `app-root`.
- Инжекты: `$setUserThemeService`, не переименовывать в файле, который правишь.
- Алиасы: `@/*`, `@global/*`, `@landing/*`.
- Темы: `SetUserThemeService` / `SetLightDarkModeService`, CSS-переменные в `src/app/global/configs/angular-material.config.scss`, ключи `themePalettes` / схема в `localStorage`. `colorScheme` — только `'light' | 'dark'`, проверка `isColorScheme`.
- Миксины: `src/app/global/styles`, `src/app/planet/common/styles`. Не дублировать `$breakpoints`.

## Сигналы

- Новое UI-состояние — `signal` / `computed` / `linkedSignal`.
- В `effect` побочные эффекты оборачивать в `untracked()`, как в `run-viewer.directive.ts`.
- Не класть огромные объекты (Viewer) в `WritableSignal` целиком.
- `ElementRef` / `TemplateRef` без дженерика — это `any`. Писать `ElementRef<HTMLElement>` и `TemplateRef<unknown>`.

Планы `.cursor/superpowers/plans/2026-09-23-error-reporting.md` и `2026-09-23-user-data-auth-flow.md` — **executed** 2026-09-25. Не возвращать `chalk` и `userNameGlobal`.

## SCSS / темы

- Не хардкодить светлую/тёмную палитру в компоненте, если уже есть theme service.
- Новая палитра: спросить человека, затем CSS-переменная + пункт в `--theme-palettes-list`.
- Не подключать Tailwind / CSS-in-JS.

## Спроси до

- `provideExperimentalZonelessChangeDetection` vs текущий zoneless API.
- Общий UI-kit, CDK overlay вместо существующих floating windows.
- i18n-пайпы / ngx-translate (UI сейчас на русском в шаблонах).
