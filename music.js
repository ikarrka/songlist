const paintedSongs = new WeakSet();
let originalOrder = {};
const checklist = [
    'Check loaded registration file for VR09',
    'Check loaded registration file for Fantom07',
    'Check MIDI output device',
    'Piano - RockPiano',
    'Piano - Others -  Accordion',
    'Synth - Brass -   Muted / ClassicTp',
    'Synth - Strings - Full Strings',
    'Synth - Bass - Fat Analog',
    'Synth - Choir -   ClassicChoir',
    'Synth - SFX -     OrchHit',
    'Synth - Others -  Marimba',
];

const sectionMap = {
    intro: 'Int',
    verse: 'Vrs',
    chorus: 'Cho',
    prechorus: 'Pre',
    interlude: 'Inr',
    instr: 'Ins',
    coda: 'Cod',
    bridge: 'Brd'
};

const TransposeButtonDownSymbol = "⬇";
const TransposeButtonUpSymbol = "⬆";

document.addEventListener("DOMContentLoaded", function () {
    window.addEventListener('beforeunload', function (e) {
        if (isRunningInWebView() || isChromeOnWindows()) {
            return;
        }

        e.preventDefault();
        e.returnValue = ''; // Показывает стандартное предупреждение
    });

    checkAccordionsHash();
    copyAccordionContentByHash();
    bindAccordionClickEvent();

    setActiveSongList();

    handleAccordionAccess();
    fillCheckList();
    updateMidiIndicators();
    bindNavigationEvents()

    document.body.style.visibility = "visible";
    const loader = document.getElementById("pageLoader");
    if (loader) loader.remove();
});

function reorderSongList(band) {
    document.querySelectorAll('.reordered').forEach(el => el.remove());

    // Ищем div.songlist с нужным атрибутом
    const container = document.querySelector(`.songlist[band="${band}"]`);
    if (!container) {
        return;
    }

    const items = Array.from(container.querySelectorAll('.accordion'));
    // СБРОС margin у всех песен
    items.forEach(item => {
        item.style.marginTop = '';
    });
    const numbered = [];
    const unnumbered = [];

    items.forEach(item => {
        const numVal = item.getAttribute('setlistposition')?.trim() ?? '';
        const blockVal = item.getAttribute('setlistblock')?.trim() ?? '';
        const button = item.querySelector('.toggle-button');

        if (numVal === '') {
            unnumbered.push(item);
        } else {
            const number = parseInt(numVal, 10);
            let block = parseInt(blockVal, 10);
            if (isNaN(block) || block === 0) {
                block = 1;
            }

            if (!isNaN(number)) {
                if (button !== null) {
                    const text = button.innerHTML;

                    const spanSongNumber = document.createElement('span');
                    spanSongNumber.className = 'reordered';
                    spanSongNumber.textContent = `${block}-${number}.`;

                    button.innerHTML = "";
                    button.appendChild(spanSongNumber);
                    button.insertAdjacentHTML('beforeend', text);
                }

                if (number === 1) {
                    const header = document.createElement('h2');
                    header.className = 'reordered';
                    header.textContent = `Block ${block}`;
                    header.setAttribute('data-band', band);
                    item.style.marginTop = '20px';
                    item.insertBefore(header, item.firstChild);

                    const removeBtn = document.createElement('span');
                    removeBtn.classList.add('block-remove-btn');
                    removeBtn.dataset.block = block;

                    removeBtn.addEventListener('click', function (e) {
                        e.stopPropagation();
                        deleteBlockSongs(band, block);
                    });

                    header.appendChild(removeBtn);
                } else {
                    item.style.marginTop = '';
                }

                numbered.push({ node: item, block, number });
            } else {
                unnumbered.push(item);
            }
        }
    });

    numbered.sort((a, b) => {
        if (a.block !== b.block) {
            return a.block - b.block;
        }
        return a.number - b.number;
    });

    // восстановление исходного порядка для unnumbered
    if (originalOrder[band]) {
        unnumbered.sort((a, b) => {
            return originalOrder[band].indexOf(a.getAttribute('hash')) -
                originalOrder[band].indexOf(b.getAttribute('hash'));
        });
    }

    container.innerHTML = '';
    numbered.forEach(item => container.appendChild(item.node));
    if (Array.isArray(numbered) && numbered.length > 0 && unnumbered.length > 0) {
        const hr = document.createElement('hr');
        hr.className = 'reordered';
        hr.style.marginTop = '20px';
        hr.style.marginBottom = '20px';
        container.appendChild(hr);
    }
    unnumbered.forEach(item => container.appendChild(item));
    //ArtistSongToClipboard();
    //ArtistSongToConsoleArray();
    ArtistSongToConsoleRows();
}

