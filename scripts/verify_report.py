#!/usr/bin/env python3
"""Structural + content verification for a QA report. Titles first, then counts.

    python3 scripts/verify_report.py reports/<file>.html      exit 0 = all checks pass

Prints every finding title before any count, because a substitution that swaps one finding for a
copy of another leaves every count intact — that happened once and is why this exists.

WHAT IT ASSUMES ABOUT A REPORT
  - each finding is one <article>, its title in an <h2>
  - a summary table near the top, one <tr> per finding, the title in the first <td>
  - Russian section headings: Проблема / Как воспроизвести / Фактический результат /
    Ожидаемый результат, plus at least one <pre> measurement block per finding
  - severity chips "High" | "Medium" | "Low", area chips "backend" | "frontend"

TWO TABLE CONVENTIONS ARE SUPPORTED. Some reports repeat the "[FE-WEB][MODULE]" tag in the summary
row and add severity/area chips there; others carry the bare title and keep tags in the <h2> only.
The layout is detected and printed; checks that cannot apply SKIP WITH A STATED REASON rather than
failing, so a valid report in either convention exits 0.

Its companion, verify_report_selftest.py, mutates a report once per check and requires exit 1 each
time — asserting first that the mutation actually changed the file, because a mutation that
silently does nothing reads exactly like a working check.
"""
import io,re,sys
from collections import Counter
from html.parser import HTMLParser
p=sys.argv[1] if len(sys.argv)>1 else 'reports/aloqa-workspace-qa-2026-08-26-E-2.html'
s=io.open(p,encoding='utf-8').read()
fail=[]
# 1. TITLES FIRST — a substitution does not change a count
titles=[re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',m.group(1))).strip()
        for m in re.finditer(r'<h2>(.*?)</h2>', s, re.S)]
print('=== titles ===')
for i,t in enumerate(titles,1): print(f'{i:2}  {t[:76]}')
dupes=[t for t,c in Counter(titles).items() if c>1]
if dupes: fail.append(f'DUPLICATE TITLES: {dupes}')
# near-duplicates: same first 30 chars
pref=Counter(t[:30] for t in titles)
near=[k for k,c in pref.items() if c>1]
if near: fail.append(f'NEAR-DUPLICATE TITLE PREFIXES: {near}')
# --- summary-table rows, layout-agnostic -------------------------------------
# Two conventions exist in this repo: some reports repeat the "[FE-WEB][MODULE]" tag in the
# summary row, some carry the bare title and keep tags in the <h2> only. Parse the first <td>
# of every <tr> and let the comparisons below cope with either.
ROWS_HTML=[m.group(1) for m in re.finditer(r'<tr>\s*<td>(.*?)</td>', s, re.S)]
_strip=lambda x: re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',x)).strip()
ROWS=[_strip(h) for h in ROWS_HTML]
TAG_RE=re.compile(r'^(?:\[[^\]]+\])+\s*')
ROWS_TAGGED=[bool(TAG_RE.match(r)) for r in ROWS]
LAYOUT='tagged' if (ROWS and all(ROWS_TAGGED)) else ('untagged' if ROWS and not any(ROWS_TAGGED) else 'mixed')
print(f'summary-table layout: {LAYOUT} ({len(ROWS)} rows)')

# 1b. TABLE ROWS must correspond to ARTICLE TITLES, in order (identity, not count)
if LAYOUT=='untagged':
    print('\nrow/article tag correspondence: skipped (this report keeps tags in the h2 only)')
elif len(ROWS)==len(titles):
    for i,(r,a) in enumerate(zip(ROWS,titles),1):
        tr=r[:r.rfind(']')+1] if ']' in r else ''
        ta=_strip(a); ta=ta[:ta.rfind(']')+1] if ']' in ta else ''
        if tr!=ta:
            fail.append(f'ROW/ARTICLE TAG MISMATCH at {i}: row={tr} article={ta}')
    print('\nrow/article tag correspondence: checked')
else:
    print('\nrow/article tag correspondence: skipped (row count differs; see counts)')
# 1c. each table row's TEXT must equal its article's title (one canonical string per finding)
_norm=_strip
_rowtxt=ROWS
_ttl=[_norm(t) for t in titles]
def _same(title,row):
    return row==title or row==TAG_RE.sub('',title)
