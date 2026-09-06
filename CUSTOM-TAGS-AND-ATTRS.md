# Songlist — кастомные теги и атрибуты (документация)

Коротко: **как хранятся данные в songs/*.html и когда именно они обрабатываются браузером** (при загрузке vs лениво — при клике на аккордеон).

---

## 1. Общий пайплайн обработки страницы

| Фаза | Когда | Что происходит | Где в коде |
|---|---|---|---|
| **0. Bootstrap** | Сразу после `DOMContentLoaded` | Загрузка всех `songs/*.html` по списку из `songs/manifest.json` и вставка HTML в `<div id="songlists">`. Все `<song>`, `<verse>`, `<img data-src>` пока сырые. | [bootstrap.js](file:///d:/source/songlist/bootstrap.js) |
| **1. Фаза «shell»** | Сразу после bootstrap | Построение `<select class="band-select">`, панели поиска артистов, шапки песен, нумерация блоков setlist, копирование hash-ссылок между `.accordion`. | [setActiveSongList()](file:///d:/source/songlist/music.js#L599-L747), [copyAccordionContentByHash()](file:///d:/source/songlist/music.js#L892-L928), [addEmptySetlistAttribute()](file:///d:/source/songlist/music.js#L1604-L1609) |
| **2. Ленивая фаза** | **ТОЛЬКО после клика пользователя по `.toggle-button` аккордеона** | Распаковка `<song>` в таблицу, подсветка аккордов, подмена тегов `<yt>/<chord>`, отправка MIDI, **ленивая подгрузка `<img data-src>`**, автотранспонирование, **создание кнопок tool-buttons (⛭ ♫ ► ☰ 🔍 − + Playback) с проверкой существования mp3/playback-файлов**. | [bindAccordionClickEvent()](file:///d:/source/songlist/music.js#L931-L968) → [convertSongToTable()](file:///d:/source/songlist/music.js#L486-L548) → [addButtons()](file:///d:/source/songlist/music.js#L789-L890) |

Важно: до раскрытия конкретной песни её **внутренности не обработаны** — в DOM висят «сырые» `<verse>/<chorus>/...` невидимые браузеру как структурные единицы.

---

## 2. Кастомные HTML-элементы (теги) внутри `<song>...</song>`

Все эти теги **не являются стандартными** — браузер их не понимает как семантику, просто отображает содержимое как inline. Обрабатываются **в ленивой фазе** (после клика на аккордеон).

| Тэг | Где встречается | Как обрабатывается (и когда) | sectionMap-лейбл |
|---|---|---|---|
| `<song>` | Обёртка всего текста одной песни в `.accordion > .content` | В [convertSongToTable](file:///d:/source/songlist/music.js#L486-L548) его **содержимое полностью разбирается и заменяется** на `<table class="structure">`, после чего сам `<song>` удаляется из DOM (`.replaceWith(table)`) | — |
| `<intro>` | Внутри `<song>` | Каждый такой тег становится `<tr class="songpart intro">`. В первой ячейке лейбл из `sectionMap` | **Int** |
| `<verse>` | — | `<tr class="songpart verse">` | **Vrs** |
| `<chorus>` | — | `<tr class="songpart chorus">` | **Cho** |
| `<prechorus>` / `<pre-chorus>` | — | `<tr class="songpart prechorus">` | **Pre** |
| `<bridge>` | — | `<tr class="songpart bridge">` | **Brd** |
| `<interlude>` | — | `<tr class="songpart interlude">` | **Inr** |
| `<instr>` | Инструментальная секция | `<tr class="songpart instr">` | **Ins** |
| `<coda>` | Outro/кода | `<tr class="songpart coda">` | **Cod** |
| `<bblue>` | Любое место внутри секций | Никак **не** преобразуется JS. Только стилизация через CSS (обычно — синий цвет текста для пометок). | — |
| `<chord>` | В `.toggle-button` рядом с инструментом | Лениво: в [replaceCustomTags](file:///d:/source/songlist/music.js#L566-L597) тегу ставится `display:none`, а потом рядом создаётся `☰`-символ через конфиг кнопок. | — |
| `<yt>` | В `.toggle-button`. Содержимое — URL YouTube | В [replaceCustomTags](file:///d:/source/songlist/music.js#L809) прячется (`display:none`), создаётся кнопка `►`, открывающая `youtubePanel`. URL берётся из `textContent` оригинального `<yt>`. | — |
| `<mp3>` | Редко в `.toggle-button`. Содержимое — имя файла (или `<name>.mp3`) в папке `mp3/` | В [addButtons](file:///d:/source/songlist/music.js#L789-L890) создаётся кнопка `♫`. **Перед показом** асинхронно проверяется, что `mp3/<name>.mp3` реально существует на сервере (через `checkMp3FileExists` — см. ниже). Если файла нет — кнопка удаляется. При клике открывает `mp3Panel` и останавливает playback. | — |
| `<playback>` | В `.toggle-button` рядом с `<mp3>`. Содержимое — имя файла (или `<name>.mp3`) в папке `playback/`. **На песню берётся только первый встреченный тег.** | Обрабатывается **в том же цикле** `addButtons`, что и `<mp3>`. Создаётся кнопка с **текстом** «Playback» (последней в тулбаре). Аналогично проверяется существование `playback/<name>.mp3` — при 404 **кнопка не рисуется вовсе**. При клике останавливает **и mp3, и предыдущий playback** (`stopAllAudioPlayers`), открывает `playbackPanel`. | — |

Мапа лейблов задаётся в константе [`sectionMap`](file:///d:/source/songlist/music.js#L17-L25).

---

## 2.1. Prefix-переменные и проверка существования аудио-файлов

Путь к корневым папкам ресурсов задаётся **в index.html** как глобальные `window.*`:

| Переменная | Значение по-умолчанию | Где используется |
|---|---|---|
| `window.prefix` | `""` | Путь до корня проекта (использовался когда проект был в поддире). Добавляется к script/css URL, music.js, midi.js, setlist.js, bootstrap.js. |
| `window.prefixImage` | `"images/"` | Ленивая подгрузка `<img data-src>`: `src = prefixImage + data-src`. |
| `window.prefixPlayback` | `"playback/"` | Откуда брать mp3-файлы для тега `<playback>`: путь = `prefixPlayback + <имя_из_тега>.mp3`. |

**Нормализация имён:**
- mp3: [`normalizeMp3FileName(raw)`](file:///d:/source/songlist/music.js#L1352-L1355) — обрезает `.mp3` и пробелы.
- playback: [`normalizePlaybackFileName(raw)`](file:///d:/source/songlist/music.js#L1357-L1360) — обрезает `.mp3/.wav/.ogg/.flac/.aac/.m4a` и пробелы.

**Проверка «файл есть / нет:**
Одна универсальная функция [`checkMp3FileExists(filePath)`](file:///d:/source/songlist/music.js#L1384-L1398):
- Создаёт временный `<audio>`, выставляет `src`, ждёт `loadedmetadata/canplaythrough` → `true`
- `error/abort` или таймаут 3 сек → `false`
- Используется **и и для `<mp3>`, и для `<playback>`. Если вернуло `false` — `btn.remove()` — кнопка не рисуется.

**Взаимная остановка плееров:**
[`stopAllAudioPlayers(except)`](file:///d:/source/songlist/music.js#L1362-L1382):
- Ставит `pause(); currentTime = 0` у `#mp3Player` и `#playbackPlayer` (кроме указанного `except`)
- Закрывает панельку `.is-open`/`.minimized` у обоих панелей (кроме except)
- Вызывается перед запуском mp3 → `stopAllAudioPlayers('mp3Player')` и перед playback → `stopAllAudioPlayers('playbackPlayer')`

---

## 3. Атрибуты корневых контейнеров `.songlist[band]`

Висят на `<div class="songlist" band="..." position="...">` в корне каждого `songs/*.html`. Обрабатываются **в фазе 1 shell**.

| Атрибут | Типичное значение | Обработчик | За что отвечает |
|---|---|---|---|
| `band` | `"Lebedev"`, `"Weekend"`, `"Aqsaqal"`... | [`setActiveSongList()`](file:///d:/source/songlist/music.js#L599-L747) | Идентификатор коллекции. По нему фильтруется через `.band-select`, в `<title>` подставляется, из него берутся артисты для `<select.artist-select>`. |
| `position` | `"1"`, `""`, `undefined` | [setActiveSongList → bands.sort](file:///d:/source/songlist/music.js#L625-L637) | Порядок групп в выпадающем списке. Песочница с указанным числом стоит раньше; без position — по порядку в manifest.json. |

---

## 4. Атрибуты `.accordion` — карточки песни

Самый важный класс. На нём лежит **вся мета-информация о песне**. Часть атрибутов обрабатывается в **фазе 1 (shell)**, часть — в **фазе 2 (лениво при открытии)**.

| Атрибут | Пример | Фаза обработки | Где читается и что делает |
|---|---|---|---|
| `artist` | `"Deep Purple"` | **1 + 2** | Фаза 1 — из него собираются буквенный и именной `<select>` поиска артистов. Фаза 2 — отображается в шапке как `span.artist`. |
| `song` | `"Highway star"` | **1 + 2** | Аналогично — индекс поиска и `span.song` в заголовке. |
| `hash` | `"z7x4c1v9b2n0m5k"` | **1** | **Главный уникальный ID песни**. По нему: (а) работает [`copyAccordionContentByHash`](file:///d:/source/songlist/music.js#L892-L928); (б) хранятся данные setlist-а (`setlistData[hash]`); (в) поиск песни для next/announcer; (г) повторный чек на дубликаты в диагностике. |
| `hashreference` | `"t7r1e5w8q3y8u1z"` | **1** | Дублирование содержимого между песнями. Фаза 1: если `.accordion` имеет `hashreference=X` — его `.innerHTML` **перезаписывается** копией `.accordion[hash=X]`. .custom-content при этом сохраняется. На уровне `<song>` есть такая же механика (см. `hash`/`hashreference` **внутри** тегов секций — ниже). |
| `key` | `"Em"`, `"F# >> G"` | **2 (только при открытии)** | Информационно, в шапке как `span.song-key`. Также используется `transposeSong()`. Встречаются опечатки `keycustom=` — игнорируются. |
| `bank` | `"17-1"`, `"6-3"` | **1** | Отображается в шапке как `span.bank` («банк тембра/регистрации на синтезаторе»). |
| `voice` | `"Organ"`, `"Piano+Pads"` | **1 + 2** | Фаза 1 — шапка `span.voice`. Фаза 2 — при открытии аккордеона это **MIDI-ключ голоса** → передаётся в [`sendVComboVoice()`](file:///d:/source/songlist/midi.js) сразу после смены сцены. |
| `midi` | `"2,30"` (LSB,Program) | **1 + 2** | Фаза 2 — при открытии песни вызывается [`sendFantomSceneChange()`](file:///d:/source/songlist/midi.js#L661-L701): парсит `lsb,program` → отправляет MIDI Program Change Roland Fantom на канале 15 (MSB=85 фиксировано). Фаза 1 — значение показывается в шапке если есть `setListHelper`. Работает и на `.square-gray-button[midi]` внутри песни. |
| `pad` | `"1"` | **2** | Опционально с `midi`. После отправки сцены, через 500 мс эмулируется нажатие зелёной пады с этим номером. |
| `transpose` | `"2"` или `"-3"` | **2 лениво** | Автотранспонирование песни сразу при её раскрытии. В [initTransposeForAccordion](file:///d:/source/songlist/music.js#L1108-L1149) N раз «кликает» по `−/+` кнопкам транспонирования. `img[imagetype="scores"]` с `data-src` — **заменяются на предупреждение** «Notes removed due to key mismatch» + ссылка на оригинал. |
| `setlistblock` | `"3"` или `""` | **1** (пересчитывается каждый раз при загрузке setlist) | Номер **блока** setlist-а, в который добавлена песня. Атрибут не статический — проставляется/удаляется **динамически** в [`setlistApplyData()`](file:///d:/source/songlist/setlist.js#L140-L153). Инициализируется пустой строкой в [`addEmptySetlistAttribute()`](file:///d:/source/songlist/music.js#L1604-L1609). Если `parseInt > 0` — считается что песня «в блоке», показывается `✖` вместо `➕` и **игнорируется в поиске артистов** ([`isAccordionInSongBlock()`](file:///d:/source/songlist/music.js#L1512-L1518)). |
| `setlistposition` | `"7"` или `""` | **1** | Номер **порядка песни внутри блока** (song number). Логика такая же, как у `setlistblock`. |
| `data-band` | на `.header-row` | **1** | Добавляется в fillSongHeader, чтобы шапка знала к какой банде принадлежит при перерисовке. |

Альтернативные (резервные) имена атрибутов голоса для `getVoiceMidiKey()` — приоритет по порядку: **`sym:v`** → **`#sym:v`** → **`data-sym-v`** → **`data-voice-key`** → **`data-voice`** → **`voice`** ([midi.js:768](file:///d:/source/songlist/midi.js#L768)).

---

## 5. hash / hashreference — двойная механика

Есть два **независимых** уровня дублирования через `hash` + `hashreference`:

| Уровень | На чём стоят атрибуты | Когда работает | Функция |
|---|---|---|---|
| **Уровень аккордеона (вся песня)** | `div.accordion[hash]` / `div.accordion[hashreference]` | Фаза 1 shell, сразу после загрузки | [`copyAccordionContentByHash()`](file:///d:/source/songlist/music.js#L892-L928) — копирует ВСЁ содержимое аккордеона у донора. Сохраняет `.custom-content`. |
| **Уровень секции песни** | Дочерние теги внутри `<song>`: `<intro hash=X>`, `<chorus hashreference=X>` | Фаза 2 лениво, **перед** `convertSongToTable` | [`processHashReferences()`](file:///d:/source/songlist/music.js#L455-L484) — копирует innerHTML, **только если имя тега совпадает** с донором (chorus→chorus, verse→verse). |

---

## 6. `<img>` — ленивая загрузка картинок

Картинки в `songs/*.html` **не имеют** атрибута `src=`. Вместо него — `data-src=`, плюс `imagetype=`:

| Атрибут | Значение | Когда превращается в `src=` | Что происходит |
|---|---|---|---|
| `data-src` | `"shine.synth.1.png"` (**без** `images/` префикса) | **Фаза 2 лениво** — после клика на аккордеон | В [bindAccordionClickEvent](file:///d:/source/songlist/music.js#L962-L965): `img.src = prefixImage + img.dataset.src + '?v=' + Date.now()` → `data-src` удаляется. |
| `imagetype` | `"scores"` или `"customImage"` | Тот же момент | Фильтр, чтобы «лениво» грузить **только** картинки с этими двумя типами. `"scores"` ещё влияет на `initTransposeForAccordion` (заменяется при автотранспонировании). |

⚠️ Проблема кэширования: суффикс `?v=Date.now()` генерирует новый URL при каждом клике — не даёт HTTP-кэшу и Service Worker хранить стабильную запись.

---

## 7. Аттрибуты setlist / удалённо-сохраняемых данных

| Атрибут | Кто проставляет | Значение |
|---|---|---|
| `setlistblock` | JS рантайм ([setlistApplyData](file:///d:/source/songlist/setlist.js#L140-L153)) из данных сохранённых в `jsonstorage.net` API | Пустая строка или целое число от 0..N |
| `setlistposition` | Тоже самое | Номер песни в блоке |

ВАЖНО: в исходных HTML-файлах эти два атрибута **бывают прописаны руками** как `setlistblock="" setlistposition=""` — это нормально, они всё равно перезапишутся в `setlistApplyData` → сначала `removeAttribute`, потом `setAttribute` если есть в `setlistData[hash]`. Если данных нет — остаются как вызов `setAttribute(..., "")` и ведут себя как «не назначено».

Правило проверки «в блоке / не в блоке» — **единое для всего проекта** ([setlistUpdateHeaderActions](file:///d:/source/songlist/setlist.js#L171-L172), [isAccordionInSongBlock](file:///d:/source/songlist/music.js#L1512-L1518)):
```js
const hasBlock = (blockValue.trim() !== '') && (parseInt(blockValue, 10) > 0);
```
То есть `"0"` — тоже считается «не назначено».

---

## 8. Короткий чек-лист что будет работать без интернета (для PWA/Service Worker)

| Сущность | Кэшируется при первом заходе? | Почему |
|---|---|---|
| index.html, music.css, music.js, midi.js, setlist.js, bootstrap.js | ✅ Да | Запрашиваются сразу на старте |
| songs/\*.html (13 файлов) | ✅ Да | [bootstrap.js](file:///d:/source/songlist/bootstrap.js) их жадно фетчит при загрузке |
| Тексты песен (verse/chorus/...) | ✅ Да | Уже внутри скачанных `songs/*.html` |
| Картинки `images/*.png` (imagetype=scores) | ⚠️ **Только после первого открытия соответствующей песни** | Грузяся лениво через `data-src` при клике |
| MP3-бэкинги (`mp3/*.mp3`) | ⚠️ Только после первого открытия (если есть `<mp3>` и пользователь кликнул) | Лениво. ⚠️ Кнопка `♫` **вообще не появится**, если в кэше нет записи HEAD/metadata о существовании файла. |
| Playback-файлы (`playback/*.mp3`) | ⚠️ Только после первого открытия (если есть `<playback>` и пользователь кликнул Playback) | Лениво. Тоже самое — кнопка **отобразится только если `checkMp3FileExists` вернул true**. |
| Сохранённый setlist | ⚠️ Только если пользователь был онлайн и он успел сохраниться / загрузиться из jsonstorage.net | Внешнее API; нужен fallback на localStorage |
