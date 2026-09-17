---
name: sight-testing
description: Use when writing or changing unit tests, TestBed, spec files, Karma config, or proposing Playwright / Vitest / Cypress in Sight.
---

# Sight — тесты

## Overview

Раннер: **Jasmine + Karma**, команда `npm test`. `provideZonelessChangeDetection()` в каждом `TestBed`. Vitest в `package.json` **не** использовать как раннер без спроса.

## Шаблон (как `add-mark.spec.ts`)

```typescript
await TestBed.configureTestingModule({
  imports: [AddMark],
  providers: [provideZonelessChangeDetection()],
}).compileComponents();
```

- Файл рядом с исходником: `foo.spec.ts`.
- Standalone: `imports: [ComponentUnderTest]`, не `declarations`.
- Сервисы с Cesium: мок `ViewerService` / не создавать реальный `Cesium.Viewer` в unit-тесте, если соседние spec этого не делают.
- `environment.test.ts` подключается через `fileReplacements` в `angular.json` → `test`.

## Что тестировать

- Новая логика (сервис, lib, CRS) — failing spec сначала (Superpowers TDD), затем код.
- Новый UI-компонент — минимум `should create`, как в репо; не раздувать шаблонные spec без поведения.
- Геодезия: числа с разумным `toBeCloseTo`, не сравнивать float через `===`.

## Спроси до

- Playwright / Cypress / component harness как обязательный CI.
- Перенос на Vitest.
- Снапшоты шаблонов.
- Тесты, которым нужен WebGL/Cesium Viewer в Karma (хрупко, без спроса не заводить).