function fillSongHeader(band) {
    if (band.headerHandled == 1) return;
    band.headerHandled = 1;
    const items = band.querySelectorAll('.accordion');

    const config = {
        songOrder: { className: 'songOrder' },
        artist: { className: 'artist' },
        song: { className: 'song' },
        key: { className: 'song-key', altAttr: 'keycustom' },
        bank: { className: 'bank' },
        voice: { className: 'voice' },
        split: { className: 'split' },
        midi: { className: 'midi' },
        pad: { className: 'pad' },
        scene: { className: 'scene' },
        note: { className: 'note' }, // 🆕 добавлен новый тип
    };

    // 🧹 1️⃣ Удаляем старые <span>
    function removeOldSpans(button) {
        const selector = Object.values(config)
            .map(c => 'span.' + c.className)
            .join(',');
        button.querySelectorAll(selector).forEach(el => el.remove());
    }

    // 🧩 2️⃣ Создаём пустые <span> по конфигурации
    function createSpans(button) {
        const spans = {};
        Object.entries(config).forEach(([attr, conf]) => {
            const span = document.createElement('span');
            span.className = conf.className;
            button.appendChild(span);
            spans[attr] = span;
        });
        return spans;
    }

    // 🎨 3️⃣ Определяем значение и стили для конкретного атрибута
    function getSpanValueAndStyle(item, attr, conf) {
        let value = null;
        let style = {};

        switch (attr) {
            case 'key': {
                const keyVal = item.getAttribute('key');
                const customVal = item.getAttribute(conf.altAttr);
                if (customVal) {
                    value = customVal;
                    style = { fontWeight: 'bold', color: 'green', fontSize: '1.2em' };
                } else if (keyVal) {
                    value = keyVal;
                    style = { fontWeight: 'bold' };
                }
                break;
            }

            case 'midi': {
                if (item.hasAttribute('midi')) {
                    value = '🎹';
                }
                break;
            }

            case 'pad': {
                if (item.hasAttribute('pad')) {
                    value = item.getAttribute('pad');
                    style = {
                        fontWeight: 'bold',
                        color: '#ffffff',
                        //fontSize: '1.2em',
                        backgroundColor: '#1f7a1f',
                        border: '1px solid #1f7a1f',
                        borderRadius: '6px',
                        padding: '5px'
                    };

                }
                break;
            }


            case 'note': { // 🆕 логика для note
                const noteVal = item.getAttribute('note');
                if (noteVal) {
                    value = noteVal;
                    style = { fontStyle: 'italic', color: '#666' }; // лёгкий серый курсив
                }
                break;
            }

            default:
                value = item.getAttribute(attr);
        }

        return { value, style };
    }

    // 🖋️ 4️⃣ Заполняем <span> данными
    function fillSpans(item, spans) {
        Object.entries(config).forEach(([attr, conf]) => {
            const span = spans[attr];
            const { value, style } = getSpanValueAndStyle(item, attr, conf);

            if (!value) {
                span.style.display = 'none';
                return;
            }

            span.textContent = value;
            Object.assign(span.style, style);
        });
    }

    // 🚀 Основной цикл
    items.forEach(item => {
        const button = item.querySelector('.toggle-button');
        if (!button) return;

        removeOldSpans(button);
        const spans = createSpans(button);
        fillSpans(item, spans);
    });
}


function handleAccordionAccess() {
    const interact = 'ik'; //params.get('interact');

    accessGranted = (interact != null && interact.toLowerCase() == 'ik')
    if (!accessGranted) {
        const accordions = document.querySelectorAll('.accordion');

        accordions.forEach(accordion => {
            // Пример: убираем класс, отключаем клики
            accordion.classList.remove('active');

            // Клонируем элемент без обработчиков
            const clone = accordion.cloneNode(true);
            accordion.replaceWith(clone);
        });

        const bankSpans = document.querySelectorAll('span.bank');
        bankSpans.forEach(span => {
            span.remove();
        });

        const midiContent = document.getElementById("midiContent");
        if (midiContent) {
            midiContent.remove();
        }
        const midiManual = document.getElementById("midiManual");
        if (midiManual) {
            //midiManual.remove();
        }
        const checkList = document.getElementById("checkList");
        if (checkList) {
            checkList.remove();
        }
    }
}

