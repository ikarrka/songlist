const JSON_URL = 'https://api.jsonstorage.net/v1/json/ef4d2848-a5ef-434e-b514-f75122723e86/45cc7c86-37f4-42d8-91c3-68567347ba29'; // ← вставь свой URL
const API_KEY = 'd9568e85-92da-4e7c-ab00-ec475625f04e';
const REGISTRATIONS_JSON_URL = 'https://api.jsonstorage.net/v1/json/ef4d2848-a5ef-434e-b514-f75122723e86/670c01cc-2209-408f-8086-5fd3fe9aa0bc';
let registrationsData = [];

let setlistData = {};
let currentHash = null;
let setlistLoaderCounter = 0;

function getSetlistSelectedBand() {
    return document.querySelector('.band-select')?.value || '';
}

function getSonglistElForBand(band) {
    return band ? document.querySelector(`.songlist[band="${band}"]`) : null;
}

function normalizeSetlistValue(value) {
    const num = parseInt(value, 10);
    return Number.isFinite(num) ? num : NaN;
}

function showSetlistLoader(text) {
    const loader = document.getElementById('setlistLoader');
    if (!loader) return;
    const textNode = loader.querySelector('.setlist-loader-text');
    if (textNode && text) textNode.textContent = text;
    setlistLoaderCounter += 1;
    loader.hidden = false;
}

function hideSetlistLoader() {
    const loader = document.getElementById('setlistLoader');
    if (!loader) return;
    setlistLoaderCounter = Math.max(0, setlistLoaderCounter - 1);
    if (setlistLoaderCounter === 0) {
        loader.hidden = true;
    }
}

// --- загрузка данных ---
async function setlistLoadData() {
    showSetlistLoader('Загрузка данных...');
    try {
        const res = await fetch(JSON_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(res.status);
        setlistData = await res.json();
    } catch (e) {
        console.warn('Setlist: не удалось загрузить данные', e);
        setlistData = {};
    } finally {
        hideSetlistLoader();
    }
}

// --- сохранение ---
async function setlistSaveData() {
    showSetlistLoader('Сохранение данных...');
    try {
        const res = await fetch(JSON_URL + "?apiKey=" + API_KEY, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(setlistData)
        });
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
    } catch (e) {
        console.warn('Setlist: не удалось сохранить данные', e);
        alert('Не удалось сохранить setlist. Проверьте подключение и попробуйте снова.');
        return false;
    } finally {
        hideSetlistLoader();
    }
    return true;
}

