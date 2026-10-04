(async function bootstrapSonglist() {
    const loader = document.getElementById('pageLoader');

    if (window.location.protocol === 'file:') {
        if (loader) {
            loader.textContent = 'Откройте сайт через http://127.0.0.1:4173 — запустите start-server.cmd';
        }
        document.body.style.visibility = 'visible';
        return;
    }

    try {
        const manifestResponse = await fetch('songs/manifest.json');
        if (!manifestResponse.ok) {
            throw new Error(`Cannot load song manifest: ${manifestResponse.status}`);
        }

        const files = await manifestResponse.json();
        const fragments = (await Promise.all(files.map(async file => {
            try {
                const response = await fetch(`songs/${file}`);
                if (!response.ok) {
                    console.warn(`Cannot load ${file}: ${response.status}`);
                    return '';
                }
                return response.text();
            } catch (error) {
                console.warn(`Cannot load ${file}:`, error);
                return '';
            }
        }))).filter(Boolean);

        if (fragments.length === 0) {
            throw new Error('Cannot load any song file');
        }

        document.getElementById('songlists').innerHTML = fragments.join('\n');

        initMusic();
        initMidi();
        await initSetlist();
    } catch (error) {
        console.error('Song list startup failed:', error);
        if (loader) {
            loader.textContent = 'Не удалось загрузить список песен. Обновите страницу.';
        }
        document.body.style.visibility = 'visible';
    }
})();