function paintChords(song) {
    if (paintedSongs.has(song)) return;
    paintedSongs.add(song);

    const chordRegex =
        /(?<![A-Za-z0-9])([A-H](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:\/[A-H](?:#|b)?)?)(?![A-Za-z0-9])/g;

    const pres = song.querySelectorAll("pre");
    pres.forEach(pre => {
        const walker = document.createTreeWalker(
            pre,
            NodeFilter.SHOW_TEXT,
            null
        );

        const textNodes = [];
        let node;

        // сначала собираем все текстовые узлы
        while ((node = walker.nextNode())) {
            if (!node.parentNode.classList?.contains("chord")) {
                textNodes.push(node);
            }
        }

        // потом обрабатываем
        textNodes.forEach(node => {
            const text = node.nodeValue;
            chordRegex.lastIndex = 0;
            let match = chordRegex.exec(text);

            if (!match) return;

            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            do {

                const chord = match[1];
                const offset = match.index;
                if (offset > lastIndex) {
                    fragment.appendChild(
                        document.createTextNode(text.slice(lastIndex, offset))
                    );
                }

                const span = document.createElement("span");
                span.className = "chord";
                span.textContent = chord;
                fragment.appendChild(span);
                lastIndex = offset + chord.length;

            } while ((match = chordRegex.exec(text)));

            fragment.appendChild(
                document.createTextNode(text.slice(lastIndex))
            );
            node.parentNode.replaceChild(fragment, node);
        });
    });
}

/**
 * Заполняет чеклист на странице, если элемент с id "checklist" существует
 */
function fillCheckList() {
    if (document.getElementById("checklist")) {
        document.getElementById("checklist").innerHTML = `
      ${checklist.map(item => `<div class="checkdiv">
          <input type="checkbox" class="checkmark" />
          <span class="item-text">${item}</span></div>`).join('')}`;
    }
}

function convertSongToTable(song) {
    if (!song) return;
    if (song.dataset.converted) return;
    song.dataset.converted = "1";
    const table = document.createElement('table');
    table.className = 'structure';
    const colgroup = document.createElement('colgroup');
    const sectionCol = document.createElement('col');
    sectionCol.className = 'section-col';
    const contentCol = document.createElement('col');
    contentCol.className = 'content-col';
    colgroup.appendChild(sectionCol);
    colgroup.appendChild(contentCol);
    table.appendChild(colgroup);
    const controlsRow = document.createElement('tr');
    controlsRow.className = 'songpart controls-row';
    const controlsCell = document.createElement('td');
    controlsCell.className = 'controls-cell';
    controlsCell.colSpan = 2;
    controlsRow.appendChild(controlsCell);
    table.appendChild(controlsRow);

    // Перебираем все дочерние узлы song
    songContainer = song.querySelector("song");
    if (!songContainer) return;

    Array.from(songContainer.children).forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            const content = node.innerHTML.trim();

            const tr = document.createElement('tr');
            tr.className = `songpart ${tagName}`;

            const td1 = document.createElement('td');

            td1.textContent = sectionMap[tagName];


            const td2 = document.createElement('td');
            const pre = document.createElement('pre');
            pre.innerHTML = content;

            td2.appendChild(pre);
            tr.appendChild(td1);
            tr.appendChild(td2);

            table.appendChild(tr);
        }
    });

    // Заменяем исходный <song> на новую таблицу
    songContainer.replaceWith(table);
    paintChords(table);
    addButtons(song);
    replaceBackticksWithSpace(table);
    replaceCustomTags(song);
    handleMidi(table);
}

/**
 * convert <yt> and <chord> tags to links and symbols
 */
function replaceCustomTags(song) {
    const chordSign = '☰'

    const configs1 = [
        { selector: 'yt, YT', text: '►' },
        { selector: 'chord', text: chordSign }
    ];
    configs1.forEach(({ selector, text }) => {
        song.querySelectorAll(selector).forEach(tag => {
            tag.style.display = "none";
        });
    });

    // Дополнительная обработка обычных <a>
    // song.querySelectorAll('a').forEach(link => {
    //     const href = link.getAttribute('href')?.trim();

    //     if (!href) {
    //         link.addEventListener('click', event => event.preventDefault());
    //     } else {
    //         link.setAttribute('target', '_blank');
    //         if (!/youtube\.com|youtu\.be/i.test(href)) {
    //             link.style.textDecoration = 'none';
    //             link.textContent = chordSign;
    //         }
    //         else {
    //             link.classList.add('youtube-link');
    //         }
    //     }
    // });
}

