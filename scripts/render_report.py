#!/usr/bin/env python3
"""Render a run's findings to the published HTML.

    python3 scripts/render_report.py reports/runs/<run>.md   # -> build/<basename>.html
    python3 scripts/render_report.py --all

The summary table, the article list, the counts and the spelled-out Russian
numeral all come from `run["items"]` -- one ordered list, walked more than once.
That is the point: the two bugs this replaces were a substitution (a find-and-
replace overwrote a published High with a duplicate of another finding, and every
count-based check passed for over an hour) and an ordering drift (the table was
severity-ordered while the articles were not, ten of fifteen positions disagreeing
with seven checks green). Neither is detectable by counting, and neither can occur
when both views are generated from the same list.

Markdown support is deliberately narrow -- paragraphs, ordered and unordered
lists, fenced code, inline `code` -- because a finding uses nothing else, and
because uniform markup across reports is the property the old hand-written HTML
kept failing to hold. Anything else in a source file is a validation error in
verify_report.py rather than a surprise in the output.
"""
import html
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from findings import (FENCE, REPO, SECTIONS, SourceError,  # noqa: E402
                      load_run, load_runs, publish_blockers)

CSS = os.path.join(REPO, "reports", "tools", "report.css")
BUILD = os.path.join(REPO, "build")

# 1..30, for the lede's spelled-out count. The report says "Тридцать находок" and
# a checker compares it to the article count; generating both from one number
# retires that whole class of disagreement.
NUM = ["", "Одна", "Две", "Три", "Четыре", "Пять", "Шесть", "Семь", "Восемь",
       "Девять", "Десять", "Одиннадцать", "Двенадцать", "Тринадцать",
       "Четырнадцать", "Пятнадцать", "Шестнадцать", "Семнадцать", "Восемнадцать",
       "Девятнадцать", "Двадцать", "Двадцать одна", "Двадцать две", "Двадцать три",
       "Двадцать четыре", "Двадцать пять", "Двадцать шесть", "Двадцать семь",
       "Двадцать восемь", "Двадцать девять", "Тридцать"]


def esc(t):
    """Escape for element text. Quotes are left alone so prose reads naturally."""
    return html.escape(t, quote=False)


def att(t):
    """Escape for an attribute value — quotes included.

    esc() deliberately keeps quotes, which is right inside element text and
    wrong inside an attribute: a double quote in an account name or a snippet
    filename would close data-accounts early and swallow the rest of the tag.
    """
    return html.escape(t, quote=True)


def inline(t):
    """Escape once, wrapping backticked spans in <code>.

    Escaping the whole string and then escaping again inside the backtick
    substitution double-escapes: `<ch>` renders as the literal text &lt;ch&gt;.
    Splitting on the backticks first means every character is escaped exactly once.
    """
    out = []
    for i, part in enumerate(t.split("`")):
        out.append("<code>%s</code>" % esc(part) if i % 2 else esc(part))
    return "".join(out)


def md(section, pre_class=""):
    """The narrow Markdown subset a finding uses -> HTML."""
    out, i = [], 0
    for m in FENCE.finditer(section):
        out.append(_blocks(section[i:m.start()]))
        body = esc(m.group(1).rstrip("\n"))
        out.append("<pre%s>%s</pre>" % (pre_class, body))
        i = m.end()
    out.append(_blocks(section[i:]))
    return "\n".join(x for x in out if x)


def _blocks(text):
    out, buf, mode = [], [], None

    def flush():
        if not buf:
            return
        if mode == "ol":
            out.append("<ol>\n%s\n</ol>" % "\n".join("  <li>%s</li>" % inline(x) for x in buf))
        elif mode == "ul":
            out.append("<ul>\n%s\n</ul>" % "\n".join("  <li>%s</li>" % inline(x) for x in buf))
        else:
            out.append("<p>%s</p>" % inline(" ".join(buf)))
        buf.clear()

    for line in text.splitlines():
        s = line.strip()
        m_ol = re.match(r"\d+[.)]\s+(.*)$", s)
        m_ul = re.match(r"[-*]\s+(.*)$", s)
        if m_ol:
            if mode != "ol":
                flush(); mode = "ol"
            buf.append(m_ol.group(1))
        elif m_ul:
            if mode != "ul":
                flush(); mode = "ul"
            buf.append(m_ul.group(1))
        elif not s:
            flush(); mode = None
        elif mode in ("ol", "ul") and line[:1] in " \t":
            buf[-1] += " " + s              # continuation of the current item
        else:
            if mode in ("ol", "ul"):
                flush(); mode = None
            buf.append(s)
    flush()
    return "\n".join(out)


def chips(f):
    return ('<div class="chips"><span class="chip sev">%s</span>'
            '<span class="chip area">%s</span></div>' % (esc(f["sev"]), esc(f["side"])))