_bad=[(i+1,a,b) for i,(a,b) in enumerate(zip(_ttl,_rowtxt)) if not _same(a,b)]
if _bad:
    fail.append(f'TITLE/ROW TEXT MISMATCH at {[i for i,_,_ in _bad]}')
    print('title/row text: MISMATCH at', [i for i,_,_ in _bad])
else:
    print('title/row text: identical for all', len(_ttl))

# 2. counts
n=len(titles)
for label,cnt in [('articles',s.count('<article>')),('table rows',len(ROWS)),
                  ('Проблема',s.count('>Проблема<')),('Как воспроизвести',s.count('>Как воспроизвести<')),
                  ('Фактический результат',s.count('>Фактический результат<')),
                  ('Ожидаемый результат',s.count('>Ожидаемый результат<'))]:
    if cnt!=n: fail.append(f'{label}={cnt} != findings={n}')
print(f'\ncounts: findings={n}, all section counts match' if not fail else '')
# 2b. per-article content: every required section present AND non-empty, plus a measurement block
arts=re.findall(r'  <article>.*?</article>\n', s, re.S)
req=['Проблема','Как воспроизвести','Фактический результат','Ожидаемый результат','Проверка']
for i,a in enumerate(arts,1):
    miss=[r for r in req if f'>{r}<' not in a]
    if miss: fail.append(f'article {i}: missing {miss}')
    for r in req:
        m=re.search(r'<h3>'+r+r'</h3>(.*?)</div>', a, re.S)
        if m and len(re.sub(r'<[^>]+>',' ',m.group(1)).split())<6:
            fail.append(f'article {i}: section "{r}" is thin')
    if '<pre>' not in a: fail.append(f'article {i}: no measurement block')
print('per-article sections: checked')
# 3. severities — every article must carry exactly one, from the allowed set
ALLOWED={'High','Medium','Low'}
sev=Counter(re.findall(r'<article>\s*<div class="chips"><span class="chip sev">(\w+)', s))
_areas=Counter(re.findall(r'<article>\s*<div class="chips">.*?<span class="chip area">(\w+)</span>', s, re.S))
_bad=sorted(set(sev)-ALLOWED)
if _bad: fail.append(f'UNKNOWN SEVERITY {_bad}; allowed {sorted(ALLOWED)}')
if sum(sev.values())!=len(arts):
    fail.append(f'SEVERITY CHIPS {sum(sev.values())} != articles {len(arts)}')
if sum(_areas.values())!=len(arts):
    fail.append(f'AREA CHIPS {sum(_areas.values())} != articles {len(arts)}')
_badarea=sorted(set(_areas)-{'backend','frontend'})
if _badarea: fail.append(f'UNKNOWN AREA {_badarea}')
print('severities:', dict(sev), '| areas:', dict(_areas),
      '| unknown:', _bad or 'none')
# 3b. the summary table's own chips must match the article's, per position
_rowchips=re.findall(r'<tr>\s*<td>.*?<span class="chip sev">(\w+)</span></td>\s*<td><span class="chip area">(\w+)</span>', s, re.S)
_artchips=re.findall(r'<article>\s*<div class="chips"><span class="chip sev">(\w+)</span><span class="chip area">(\w+)</span>', s, re.S)
if len(_rowchips)==0:
    print('row/article chips: skipped (this report\'s table carries no chips)')
elif len(_rowchips)!=len(arts) or len(_artchips)!=len(arts):
    fail.append(f'CHIP PARSE: rows {len(_rowchips)}, articles {len(_artchips)}, expected {len(arts)}')
    print(f'row/article chips: PARSE MISMATCH rows={len(_rowchips)} arts={len(_artchips)}')
else:
    _dis=[(i+1,a,b) for i,(a,b) in enumerate(zip(_artchips,_rowchips)) if a!=b]
    if _dis:
        fail.append(f'ROW/ARTICLE CHIP MISMATCH at {[i for i,_,_ in _dis]}')
        print('row/article chips: MISMATCH at', [i for i,_,_ in _dis])
    else:
        print('row/article chips: agree for all', len(arts))

# 4. prose budget
parts=re.split(r'<h2>', s)[1:]
def w(h):
    h=re.sub(r'<pre>.*?</pre>','',h,flags=re.S); h=re.sub(r'<[^>]+>',' ',h); h=re.sub(r'&[a-z]+;',' ',h)
    return len([x for x in re.split(r'\s+',h) if x.strip()])
