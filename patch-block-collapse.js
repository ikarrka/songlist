const fs = require('fs');
const path = 'music.js';
let s = fs.readFileSync(path, 'utf8');

const startMarker = "        if (lastBlock !== block) {\r\n            const header = document.createElement('h2');\r\n            header.className = 'reordered';\r\n            header.textContent = `Block ${block}`;\r\n";
const endMarker = "            header.appendChild(removeBtn);\r\n            lastBlock = block;\r\n        } else {\r\n            item.style.marginTop = '';\r\n        }\r\n\r\n        container.appendChild(item);";

const start = s.indexOf(startMarker);
if (start < 0) {
  console.error('start marker not found');
  process.exit(1);
}
const end = s.indexOf(endMarker, start);
if (end < 0) {
  console.error('end marker not found');
  process.exit(1);
}
const endPos = end + endMarker.length;

const neu = [
'        if (lastBlock !== block) {',
"            const header = document.createElement('h2');",
"            header.className = 'reordered block-header';",
"            header.setAttribute('data-band', band);",
"            header.dataset.block = String(block);",
'',
"            const collapseBtn = document.createElement('button');",
"            collapseBtn.type = 'button';",
"            collapseBtn.className = 'block-collapse-btn';",
"            collapseBtn.setAttribute('aria-expanded', 'true');",
"            collapseBtn.setAttribute('aria-label', 'Свернуть блок');",
'',
"            const title = document.createElement('span');",
"            title.className = 'block-header-title';",
'            title.textContent = `Block ${block}`;',
'',
"            const removeBtn = document.createElement('span');",
"            removeBtn.classList.add('block-remove-btn');",
'            removeBtn.dataset.block = block;',
'            removeBtn.addEventListener(\'click\', function (e) {',
'                e.stopPropagation();',
'                deleteBlockSongs(band, block);',
'            });',
'',
'            collapseBtn.addEventListener(\'click\', function (e) {',
'                e.stopPropagation();',
"                const collapsed = header.classList.toggle('is-collapsed');",
"                collapseBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');",
"                collapseBtn.setAttribute('aria-label', collapsed ? 'Развернуть блок' : 'Свернуть блок');",
"                container.querySelectorAll('.accordion').forEach(acc => {",
"                    const accBlock = parseInt(acc.getAttribute('setlistblock')?.trim() ?? '', 10);",
'                    const normalized = (isNaN(accBlock) || accBlock === 0) ? 1 : accBlock;',
'                    if (normalized === block) {',
"                        acc.classList.toggle('block-collapsed-hide', collapsed);",
'                    }',
'                });',
'            });',
'',
'            header.appendChild(collapseBtn);',
'            header.appendChild(title);',
'            header.appendChild(removeBtn);',
'            container.appendChild(header);',
'            lastBlock = block;',
'        }',
'',
"        item.style.marginTop = '';",
'        container.appendChild(item)'
].join('\r\n');

s = s.slice(0, start) + neu + s.slice(endPos);
fs.writeFileSync(path, s, 'utf8');
console.log('music.js patched OK');
