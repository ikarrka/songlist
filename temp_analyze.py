import re
from pathlib import Path

for f in Path(r"D:\source\songlist\songs").glob("*.html"):
    text = f.read_text(encoding="utf-8")
    for m in re.finditer(
        r'<div class="accordion"([^>]*)>\s*<button class="toggle-button">(.*?)</button>',
        text,
        re.S,
    ):
        attrs, btn = m.group(1), m.group(2)
        if "<voice" not in btn and "<bank" not in btn:
            continue
        av = re.search(r'\bvoice="([^"]*)"', attrs)
        ab = re.search(r'\bbank="([^"]*)"', attrs)
        ap = re.search(r'\bpad="([^"]*)"', attrs)
        artist = re.search(r'\bartist="([^"]*)"', attrs)
        song = re.search(r'\bsong="([^"]*)"', attrs)
        bv = re.search(r"<voice>(.*?)</voice>", btn, re.S)
        bb = re.search(r"<bank>(.*?)</bank>", btn, re.S)

        def strip(t):
            return re.sub(r"<[^>]+>", "", t or "").strip()

        print(f"{f.name}: song={song.group(1) if song else '?'} | artist={artist.group(1) if artist else '?'}")
        print(f"  attr voice={av.group(1) if av else None!r} bank={ab.group(1) if ab else None!r} pad={ap.group(1) if ap else None!r}")
        print(f"  btn  voice={strip(bv.group(1)) if bv else None!r} bank={strip(bb.group(1)) if bb else None!r}")
        print()
