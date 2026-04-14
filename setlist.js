const JSON_URL = 'https://api.jsonstorage.net/v1/json/ef4d2848-a5ef-434e-b514-f75122723e86/45cc7c86-37f4-42d8-91c3-68567347ba29'; // ← вставь свой URL
const API_KEY = 'd9568e85-92da-4e7c-ab00-ec475625f04e';
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

    setTimeout(function () {
        const band = getSetlistSelectedBand();
        if (band) reorderSongList(band);
    }, 100);
}


// --- инициализация ---
window.addEventListener('DOMContentLoaded', async () => {
    const closeEl = document.getElementById('setlist-close');
    if (closeEl) closeEl.onclick = setlistClose;
    window.addEventListener('click', e => {
        if (e.target.id === 'setlist-modal') setlistClose();
    });

    const saveEl = document.getElementById('setlist-save');
    if (saveEl) saveEl.onclick = async () => {
        if (currentHash == null || currentHash === '') {
            alert('Внутренняя ошибка: не выбрана песня.');
            setlistClose();
            return;
        }
        const blockEl = document.getElementById('setlist-block');
        const songEl = document.getElementById('setlist-song');
        if (!blockEl || !songEl) return;
        const block = normalizeSetlistValue(blockEl.value);
        const song = normalizeSetlistValue(songEl.value);
        if ((block > 0 && song > 0) || (block === 0 && song === 0)) {
            setlistData[currentHash] = { block, song };
            const saved = await setlistSaveData();
            if (saved) {
                setlistApplyData();
            }
        }
        else {
            alert("Некорректный ввод данных");
        }
        setlistClose();
    };

    const clearEl = document.getElementById('setlist-clear');
    if (clearEl) clearEl.onclick = async () => {
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
        document.body.addEventListener('click', e => {
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
});

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