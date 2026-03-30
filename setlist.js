const JSON_URL = 'https://api.jsonstorage.net/v1/json/ef4d2848-a5ef-434e-b514-f75122723e86/45cc7c86-37f4-42d8-91c3-68567347ba29'; // ← вставь свой URL
const API_KEY = 'd9568e85-92da-4e7c-ab00-ec475625f04e';
let setlistData = {};
let currentHash = null;

// --- загрузка данных ---
async function setlistLoadData() {
    try {
        const res = await fetch(JSON_URL);
        if (!res.ok) throw new Error(res.status);
        setlistData = await res.json();
    } catch (e) {
        console.warn('Setlist: не удалось загрузить данные', e);
        setlistData = {};
    }
}

// --- сохранение ---
async function setlistSaveData() {
    try {
        await fetch(JSON_URL + "?apiKey=" + API_KEY, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(setlistData)
        });
    } catch (e) {
        console.warn('Setlist: не удалось сохранить данные', e);
    }

}

// --- открытие/закрытие модалки ---
function setlistOpen(hash) {
    currentHash = hash;
    const modal = document.getElementById('setlist-modal');
    modal.style.display = 'flex';
    const data = setlistData[hash] || {};
    document.getElementById('setlist-block').value = data.block || '';
    document.getElementById('setlist-song').value = data.song || '';
    logBanksByBand();
}

function setlistClose() {
    document.getElementById('setlist-modal').style.display = 'none';
    currentHash = null;
}

function setlistFillLastBlockNextSong() {
    const band = document.getElementsByClassName('band-select')[0]?.value;
    if (!band) return;
    const list = document.querySelector(`.songlist[band="${band}"]`);
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

    document.getElementById('setlist-block').value = nextBlock;
    document.getElementById('setlist-song').value = nextSong;
}

// --- обработчики ---
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('setlist-close').onclick = setlistClose;
    window.addEventListener('click', e => {
        if (e.target.id === 'setlist-modal') setlistClose();
    });

    document.getElementById('setlist-save').onclick = async () => {
        const block = document.getElementById('setlist-block').value;
        const song = document.getElementById('setlist-song').value;
        if ((block > 0 && song > 0) || (block == 0 && song == 0)) {
            setlistData[currentHash] = { block, song };
            await setlistSaveData();
            setlistApplyData();
        }
        else {
            alert("Некорректный ввод данных");
        }
        setlistClose();
    };

    document.getElementById('setlist-clear').onclick = async () => {
        document.getElementById('setlist-block').value = "";
        document.getElementById('setlist-song').value = "";
    };

    document.getElementById('setlist-autofill-next').onclick = () => {
        setlistFillLastBlockNextSong();
    };

});
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
        reorderSongList(document.getElementsByClassName('band-select')[0].value);
    }, 100);
}


// --- инициализация ---
window.addEventListener('DOMContentLoaded', async () => {
    // Один делегированный обработчик на всё тело страницы
    if (!window._setlistHandlerBound) {
        window._setlistHandlerBound = true;
        document.body.addEventListener('click', e => {
            const btn = e.target.closest('.accordion .setlist-btn');
            if (!btn) return; // клик не по кнопке
            e.stopPropagation();
            const accordion = btn.closest('.accordion');
            console.log(556677);
            
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
        const selector = `.accordion[setlistblock="${block}"]`;
        const elements = document.querySelectorAll(`[band="${band}"] ${selector}`);

        const hashes = Array.from(
            document.querySelectorAll(`[band="${band}"] .accordion[setlistblock="${block}"]`)
        ).map(el => el.getAttribute('hash'));

        hashes.forEach(key => {
            delete setlistData[key];
        });
        await setlistSaveData();
        setlistApplyData();
    }
}

function logBanksByBand() {
    const band = document.getElementsByClassName('band-select')[0]?.value;
    if (!band) return;

    const el = document.querySelector(`.songlist[band="${band}"]`);
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