// --- открытие/закрытие модалки ---
function setlistOpen(hash) {
    currentHash = hash;
    const modal = document.getElementById('setlist-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    const data = setlistData[hash] || {};
    const blockInput = document.getElementById('setlist-block');
    const songInput = document.getElementById('setlist-song');
    if (blockInput) blockInput.value = data.block || '';
    if (songInput) songInput.value = data.song || '';
    logBanksByBand();
}

function setlistClose() {
    const modal = document.getElementById('setlist-modal');
    if (modal) modal.style.display = 'none';
    currentHash = null;
}

function closeAccordionByHash(hash) {
    if (!hash) return;
    const accordion = document.querySelector(`.accordion[hash="${hash}"]`);
    if (accordion) {
        accordion.classList.remove('active');
    }
}

function setlistFillLastBlockNextSong() {
    const band = getSetlistSelectedBand();
    if (!band) return;
    const list = getSonglistElForBand(band);
    if (!list) return;

    const hashes = Array.from(list.querySelectorAll('.accordion')).map(el => el.getAttribute('hash'));
    let maxBlock = 0;
    const entries = [];

    for (const hash of hashes) {
        const data = setlistData[hash];
        if (!data) continue;
        const block = parseInt(data.block, 10);
        const song = parseInt(data.song, 10);
        if (block > 0 && song > 0) {
            entries.push({ block, song });
            if (block > maxBlock) maxBlock = block;
        }
    }

    let nextBlock = 1;
    let nextSong = 1;

    if (entries.length > 0) {
        nextBlock = maxBlock;
        const songsInLast = entries.filter(e => e.block === maxBlock).map(e => e.song);
        nextSong = Math.max(...songsInLast) + 1;
    }

    const blockInput = document.getElementById('setlist-block');
    const songInput = document.getElementById('setlist-song');
    if (blockInput) blockInput.value = nextBlock;
    if (songInput) songInput.value = nextSong;
}

// --- применить данные к DOM ---
function setlistApplyData() {
    document.querySelectorAll('.accordion').forEach(acc => {
        const hash = acc.getAttribute('hash');

        // Сначала очищаем
        acc.removeAttribute('setlistblock');
        acc.removeAttribute('setlistposition');

        // Потом применяем если есть данные
        if (setlistData[hash]) {
            acc.setAttribute('setlistblock', setlistData[hash].block);
            acc.setAttribute('setlistposition', setlistData[hash].song);
        }
    });

    setlistUpdateHeaderActions();

    setTimeout(function () {
        const band = getSetlistSelectedBand();
        if (band) reorderSongList(band);
    }, 100);
}

function setlistUpdateHeaderActions() {
    const helperActive = localStorage.getItem('setListHelper') === 'true';

    document.querySelectorAll('.accordion').forEach(acc => {
        if (acc.id === 'checkListAccordion') return;
        const headerRow = acc.querySelector(':scope > .header-row');
        if (!headerRow) return;

        const blockValue = acc.getAttribute('setlistblock')?.trim() || '';
        const hasBlock = blockValue !== '' && parseInt(blockValue, 10) > 0;
        const plusBtn = headerRow.querySelector('.plus-button');
        const nextBtn = headerRow.querySelector('.next-button');
        const removeBtn = headerRow.querySelector('.remove-button');

        if (hasBlock) {
            if (plusBtn) plusBtn.style.display = 'none';
            if (!removeBtn) {
                const btn = document.createElement('button');
                btn.className = 'remove-button';
                btn.type = 'button';
                btn.textContent = '✖';
                headerRow.insertBefore(btn, nextBtn || null);
            } else {
                removeBtn.removeAttribute('style');
            }
        } else {
            if (removeBtn) {
                removeBtn.style.display = 'none';
            }
            if (!plusBtn && helperActive && !hasBlock) {
                const btn = document.createElement('button');
                btn.className = 'plus-button';
                btn.type = 'button';
                btn.textContent = '+';
                headerRow.insertBefore(btn, nextBtn || null);
            }
            if (plusBtn) {
                plusBtn.style.display = helperActive ? '' : 'none';
            }
            if (!nextBtn) {
                const btn = document.createElement('button');
                btn.className = 'next-button';
                btn.type = 'button';
                btn.innerHTML = '<span class="next-icon">⏭</span>';
                headerRow.appendChild(btn);
            }
        }
    });
}


// --- инициализация ---
async function initSetlist() {
    const closeEl = document.getElementById('setlist-close');
    if (closeEl) closeEl.onclick = setlistClose;
    window.addEventListener('click', e => {
        if (e.target.id === 'setlist-modal') setlistClose();
    });

    const saveEl = document.getElementById('setlist-save');
    if (saveEl) saveEl.onclick = setlistSaveCurrent;

    const songNumberInput = document.getElementById('setlist-song');
    const blockNumberInput = document.getElementById('setlist-block');

    function changeNumberInput(input, step, min, max) {
        if (!input) return;
        const lower = Number(input.min || min || 0);
        const upper = Number(input.max || max || 999);
        const current = Number.parseInt(input.value, 10);
        const next = (Number.isNaN(current) ? lower : current) + step;
        input.value = Math.max(lower, Math.min(upper, next));
    }

    function changeSongNumber(step) {
        changeNumberInput(songNumberInput, step, 0, 127);
    }

    function changeBlockNumber(step) {
        changeNumberInput(blockNumberInput, step, 0, 999);
    }

    document.querySelector('.setlist-number-decrement')?.addEventListener('click', () => changeSongNumber(-1));
    document.querySelector('.setlist-number-increment')?.addEventListener('click', () => changeSongNumber(1));
    document.querySelector('.setlist-block-decrement')?.addEventListener('click', () => changeBlockNumber(-1));
    document.querySelector('.setlist-block-increment')?.addEventListener('click', () => changeBlockNumber(1));

    async function setlistSaveCurrent() {
        if (currentHash == null || currentHash === '') {
            alert('Внутренняя ошибка: не выбрана песня.');
            setlistClose();
            return false;
        }
        const blockEl = document.getElementById('setlist-block');
        const songEl = document.getElementById('setlist-song');
        if (!blockEl || !songEl) return false;
        if (blockEl.value.trim() === '') blockEl.value = '0';
        if (songEl.value.trim() === '') songEl.value = '0';
        const blockValue = blockEl.value.trim();
        const songValue = songEl.value.trim();
        const block = normalizeSetlistValue(blockValue);
        const song = normalizeSetlistValue(songValue);
        const isClearRequest = (blockValue === '' && songValue === '') || block === 0 || song === 0;

        if (isClearRequest) {
            delete setlistData[currentHash];
            const saved = await setlistSaveData();
            if (saved) {
                setlistApplyData();
                closeAccordionByHash(currentHash);
            }
        }
        else if (block > 0 && song > 0) {
            setlistData[currentHash] = { block, song };
            const saved = await setlistSaveData();
            if (saved) {
                setlistApplyData();
                closeAccordionByHash(currentHash);
            }
        }
        else {
            alert("Некорректный ввод данных");
            return false;
        }
        setlistClose();
        return true;
    }

    const clearEl = document.getElementById('setlist-clear');
    if (clearEl) clearEl.onclick = () => {
        const blockEl = document.getElementById('setlist-block');
        const songEl = document.getElementById('setlist-song');
        if (blockEl) blockEl.value = "";
        if (songEl) songEl.value = "";
    };

    const autofillEl = document.getElementById('setlist-autofill-next');
    if (autofillEl) autofillEl.onclick = () => {
        setlistFillLastBlockNextSong();
    };

    if (!window._setlistHandlerBound) {
        window._setlistHandlerBound = true;
        document.body.addEventListener('click', async e => {
            const removeBtn = e.target.closest('.remove-button');
            if (removeBtn) {
                e.stopPropagation();
                const accordion = removeBtn.closest('.accordion');
                if (!accordion) return;
                const hash = accordion.getAttribute('hash');
                if (!hash) return;
                const artist = accordion.getAttribute('artist')?.trim() || '';
                const songTitle = accordion.getAttribute('song')?.trim() || '';
                const block = accordion.getAttribute('setlistblock')?.trim() || '';
                if (!confirm(`\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u043f\u0435\u0441\u043d\u044e \u0438\u0437 \u0431\u043b\u043e\u043a\u0430 N ${block}?\n\u0410\u0440\u0442\u0438\u0441\u0442: ${artist}\n\u041f\u0435\u0441\u043d\u044f: ${songTitle}`)) return;
                delete setlistData[hash];
                const saved = await setlistSaveData();
                if (saved) {
                    setlistApplyData();
                    closeAccordionByHash(hash);
                }
                return;
            }

            const plusBtn = e.target.closest('.plus-button');
            if (plusBtn) {
                e.stopPropagation();
                const accordion = plusBtn.closest('.accordion');
                if (!accordion) return;
                const hash = accordion.getAttribute('hash');
                if (!hash) return;
                setlistOpen(hash);
                setlistFillLastBlockNextSong();
                requestAnimationFrame(async () => {
                    await setlistSaveCurrent();
                });
                return;
            }

            const btn = e.target.closest('.accordion .setlist-btn');
            if (!btn) return;
            e.stopPropagation();
            const accordion = btn.closest('.accordion');
            if (accordion) {
                setlistOpen(accordion.getAttribute('hash'));
            }
        });
    }

    await setlistLoadData();
    setlistApplyData();
    cacheOriginalOrder();
}

async function deleteBlockSongs(band, block) {
    if (confirm(`Удалить блок ${block} из ${band}  ? Восстановить будет невозможно!`)) {
        const targetBlock = normalizeSetlistValue(block);
        const hashes = Array.from(
            document.querySelectorAll(`[band="${band}"] .accordion`)
        )
            .filter(el => normalizeSetlistValue(el.getAttribute('setlistblock')) === targetBlock)
            .map(el => el.getAttribute('hash'))
            .filter(Boolean);

        hashes.forEach(key => {
            delete setlistData[key];
        });
        const saved = await setlistSaveData();
        if (saved) {
            setlistApplyData();
        }
    }
}

function logBanksByBand() {
    const band = getSetlistSelectedBand();
    if (!band) return;

    const el = getSonglistElForBand(band);
    if (!el) return;

    const banks = [...new Set(
        [...el.querySelectorAll('span.bank')]
            .map(s => s.textContent.trim())
            .filter(Boolean)
    )].sort();

    const exists = new Set(banks);

    const missing = [];
    for (let a = 1; a <= 25; a++) {
        for (let b = 1; b <= 4; b++) {
            const v = `${a}-${b}`;
            if (!exists.has(v)) {
                missing.push(v);
            }
        }
    }

    console.log('existing:', banks);
    console.log('free:', missing);
}

function cacheOriginalOrder() {
    document.querySelectorAll('.songlist').forEach(list => {
        const band = list.getAttribute('band');
        originalOrder[band] = Array.from(
            list.querySelectorAll('.accordion')
        ).map(el => el.getAttribute('hash'));
    });
}


async function registrationsLoadData() {
    try {
        const res = await fetch(REGISTRATIONS_JSON_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        if (Array.isArray(data)) {
            registrationsData = data;
        } else if (data && Array.isArray(data.registrations)) {
            registrationsData = data.registrations;
        } else {
            registrationsData = [];
        }
    } catch (e) {
        console.warn('Registrations: не удалось загрузить данные', e);
        registrationsData = [];
    }
    return registrationsData;
}

async function registrationsSaveData(list) {
    const payload = Array.isArray(list) ? list : [];
    registrationsData = payload;
    const res = await fetch(REGISTRATIONS_JSON_URL + '?apiKey=' + API_KEY, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        throw new Error('HTTP ' + res.status);
    }
    return registrationsData;
}