function setActiveSongList() {
    // убираем старый селект, если функция вызвана повторно
    document.querySelectorAll("select.band-select").forEach(el => el.remove());

    const lists = Array.from(document.querySelectorAll("div.songlist"));
    if (lists.length === 0) return;

    // собираем уникальные группы с учётом их позиции
    const bandMap = new Map();
    lists.forEach((div, index) => {
        const b = div.getAttribute("band");
        if (!b) return;

        // если группа уже есть — не перезаписываем
        if (!bandMap.has(b)) {
            let pos = div.getAttribute("position");
            // если position не число — оставим null
            pos = pos !== null && !isNaN(pos) ? Number(pos) : null;
            bandMap.set(b, { band: b, position: pos, order: index });
        }
    });


    // преобразуем в массив и сортируем:
    // - сначала по position (число)
    // - потом те, у кого position нет, по порядку появления
    const bands = [...bandMap.values()]
        .sort((a, b) => {

            const posA = a.position > 0 ? a.position : Infinity;
            const posB = b.position > 0 ? b.position : Infinity;

            if (posA !== posB) {
                return posA - posB;
            }

            return a.order - b.order;
        })
        .map(item => item.band);

    if (bands.length === 0) return;

    // текущая выбранная группа (по умолчанию первая)
    let selected = bands[0];
    const buildArtistSelectors = (band) => {

        const cellLetter = document.getElementById('cell_letter_select');
        const cellArtist = document.getElementById('cell_artist_select');

        if (!cellLetter || !cellArtist) return;

        cellLetter.innerHTML = '';
        cellArtist.innerHTML = '';


        const activeList = document.querySelector(`div.songlist[band="${band}"]`);
        if (!activeList) return;

        const lettersSet = new Set();
        const artistSet = new Set();

        activeList.querySelectorAll('.accordion').forEach(div => {

            const artist = div.getAttribute('artist');
            if (!artist) return;

            artistSet.add(artist);
            lettersSet.add(artist.charAt(0).toUpperCase());

        });

        if (artistSet.size === 0) return;

        // ----- select букв
        const letterSelect = document.createElement('select');
        letterSelect.className = 'artist-letter-select';

        [...lettersSet]
            .sort()
            .forEach(letter => {
                const option = document.createElement('option');
                option.value = letter;
                option.textContent = letter;
                letterSelect.appendChild(option);
            });

        cellLetter.appendChild(letterSelect);

        // ----- select артистов
        const artistSelect = document.createElement('select');
        artistSelect.className = 'artist-select';

        [...artistSet]
            .sort((a, b) => a.localeCompare(b))
            .forEach(artist => {
                const option = document.createElement('option');
                option.value = artist;
                option.textContent = artist;
                artistSelect.appendChild(option);
            });

        cellArtist.appendChild(artistSelect);
    };

    // функция отображения/скрытия
    const applyFilter = (band) => {
        lists.forEach(div => {
            div.style.display = (div.getAttribute("band") === band) ? "" : "none";
        });
        // обновляем <title>
        document.title = band.charAt(0).toUpperCase() + band.slice(1);
        if (band != 'allbands') {
            reorderSongList(band);
        }
        else {
            buildAllBandsList()
        }
        buildArtistSelectors(band);
        fillSongHeader(document.querySelector(`div[band="${band}"]`));
    };

    // создаём селект
    const select = document.createElement("select");
    select.className = "band-select";

    bands.forEach(b => {
        const opt = document.createElement("option");
        opt.value = b;
        opt.textContent = b.charAt(0).toUpperCase() + b.slice(1);
        if (b === selected) opt.selected = true;
        select.appendChild(opt);
    });

    // обработчик смены выбора
    select.addEventListener("change", () => {
        applyFilter(select.value);
    });

    // вставляем селект в начало body
    const wrapper = document.createElement("div");
    wrapper.className = "band-select-wrapper";
    wrapper.appendChild(select);

    // вставляем wrapper в начало body
    const cell = document.getElementById('cell_band_select');
    cell.appendChild(wrapper);
    // применяем фильтр для первой группы
    applyFilter(selected);
}