def article(f):
    parts = ["  <article>", "    " + chips(f),
             "    <h2>%s</h2>" % inline(f["titleTagged"])]
    if f["repro"]:
        parts.append(
            '\n    <div class="block repro" data-lane="%s" data-accounts="%s" data-snippet="%s">\n'
            "      <h3>Воспроизведение</h3>\n"
            "      <p><code>./d %s:%s snip/%s</code></p>\n    </div>"
            % (att(f["lane"]), att(",".join(f["accounts"])), att(f["snippet"]),
               esc(f["lane"].lower()), esc(f["accounts"][0] if f["accounts"] else "alice"),
               esc(f["snippet"])))
    for name in SECTIONS:
        body = f["sections"].get(name)
        if not body:
            continue
        cls = "block expect" if name == "Ожидаемый результат" else "block"
        parts.append('\n    <div class="%s">\n      <h3>%s</h3>\n%s\n    </div>'
                     % (cls, esc(name), _indent(md(body), 6)))
    parts.append("  </article>")
    return "\n".join(parts)


def _indent(t, n):
    """Indent for readability, but never inside <pre> — whitespace is content there.

    A measurement block is pasted from a real run and its alignment carries
    meaning; indenting it to make the HTML source tidy silently rewrites the
    evidence.
    """
    pad, out, in_pre = " " * n, [], False
    for l in t.splitlines():
        if in_pre:
            out.append(l)
            if "</pre>" in l:
                in_pre = False
            continue
        out.append(pad + l if l.strip() else l)
        if "<pre" in l and "</pre>" not in l:
            in_pre = True
    return "\n".join(out)


def summary_row(f):
    return ('      <tr><td>%s</td>\n'
            '          <td><span class="chip sev">%s</span></td>'
            '<td><span class="chip area">%s</span></td></tr>'
            % (inline(f["title"]), esc(f["sev"]), esc(f["side"])))


def render(run):
    items = run["items"]
    n = len(items)
    spelled = NUM[n] if n < len(NUM) else str(n)
    css = open(CSS, encoding="utf-8").read().rstrip()
    lede = "\n".join('    <p class="lede">%s</p>' % inline(p) for p in run["lede"])
    extra = ""
    for name, body in run["sections"].items():
        extra += '\n  <div class="block">\n    <h3>%s</h3>\n%s\n  </div>' % (
            esc(name), _indent(md(body), 4))
    return """<title>%(heading)s</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">

<style>
%(css)s
</style>

<div class="wrap">
  <header>
    <div class="eyebrow">QA · %(laneName)s · %(date)s</div>
    <h1>%(heading)s</h1>
%(lede)s
    <p class="lede">%(spelled)s %(word)s. Сборка <code>%(build)s</code>.</p>
  </header>

  <table class="summary">
    <thead><tr><th style="width:52%%">Находка</th><th>Важность</th><th>Область</th></tr></thead>
    <tbody>
%(rows)s
    </tbody>
  </table>
%(extra)s

%(articles)s

  <footer>Все находки относятся к веб-клиенту и проверены на сборке staging
    <code>%(build)s</code>; ссылки на файлы и строки даны по коммиту
    <code>%(sha)s</code>, которым собрана эта сборка.</footer>
</div>
""" % {
        "heading": esc(run["heading"]), "css": css, "date": esc(run["date"]),
        "laneName": esc(run["laneName"]), "lede": lede, "spelled": spelled,
        "word": _plural(n), "build": esc(run["build"]), "sha": esc(run["sha"]),
        "rows": "\n".join(summary_row(f) for f in items),
        "articles": "\n\n".join(article(f) for f in items),
        "extra": extra,
    }


def _plural(n):
    if n % 10 == 1 and n % 100 != 11:
        return "находка"
    if n % 10 in (2, 3, 4) and n % 100 not in (12, 13, 14):
        return "находки"
    return "находок"


def main(argv):
    from findings import lane_name
    runs = load_runs() if "--all" in argv else [load_run(os.path.abspath(a))
                                                for a in argv if not a.startswith("-")]
    if not runs:
        print(__doc__)
        return 2
    # Refuse rather than publish short. load_run drops an unpublished finding
    # instead of raising, so without this the renderer was the one consumer that
    # never asked -- it wrote a run missing a finding, printed a count that
    # agreed with the reduced set, and exited 0.
    #
    # Per run, not per invocation: refusing the whole batch meant one session
    # withdrawing a finding stopped every other sector's report from rendering.
    force = "--force" in argv
    refused = 0
    os.makedirs(BUILD, exist_ok=True)
    for run in runs:
        why = publish_blockers(run)
        if why and not force:
            for w in why:
                print("  REFUSING %-38s %s" % (os.path.basename(run["path"]), w))
            refused += 1
            continue
        run["laneName"] = lane_name(run)
        out = os.path.join(BUILD, run["basename"] + ".html")
        with open(out, "w", encoding="utf-8") as fh:
            fh.write(render(run))
        print("  %-52s %d findings, %d bytes"
              % (os.path.relpath(out, REPO), len(run["items"]),
                 os.path.getsize(out)))
    if refused:
        print("\n  %d run(s) refused. Fix the `findings:` list, or re-render that "
              "run with --force to publish what remains." % refused)
    return 1 if refused else 0


if __name__ == "__main__":
    try:
        sys.exit(main(sys.argv[1:]))
    except SourceError as e:
        print("  %s" % e)
        sys.exit(1)
