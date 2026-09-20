---
name: sight-client-security
description: Use when handling user files (KML, KMZ, ODS), HTML strings, HTTP bodies, localStorage, sanitization, XSS, or any secret / API key in this frontend-only Sight app.
---

# Sight — клиентская безопасность

## Overview

Приложение публичное на GitHub Pages. Всё, что попадает в бандл, видит пользователь. XSS с карты/импорта — основной риск.

## Обязательно

- HTML и пользовательские строки: `DOMPurify.sanitize`, как `bad-html.interceptor.ts` и `user-data.service.ts`. Не `innerHTML` сырого KML/описания.
- Импорт KML/KMZ (`drawings-list-kml.service.ts`): не выполнять скрипты из файла, не подставлять произвольный URL в `billboard.image` без проверки (data:/https, не `javascript:`).
- `HttpInterceptorFn` уже ловит «грязное» string-body. Не обходить интерцепторы ради «просто отправить».
- Нет секретов в `environment*.ts`, репо, query string. `apiUrl` закомментирован — не раскомментировать с реальными ключами.
- Не добавлять Cesium Ion default token в исходники.

## Фронт на GH Pages

- Любая «авторизация» в UI (`user-account-features`) не даёт серверной защиты. Не обещать безопасное хранение паролей.
- `localStorage` — не для токенов третьих сторон. Тема/sceneMode — ок.

## Спроси до

- Реальный backend, OAuth, Firebase, ключ карт (кроме публичного OSM).
- Отключение DOMPurify «для отладки» в production-конфиге.
- `bypassSecurityTrust*` в шаблонах.