function transposeSong(direction = 1, table) {
    if (direction !== 1 && direction !== -1) {
        console.error("direction должен быть 1 или -1");
        console.log("передано", direction);
        return;
    }

    if (!table) {
        console.warn("Таблица не передана");
        return;
    }

    // Полутонная последовательность
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const flatMap = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };

    // Функция для транспонирования одного аккорда
    function transposeChord(chord, step) {
        // пример: "C#m7", "F#7/Bb"
        return chord.replace(/[A-G](#|b)?/g, (match) => {
            let root = match;

            // приводим b к # (Db → C#)
            if (flatMap[root]) root = flatMap[root];

            let idx = notes.indexOf(root);
            if (idx === -1) return match; // если не распознали (например, "N.C.")

            let newIdx = (idx + step + notes.length) % notes.length;
            return notes[newIdx];
        });
    }

    // все аккорды в указанной таблице
    const chords = table.querySelectorAll("span.chord");
    chords.forEach(span => {
        span.textContent = transposeChord(span.textContent, direction);
    });
}

function addButtons(song) {
    if (!song) return;
    const table = song.querySelector("table.structure");
    let targetCell;
    if (table) {
        targetCell = table.querySelector("tr.controls-row td.controls-cell");
    }
    else {
        targetCell = song.querySelector("pre");
    }

    if (!targetCell) return;

    const wrapper = document.createElement("div");
    wrapper.className = "tool-buttons";
    if (!table) {
        wrapper.style.position = "static";
        wrapper.style.float = "right";
    }
    const buttons = [
        { txt: "⛭", class: "setlist-btn" },
        { txt: "►", class: "youtube-link", tag: "yt", action: openYoutubeFrame },
        { txt: "☰", tag: "chord", action: link => window.open(link, "_blank") },
        { txt: TransposeButtonDownSymbol, transpose: -1, class: "transpose-btn down"  },
        { txt: TransposeButtonUpSymbol, transpose: 1, class: "transpose-btn up"  },
    ];

    buttons.forEach(cfg => {
        if (cfg.transpose && !table) return;
        const btn = document.createElement("button");
        btn.textContent = cfg.txt;
        btn.classList.add("tool-btn");

        if (cfg.class) {
            btn.classList.add(...cfg.class.split(" "));
        }

        if (cfg.tag) {
            const link = song
                ?.querySelector(`button.toggle-button ${cfg.tag}`)
                ?.textContent
                ?.trim();

            if (link) {
                btn.addEventListener("click", () => cfg.action(link));
            } else {
                btn.disabled = true;
            }
        }

        if (cfg.transpose) {
            btn.style.fontWeight = "bold";
            btn.addEventListener("click", () =>
                transposeSong(cfg.transpose, table)
            );
        }

        wrapper.appendChild(btn);
    });

    targetCell.classList.add("transpose-cell");
    targetCell.appendChild(wrapper);
}

function copyAccordionContentByHash() {
    const targets = document.querySelectorAll('div.accordion[hashreference]');

    if (targets.length === 0) {
        return;
    }

    targets.forEach(target => {
        const hashReference = target.getAttribute('hashreference');
        if (!hashReference) return;

        const selector = `div.accordion[hash="${hashReference}"]`;
        const destination = document.querySelector(selector);

        if (!destination) {
            console.warn(`Не найдена цель (destination) для hash: "${hashReference}"`);
            return;
        }

        // 1. Сохраняем custom-content, если он есть
        const customContent = target.querySelector('.custom-content');

        // 2. Копируем весь HTML
        target.innerHTML = destination.innerHTML;

        // 3. Если был custom-content — вставляем его первым в .content
        if (customContent) {
            const contentDiv = target.querySelector('.content');

            if (contentDiv) {
                contentDiv.insertBefore(customContent, contentDiv.firstChild);
            } else {
                console.warn('В target не найден .content');
            }
        }
    });
}


function bindAccordionClickEvent() {
    document.addEventListener("click", function (e) {

        const button = e.target.closest(".toggle-button");
        if (!button) return;

        const accordion = button.closest(".accordion");
        if (!accordion) return;

        const accordions = document.querySelectorAll(".accordion");

        const isActive = accordion.classList.contains("active");

        accordions.forEach(acc => acc.classList.remove("active"));

        if (!isActive) {

            accordion.classList.add("active");

            if (accordion.getAttribute("midi")) {
                sendFantomSceneChange(accordion);
            }

            convertSongToTable(accordion);

            // ленивая загрузка картинок
            accordion.querySelectorAll('img[imagetype="scores"][data-src], img[imagetype="customImage"][data-src]').forEach(img => {
                img.src = prefixImage + img.dataset.src + '?v=' + Date.now();
                img.removeAttribute("data-src");
            });

            initTransposeForAccordion(accordion);
        }

        const yOffset = 0;

        setTimeout(() => {
            const y = button.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }, 200);

        if (accordion.id === 'checkList') {
            document.querySelectorAll('input.checkmark').forEach(el => el.checked = false);
        }

    });
}

