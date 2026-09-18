---
name: sight-testing
description: Use when writing or changing unit tests, TestBed, spec files, Vitest config, or proposing Playwright / Cypress in Sight.
---

# Sight — тесты

## Overview

Раннер: **Vitest 4.1** через `@angular/build:unit-test` (jsdom), команда `npm test` / `ng test`. `provideZonelessChangeDetection()` в каждом `TestBed`. Globals Vitest (`describe` / `it` / `expect`) — через `"types": ["vitest/globals"]` в `tsconfig.spec.json`. Сборка тестов: `buildTarget` `sight-client:build:testing` → `environment.test.ts`. Не возвращаться на Karma/Jasmine без спроса.

Контракт сюиты: `.cursor/superpowers/specs/2026-09-18-sight-unit-test-suite-design.md`. Планы покрытия — `.cursor/superpowers/plans/2026-09-18-unit-test-*.md`.

## Шаблон (как `add-mark.spec.ts`)

```typescript
await TestBed.configureTestingModule({
  imports: [AddMark],
  providers: [provideZonelessChangeDetection()],
}).compileComponents();
```

- Файл рядом с исходником: `foo.spec.ts`.
- Standalone: `imports: [ComponentUnderTest]`, не `declarations`.
- Сервисы с Cesium: мок `ViewerService` (канон в спеке unit-test suite). Не создавать реальный `Cesium.Viewer` в unit-тесте.
- `environment.test.ts` подключается через конфигурацию `testing` у `build` в `angular.json` (`fileReplacements`). Не собирать его как Vitest-файл: `angular.json` `test.exclude` включает `src/environments/**`.
- `tsconfig.spec.json` / `angular.json` `test.exclude`: `drawing-tool-blank/**`, `use-api-serv-proxy/**`, плюс env. `AutofocusDirective` в сюите. Не возвращать proxy/blank, пока их не вернут в продукт.

## Что тестировать

- Поведение, не `%` coverage и не «spec на каждый конфиг».
- Новая логика (сервис, lib, CRS) — failing spec сначала (Superpowers TDD), затем код.
- Существующий код в планах покрытия — характеристика as-is: тест должен пройти; production не ломать ради красного. Баг — парковать, чинить отдельным TDD.
- UI-компонент — минимум `should create`; плюс клик/сигнал/`localStorage`, если это есть в классе или шаблоне. Не раздувать шаблонные spec без поведения.
- Геодезия: числа с разумным `toBeCloseTo`, не сравнивать float через `===`.
- Vitest: `toBe(true)` / `toBe(false)`, не Jasmine `toBeTrue()` / `toBeFalse()`.
- Чистые lib — без TestBed.

## Спроси до

- Playwright / Cypress / component harness как обязательный CI.
- Возврат на Karma/Jasmine или смена major Vitest (5+).
- Снапшоты шаблонов.
- Тесты, которым нужен WebGL/Cesium Viewer (хрупко в jsdom, без спроса не заводить).
- Отдельный `vitest.config.ts` / `runnerConfig` (CLI собирает конфиг сам).
- Порог coverage; общий `src/testing/`; снятие exclude с `drawing-tool-blank` / `use-api-serv-proxy`.