tots=[sum(w(m.group(1)) if (m:=re.search(r'<h3>'+k+r'</h3>(.*?)</div>', q, re.S)) else 0
      for k in ('Проблема','Фактический результат','Ожидаемый результат')) for q in parts]
over=[(i+1,t) for i,t in enumerate(tots) if t>180]
print('prose words:', tots)
if over: fail.append(f'OVER 180 WORDS: {over}')
# 5. leaks
pats=[r'qa\.[a-z.]*@aloqa\.test',r'W4Q[A-Z0-9]',r'U4Q[A-Z0-9]',r'C4Q[A-Z0-9]',r'C4O[A-Z0-9]',
      r'S4O[A-Z0-9]',r'F4O[A-Z0-9]',r'926[0-9]',r'QA (Alice|Bob|Admin|Carol|Owner|Dave|Guest)',
      r'qa-(general|private|empty|archived)',r'zqrx|e2video|e2audio|e2arch|no-such-channel|NOTAREALTOKEN',
      r'e-search-control|e-arch-probe|zx9probe|probe-pw|qa-e-note',
      r'airion-cargo|aloqa\.test']
leaks={pt:len(re.findall(pt,s)) for pt in pats if re.findall(pt,s)}
if leaks: fail.append(f'LEAKS: {leaks}')
print('leaks:', leaks or 'none')
# 6. citations
cits=sorted(set(re.findall(r'[A-Za-z0-9_/\[\].-]*\.(?:tsx?|json|go|py)+:[0-9-]+', s)))
bare=[c for c in cits if not (c.startswith('apps/') or c.startswith('packages/'))]
if bare: fail.append(f'BARE CITATION PATHS: {bare}')
print(f'citations: {len(cits)}, bare: {bare or "none"}')
# 6b. every spelled-out finding count in the prose must match the article count
WORDS={1:'Одна',2:'Две',3:'Три',4:'Четыре',5:'Пять',6:'Шесть',7:'Семь',8:'Восемь',9:'Девять',
 10:'Десять',11:'Одиннадцать',12:'Двенадцать',13:'Тринадцать',14:'Четырнадцать',15:'Пятнадцать',
 16:'Шестнадцать',17:'Семнадцать',18:'Восемнадцать',19:'Девятнадцать',20:'Двадцать',
 21:'Двадцать одна',22:'Двадцать две',23:'Двадцать три',24:'Двадцать четыре',25:'Двадцать пять',
 26:'Двадцать шесть',27:'Двадцать семь',28:'Двадцать восемь',29:'Двадцать девять',30:'Тридцать'}
want=WORDS.get(len(arts))
# stem is "наход" — "находок"/"находки"/"находка" all continue past it
_alts=sorted(set(WORDS.values()), key=len, reverse=True)
claims=re.findall(r'(' + '|'.join(_alts) + r')\s+наход', s)
if not claims:
    fail.append('PREAMBLE: no spelled-out finding count found')
    print('spelled counts: NONE FOUND')
elif want is None:
    print(f'spelled counts: {claims} (no word for {len(arts)}, not checked)')
else:
    bad=[x for x in claims if x!=want]
    if bad: fail.append(f'SPELLED COUNT {bad} != {want} ({len(arts)} findings)')
    print(f'spelled counts: {len(claims)} found, {"all match" if not bad else "MISMATCH "+str(bad)} ({want})')

# 7. html
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
class V(HTMLParser):
    def __init__(self): super().__init__(convert_charrefs=True); self.st=[]; self.err=[]
    def handle_starttag(self,t,a):
        if t not in VOID: self.st.append(t)
    def handle_endtag(self,t):
        if t in VOID: return
        if self.st and self.st[-1]==t: self.st.pop()
        else: self.err.append(t)
v=V(); v.feed(s)
if v.err or v.st: fail.append(f'UNBALANCED TAGS: {len(v.err)+len(v.st)}')
print('unbalanced tags:', len(v.err)+len(v.st))
print('\n' + ('ALL CHECKS PASS' if not fail else 'FAILURES:\n  ' + '\n  '.join(fail)))
sys.exit(1 if fail else 0)