function isRunningInWebView() {
    const userAgent = navigator.userAgent.toLowerCase();
    // Часто WebView содержит строку "wv" или "mobile" без явного названия браузера
    // *ВНИМАНИЕ*: Это очень зависит от настроек вашего WebView!
    return userAgent.includes('uniq_word_for_android') || userAgent.includes('wv');
}

function isChromeOnWindows() {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('windows nt') && ua.includes('chrome');
}

function checkAccordionsHash() {
    // --- 1. Проверка на отсутствие hash ---
    const accordions = document.querySelectorAll('div.accordion[song]');
    const noHashSongs = [];

    accordions.forEach(div => {
        if (!div.hasAttribute('hash')) {
            noHashSongs.push(div.getAttribute('song'));
        }
    });

    const noHashListSpan = document.getElementById('hashNoList');
    const noHashWrapper = document.getElementById('hashNo');

    if (noHashSongs.length > 0) {
        if (noHashListSpan) noHashListSpan.innerHTML = noHashSongs.join('<br>');
        if (noHashWrapper) noHashWrapper.style.display = '';
    } else {
        if (noHashWrapper) noHashWrapper.style.display = 'none';
    }

    // --- 2. Проверка на повторяющиеся hash ---
    const hashCounts = {};
    const duplicates = [];

    accordions.forEach(div => {
        const hash = div.getAttribute('hash');
        if (hash) {
            hashCounts[hash] = (hashCounts[hash] || 0) + 1;
        }
    });

    for (let hash in hashCounts) {
        if (hashCounts[hash] > 1) {
            duplicates.push(hash);
        }
    }

    const repeatListSpan = document.getElementById('hashRepeatList');
    const repeatWrapper = document.getElementById('hashRepeat');

    if (duplicates.length > 0) {
        if (repeatListSpan) repeatListSpan.innerHTML = duplicates.join('<br>');
        if (repeatWrapper) repeatWrapper.style.display = '';
    } else {
        if (repeatWrapper) repeatWrapper.style.display = 'none';
    }

    if (noHashSongs.length === 0 && duplicates.length === 0) {
        addEmptySetlistAttribute();
    }
}

async function buildAllBandsList() {
    const allContainer = document.querySelector('.songlist[band="allbands"]');
    if (!allContainer) return;

    allContainer.innerHTML = '';

    const seen = new Set();
    const allAccordions = [];

    // Собираем все аккордеоны из всех групп
    document.querySelectorAll('.songlist[band]').forEach(container => {
        if (container.getAttribute('band') === 'allbands') return;

        container.querySelectorAll('.accordion').forEach(acc => {
            const artist = acc.getAttribute('artist')?.trim() || '';
            const song = acc.getAttribute('song')?.trim() || '';
            const uniqueKey = artist + '::' + song;

            if (!seen.has(uniqueKey)) {
                seen.add(uniqueKey);
                allAccordions.push(acc.cloneNode(true));
            }
        });
    });

    // ✅ Сортировка: сначала по артисту, потом по песне
    allAccordions.sort((a, b) => {
        const artistA = a.getAttribute('artist')?.trim().toLowerCase() || '';
        const artistB = b.getAttribute('artist')?.trim().toLowerCase() || '';
        if (artistA !== artistB) return artistA.localeCompare(artistB);

        const songA = a.getAttribute('song')?.trim().toLowerCase() || '';
        const songB = b.getAttribute('song')?.trim().toLowerCase() || '';
        return songA.localeCompare(songB);
    });

    // Добавляем в контейнер
    allAccordions.forEach(acc => allContainer.appendChild(acc));
    // ✅ Формируем CSV уже ПОСЛЕ сортировки
    const csvRows = [["Artist", "Song"]];
    allAccordions.forEach(acc => {
        const artist = acc.getAttribute('artist')?.trim() || '';
        const song = acc.getAttribute('song')?.trim() || '';
        csvRows.push([artist, song]);
    });

    // Табулированный текст без кавычек — готов для Excel / Sheets
    const csvText = csvRows.map(row => row.join('\t')).join('\n');

    // 📋 Копируем в буфер
    try {
        await navigator.clipboard.writeText(csvText);
        console.log("✅ Список артистов и песен скопирован в буфер обмена в отсортированном виде.");
    } catch (err) {
        console.warn("⚠️ Не удалось скопировать в буфер обмена:", err);
    }
}

