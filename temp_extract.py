import re, pathlib
text = pathlib.Path('index.html').read_text(encoding='utf-8', errors='ignore')
vals = re.findall(r'<span[^>]*class=["\']voice["\'][^>]*>(.*?)</span>', text, flags=re.I | re.S)
clean = []
for v in vals:
    v = re.sub(r'<[^>]+>', '', v)
    v = v.replace('&nbsp;', ' ').replace('\n', ' ').strip()
    if v:
        clean.append(v)
uniq = sorted(set(clean), key=lambda s: s.lower())
for v in uniq:
    print(v)
print('---')
print('count', len(uniq))
