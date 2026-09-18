Сохрани **текущий** чат по прямому запросу `/save-chat-text`. Не предлагай сохранение сам. Не клади файл в git.

## Аргумент — имя чата

Текст **после** команды — имя чата (пример: `/save-chat-text Superpowers обвязка`).

Если имени нет — **спроси** и остановись. Не подставляй заголовок вкладки Cursor (его обычно нет в контексте).

## Что писать в файл

Только диалог этого чата:

- реплики пользователя;
- реплики ассистента.

Не включать: сырые tool call / JSON инструментов, содержимое `.chats/`, секреты (заменить на `[redacted]`).

Если чат не помещается в контекст — сохрани доступное и в шапке файла напиши, что архив неполный.

Формат `.md`:

```markdown
# <имя чата>
saved: YYYY-MM-DD

## User
…

## Assistant
…
```

## Имя файла и путь

Каталог (создать, если нет): `.chats/` в корне репозитория.

Дата сохранения — сегодня, `YYYY-MM-DD` (локальная).

Имя чата для файла: trim; пробелы → `-`; убрать символы Windows `<>:"/\|?*` и управляющие.

Шаблон: `<дата>-<имя>.md`

Если такой файл уже есть: `<дата>-<имя>(N).md`, где N = 1, 2, 3… (первый повтор — `(1)`).

Проверка и запись **только через shell** (папка в `.cursorignore`, Write/Read агента туда не ходи).

Пример PowerShell из корня репо:

```powershell
New-Item -ItemType Directory -Force -Path .chats | Out-Null
$date = Get-Date -Format 'yyyy-MM-dd'
$slug = '<SANITIZED_NAME>'
$destDir = Join-Path (Get-Location) '.chats'
$path = Join-Path $destDir "$date-$slug.md"
$n = 1
while (Test-Path -LiteralPath $path) {
  $path = Join-Path $destDir "$date-$slug($n).md"
  $n++
}
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $markdown, $utf8)
Write-Output $path
```

`$markdown` — полный текст архива. Не коммить `.chats/`.

В ответ пользователю: полный путь к файлу и пометка, если архив обрезан.