function initTransposeForAccordion(acc) {
    if (!acc || acc.dataset.transposeApplied === "1") return;

    const transposeValue = parseInt(acc.getAttribute("transpose"), 10);
    if (isNaN(transposeValue) || transposeValue === 0) return;

    acc.querySelectorAll('img[imagetype="scores"]').forEach(img => {
        const src = img.getAttribute("data-src");
        const notice = document.createElement("div");

        const a = document.createElement('a');
        a.href = src;
        a.target = '_blank';
        a.className = 'originalImage';
        a.textContent = 'original';

        notice.innerHTML = '&#119070; ';
        notice.append('Notes removed due to key mismatch ', a);

        notice.classList.add("tilde-text");
        img.replaceWith(notice);
    });

    const btnContainer = acc.querySelector(".tool-buttons");
    if (!btnContainer) return;

    // Ищем кнопки по содержимому текста
    const minusBtn = Array.from(btnContainer.querySelectorAll(".transpose-btn"))
        .find(btn => btn.textContent.trim() === TransposeButtonDownSymbol || btn.textContent.trim() === "-");
    const plusBtn = Array.from(btnContainer.querySelectorAll(".transpose-btn"))
        .find(btn => btn.textContent.trim() === TransposeButtonUpSymbol);
    if (!minusBtn || !plusBtn) return;

    const btn = transposeValue > 0 ? plusBtn : minusBtn;
    const count = Math.abs(transposeValue);

    for (let i = 0; i < count; i++) {
        btn.click();
    }

    acc.dataset.transposeApplied = "1";
}

function initClickOnPads(song) {
    song.querySelectorAll(".square-green-button").forEach(btn => {
        btn.addEventListener("click", () => {
            getPadSysex(btn.textContent.trim());
        });
    });
}

function initHammondVolumeChange(song) {
    const sliders = song.querySelectorAll('.hammondVolume');
    sliders.forEach(slider => {

        slider.disabled = !midiOutput;
        if (slider.disabled) return;

        slider.min = 0;
        slider.max = 100;
        slider.value = 100;
        slider.addEventListener('input', () => {
            const rawValue = parseInt(slider.value, 10);
            const midiValue = Math.round(rawValue * 127 / 100);
            sendMidiCC(1, 7, midiValue);

            sliders.forEach(other => {
                if (other !== slider) {
                    other.value = slider.value;
                }
            });
        });
    });
}

function initHammondVolumes(song) {
    const sliders = song.querySelectorAll('.hammondVolume');
    sliders.forEach(vol => {
        vol.min = 0;
        vol.max = 127;
        vol.value = 64;
    });
}

