const fs = require('fs');
const path = require('path');
const dir = String.raw`D:\source\songlist\songs`;
for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.html'))) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  const re = /<div class="accordion"([^>]*)>\s*<button class="toggle-button">(.*?)<\/button>/gs;
  let m;
  while ((m = re.exec(text))) {
    const attrs = m[1], btn = m[2];
    if (!btn.includes('<voice') && !btn.includes('<bank')) continue;
    const av = attrs.match(/\bvoice="([^"]*)"/);
    const ab = attrs.match(/\bbank="([^"]*)"/);
    const ap = attrs.match(/\bpad="([^"]*)"/);
    const artist = attrs.match(/\bartist="([^"]*)"/);
    const song = attrs.match(/\bsong="([^"]*)"/);
    const bv = btn.match(/<voice>(.*?)<\/voice>/s);
    const bb = btn.match(/<bank>(.*?)<\/bank>/s);
    const strip = t => (t || '').replace(/<[^>]+>/g, '').trim();
    console.log(`${f}: song=${song?song[1]:'?'} | artist=${artist?artist[1]:'?'}`);
    console.log(`  attr voice=${av?av[1]:null} bank=${ab?ab[1]:null} pad=${ap?ap[1]:null}`);
    console.log(`  btn  voice=${bv?strip(bv[1]):null} bank=${bb?strip(bb[1]):null}`);
    console.log();
  }
}
