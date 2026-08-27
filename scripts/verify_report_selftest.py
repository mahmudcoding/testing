#!/usr/bin/env python3
"""Negative-control every step of verify_report.py.

A checker that cannot fail is worse than no checker: it reports "ALL CHECKS PASS"
on a broken report and buys false confidence. This mutates a real report once per
step, asserts the mutation actually changed the file, and requires the checker to
exit 1 each time.

    python3 scripts/verify_report_selftest.py reports/<some-report>.html

Exit 0 only if every step caught its own mutation.
"""
import io, re, subprocess, sys, tempfile, os

SRC = sys.argv[1] if len(sys.argv) > 1 else 'reports/aloqa-workspace-qa-2026-08-26-E-2.html'
CHECKER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'verify_report.py')
s0 = io.open(SRC, encoding='utf-8').read()
arts = re.findall(r'<article.*?</article>', s0, re.S)
rows = re.findall(r'<tr><td>\[.*?</tr>', s0, re.S)
if len(arts) < 12 or len(rows) != len(arts):
    sys.exit(f'{SRC}: need a well-formed report to mutate (articles={len(arts)}, rows={len(rows)})')

def m_dup_title(s):
    t = re.findall(r'<h2>(.*?)</h2>', s, re.S)
    return s.replace('<h2>' + t[5] + '</h2>', '<h2>' + t[4] + '</h2>', 1)
def m_row_order(s):
    return s.replace(rows[2], '@@X@@', 1).replace(rows[3], rows[2], 1).replace('@@X@@', rows[3], 1)
def m_drop_article(s):
    return s.replace(arts[7], '', 1)
def m_thin_section(s):
    a = arts[9]
    mm = re.search(r'(<h3>Ожидаемый результат</h3>\s*<p>)(.*?)(</p>)', a, re.S)
    return s.replace(a, a[:mm.end(1)] + 'Надо починить.' + a[mm.start(3):], 1)
def m_bad_severity(s):
    a = arts[3]
    return s.replace(a, a.replace('chip sev">Medium', 'chip sev">Trivial', 1), 1)
def m_row_chip(s):
    r = rows[3]
    return s.replace(r, r.replace('chip sev">Medium', 'chip sev">High', 1), 1)
def m_prose_bloat(s):
    a = arts[-2]
    mm = re.search(r'(<h3>Проблема</h3>\s*<p>)(.*?)(</p>)', a, re.S)
    return s.replace(a, a[:mm.end(2)] + (' слово' * 200) + a[mm.end(2):], 1)
def m_leak(s):
    return s.replace('&lt;archivedChannelId&gt;', 'C4QEGENERAL0001', 1)
def m_bare_citation(s):
    mm = re.search(r'(packages|apps)/[A-Za-z0-9_/\[\].-]*\.tsx?:[0-9]+', s)
    return s.replace(mm.group(0), mm.group(0).split('/')[-1], 1) if mm else s
def m_spelled_count(s):
    # compound forms first, or "Двадцать одна" is matched as bare "Двадцать" and the
    # replacement leaves " одна находка" behind — a mutation that does not mutate cleanly
    words = ['Двадцать одна', 'Двадцать две', 'Двадцать три', 'Двадцать четыре', 'Двадцать пять',
             'Двадцать шесть', 'Двадцать семь', 'Двадцать восемь', 'Двадцать девять', 'Тридцать',
             'Одиннадцать', 'Двенадцать', 'Тринадцать', 'Четырнадцать', 'Пятнадцать',
             'Шестнадцать', 'Семнадцать', 'Восемнадцать', 'Девятнадцать', 'Двадцать',
             'Одна', 'Две', 'Три', 'Четыре', 'Пять', 'Шесть', 'Семь', 'Восемь', 'Девять', 'Десять']
    mm = re.search(r'(' + '|'.join(words) + r')\s+наход', s)
    if not mm:
        return s
    repl = 'Три' if mm.group(1) != 'Три' else 'Пять'
    return s.replace(mm.group(1) + ' наход', repl + ' наход', 1)
def m_unbalanced(s):
    return s.replace('</article>', '', 1)

CASES = [
    ('1  duplicate title',        m_dup_title),
    ('1b/1c row order/text',      m_row_order),
    ('2  article dropped',        m_drop_article),
    ('2b thin section',           m_thin_section),
    ('3  unknown severity',       m_bad_severity),
    ('3b row chip disagrees',     m_row_chip),
    ('4  prose over budget',      m_prose_bloat),
    ('5  leaked fixture name',    m_leak),
    ('6  bare citation path',     m_bare_citation),
    ('6b wrong spelled count',    m_spelled_count),
    ('7  unbalanced tags',        m_unbalanced),
]

print(f'self-test against {SRC}\n')
print(f"{'mutation':<26}{'changed':<9}{'exit':<6}caught")
bad = 0
for name, fn in CASES:
    mutated = fn(s0)
    changed = mutated != s0          # a mutation that does not mutate proves nothing
    fd, path = tempfile.mkstemp(suffix='.html'); os.close(fd)
    io.open(path, 'w', encoding='utf-8').write(mutated)
    r = subprocess.run(['python3', CHECKER, path], capture_output=True, text=True)
    os.unlink(path)
    ok = changed and r.returncode == 1
    if not ok:
        bad += 1
    print(f'{name:<26}{str(changed):<9}{r.returncode:<6}{r.returncode == 1}'
          f'{"" if ok else "   <<<< PROBLEM"}')
print(f'\n{len(CASES) - bad}/{len(CASES)} steps provably catch their own failure')
sys.exit(1 if bad else 0)