function replaceBackticksWithSpace(table) {
    table.querySelectorAll("pre").forEach(pre => {
        const walker = document.createTreeWalker(
            pre,
            NodeFilter.SHOW_TEXT,
            null
        );

        let node;
        while (node = walker.nextNode()) {
            node.textContent = node.textContent.replace(/`/g, " ");
        }
    });
}

function openYoutubeFrame(link) {
    const url = new URL(link);
    const videoId = url.searchParams.get('v');
    if (!videoId) return;

    const modal = document.getElementById('videoModal');
    const frame = document.getElementById('youtubeFrame');

    frame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    modal.style.display = 'flex';
    modal.classList.remove('minimized');

    bindYoutubeHandlersOnce();
}

function bindYoutubeHandlersOnce() {
    if (window._youtubeHandlerBound) return;
    window._youtubeHandlerBound = true;

    const modal = document.getElementById('videoModal');
    const frame = document.getElementById('youtubeFrame');

    document.getElementById('closeModal')
        ?.addEventListener('click', () => {
            frame.src = '';
            modal.style.display = 'none';
        });

    document.getElementById('minimizeModal')
        ?.addEventListener('click', () => {
            modal.classList.toggle('minimized');
            //console.log('Minimize toggled:', modal.classList.contains('minimized'));
        });

    document.getElementById('restoreModal')
        ?.addEventListener('click', () => {
            modal.classList.remove('minimized');
        });
}

function ArtistSongToClipboard() {
    const bandId = document.querySelector('.band-select').value;
    const bandDiv = document.querySelector(`div[band="${bandId}"]`);
    if (!bandDiv) return;

    const buttons = bandDiv.querySelectorAll('.toggle-button');

    let csv = "";
    buttons.forEach(btn => {
        const artist = btn.querySelector('.artist')?.textContent.trim() || "";
        const song = btn.querySelector('.song')?.textContent.trim() || "";
        const songKey = btn.querySelector('.song-key')?.textContent.trim() || "";

        const youtubeRaw = btn.querySelector('.youtube-link')?.href || "";
        const youtube = youtubeRaw ? `=HYPERLINK("${youtubeRaw}";"Открыть")` : "";

        csv += `${artist}\t${song}\t${songKey}\t${youtube}\r\n`;
    });

    try {
        navigator.clipboard.writeText(csv).then(() => {
            console.log("CSV copied to clipboard.");
        });
    } catch (error) {
        console.log(error);

    }
}

function ArtistSongToConsoleArray() {
    const bandId = document.querySelector('.band-select').value;
    const bandDiv = document.querySelector(`div[band="${bandId}"]`);
    if (!bandDiv) return;

    const buttons = bandDiv.querySelectorAll('.toggle-button');

    const result = [];

    buttons.forEach(btn => {
        const artist = btn.querySelector('.artist')?.textContent.trim() || "";
        const song = btn.querySelector('.song')?.textContent.trim() || "";
        const songKey = btn.querySelector('.song-key')?.textContent.trim() || "";
        const youtube = btn.querySelector('.youtube-link')?.href || "";

        result.push({
            artist,
            song,
            songKey,
            youtube
        });
    });

    //console.log(result);
    return result;
}

function ArtistSongToConsoleRows() {
    const bandId = document.querySelector('.band-select').value;
    const bandDiv = document.querySelector(`div[band="${bandId}"]`);
    if (!bandDiv) return;

    const buttons = bandDiv.querySelectorAll('.toggle-button');

    const rows = [];

    buttons.forEach(btn => {
        const artist = btn.querySelector('.artist')?.textContent.trim() || "";
        const song = btn.querySelector('.song')?.textContent.trim() || "";
        const songKey = btn.querySelector('.song-key')?.textContent.trim() || "";
        const youtube = btn.querySelector('.youtube-link')?.href || "";

        rows.push([artist, song, songKey, youtube]);
    });

    //    console.table(rows);
    //console.log(rows.map(r => r.join("\t")).join("\n"));

    return rows;
}

function bindLetterSelectEvent() {
    document.addEventListener('change', (event) => {
        const target = event.target;

        if (!target.matches('select.artist-letter-select')) return;

        const letter = target.value;
        if (!letter) return;

        const bandSelect = document.querySelector('select.band-select');
        if (!bandSelect) return;

        const currentBand = bandSelect.value;

        const accordions = document.querySelectorAll(
            'div.songlist[band="' + currentBand + '"] div.accordion'
        );

        for (const acc of accordions) {
            const artistSpan = acc.querySelector('span.artist');
            if (!artistSpan) continue;

            const text = artistSpan.textContent.trim();
            if (text.charAt(0).toUpperCase() === letter) {
                acc.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                break;
            }
        }
    });
}

function bindArtistSelectEvent() {
    document.addEventListener('change', (event) => {
        const target = event.target;

        if (!target.matches('select.artist-select')) return;

        const artist = target.value;
        if (!artist) return;

        const bandSelect = document.querySelector('select.band-select');
        if (!bandSelect) return;

        const currentBand = bandSelect.value;

        const accordions = document.querySelectorAll(
            'div.songlist[band="' + currentBand + '"] div.accordion'
        );

        for (const acc of accordions) {
            const artistSpan = acc.querySelector('span.artist');
            if (!artistSpan) continue;

            const text = artistSpan.textContent.trim();
            if (text === artist) {
                acc.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                break;
            }
        }
    });
}

function bindScrollToTopEvent() {
    document.getElementById('scrollToTopBtn').addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function bindNavigationEvents() {
    bindLetterSelectEvent();
    bindArtistSelectEvent();
    bindScrollToTopEvent();
}

function handleMidi(song) {
    initClickOnPads(song);
    initHammondVolumeChange(song);
}

function addEmptySetlistAttribute() {
    document.querySelectorAll('.accordion').forEach(acc => {
        acc.setAttribute("setlistposition", "");
        acc.setAttribute("setlistblock", "");
    });
}