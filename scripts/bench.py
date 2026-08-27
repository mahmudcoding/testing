#!/usr/bin/env python3
"""Reproducer — read a finding, press Reproduce, judge what you see.

    python3 scripts/bench.py            # then open http://127.0.0.1:8777

Runs on your machine so it can actually drive the rig. Reproduce launches the
browsers a finding needs, signs them in, runs the finding's repro snippet, and
stops with the defect on screen. You judge. Verdicts are written to
verification-<date>.md.

A finding is reproducible when its report carries a repro block:

    <div class="block repro" data-lane="E" data-accounts="alice,bob"
         data-snippet="e-calendar-stale.mjs">
      <h3>Воспроизведение</h3>
      <p><code>./d e:alice snip/e-calendar-stale.mjs</code></p>
    </div>

Findings without one still open positioned; the bench says what is left to do.
"""
import os, sys, re, json, html, subprocess, datetime, threading, webbrowser
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from verify_queue import parse, roles_needed, surface, preflight

PORT = int(os.environ.get("BENCH_PORT", "8777"))
SNIP = os.path.join(REPO, "scripts", "callrig", "snip")
REPORTS = [
    ("A", "Calls · inside",       "reports/aloqa-calls-inside-qa-2026-08-26-A.html"),
    ("B", "Calls · around",       "reports/aloqa-calls-around-qa-2026-08-26-B.html"),
    ("C", "Chat",                 "reports/aloqa-chat-qa-2026-08-26-C-2.html"),
    ("D", "Org · identity",       "reports/aloqa-org-qa-2026-08-26-D-2.html"),
    ("E", "Workspace · calendar", "reports/aloqa-workspace-qa-2026-08-26-E-2.html"),
]
ACCOUNT = {'company owner':'owner','workspace owner':'owner','company admin':'admin',
           'plain member':'bob','second account':'carol','second browser':'carol',
           'guest':'guest','member in no channel':'dave','outside the workspace':'outsider',
           'invitee':'bob','any signed-in account':'alice'}

def repro_blocks(path):
    """Pull the machine-readable repro block that follows each <h2>."""
    s = open(path, encoding="utf-8").read()
    out = []
    for part in re.split(r'(?=<h2)', s):
        if '<h2' not in part: continue
        m = re.search(r'<div class="block repro"([^>]*)>', part)
        if not m: out.append(None); continue
        attrs = dict(re.findall(r'data-([a-z]+)="([^"]*)"', m.group(1)))
        out.append(attrs or None)
    return out

_CACHE = {"items": None, "stamp": None}

def _stamp():
    out = []
    for _, _, rel in REPORTS:
        p = os.path.join(REPO, rel)
        out.append(os.path.getmtime(p) if os.path.exists(p) else 0)
    return tuple(out)

def load():
    """Parsed findings, cached until a report file changes on disk."""
    st = _stamp()
    if _CACHE["items"] is not None and _CACHE["stamp"] == st:
        return _CACHE["items"]
    items = _load_uncached()
    _CACHE["items"], _CACHE["stamp"] = items, st
    return items

def _load_uncached():
    items, n = [], 0
    for lane, name, rel in REPORTS:
        path = os.path.join(REPO, rel)
        if not os.path.exists(path): continue
        fs = parse(path); notes = preflight(fs, REPO); rb = repro_blocks(path)
        for i, f in enumerate(fs):
            roles = roles_needed(f); accts = []
            for r in roles:
                a = ACCOUNT.get(r, 'alice')
                if a not in accts: accts.append(a)
            rep = rb[i] if i < len(rb) else None
            items.append({
                "id": f"{lane}:{i}", "n": n, "lane": lane, "laneName": name,
                "title": f["title"], "sev": f["severity"], "area": f["area"],
                "surface": surface(f), "roles": roles, "accounts": accts,
                "steps": f["steps"], "actual": f.get("Фактический результат",""),
                "measure": f.get("Фактический результат_measure",""),
                "expected": f.get("Ожидаемый результат",""),
                "problem": f.get("Проблема",""), "drift": f.get("table_drift"),
                "notes": notes.get(f["title"][:34], []),
                "repro": rep,
            }); n += 1
    return _runnable_only(items)

def _runnable_only(items):
    """Only findings whose repro script is actually on disk.

    A finding with no script is one the reader has to set up by hand, which is
    the work the bench exists to remove. BENCH_ALL=1 shows everything.
    """
    if os.environ.get("BENCH_ALL"):
        return items
    keep = []
    for it in items:
        rep = it.get("repro") or {}
        snip = rep.get("snippet")
        if snip and os.path.exists(os.path.join(REPO, "scripts", "callrig", "snip", snip)):
            keep.append(it)
    for i, it in enumerate(keep):
        it["n"] = i
    return keep

# A run started from the app is watched by a person, so pace it. Command-line
# runs are unaffected: drive.mjs treats an unset QA_SLOW_MS as no delay.
SLOW_MS = os.environ.get("BENCH_SLOW_MS", "800")
TILE_LEFT = os.environ.get("BENCH_TILE_LEFT", "640")

PROGRESS = {}          # finding id -> steps the running snippet has reported

def run_stream(cmd, key, timeout=420, slow=False):
    """Like run(), but reads stdout as it arrives so @@STEP markers land in
    PROGRESS while the snippet is still going. Without this the app can only
    tick the steps off once the whole run has finished, which is the moment
    they stop being useful."""
    env = dict(os.environ, QA_TILE_LEFT=TILE_LEFT)
    if slow: env["QA_SLOW_MS"] = SLOW_MS
    try:
        p = subprocess.Popen(cmd, cwd=REPO, text=True, bufsize=1,
                             stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env)
    except FileNotFoundError as e:
        return 127, str(e)
    killer = threading.Timer(timeout, p.kill); killer.start()
    out = []
    try:
        for line in p.stdout:
            out.append(line)
            m = re.match(r"@@STEP (\d+)", line.strip())
            if m: PROGRESS[key] = int(m.group(1))
        p.wait()
    finally:
        killer.cancel()
    return p.returncode, "".join(out)

def reset(lane, accts):
    """Reset each browser to neutral, all at once. Sequentially this cost about a
    minute per finding on a four-account lane and dominated the wait."""
    procs = []
    env = dict(os.environ, QA_TILE_LEFT=TILE_LEFT)
    for a in accts:
        try:
            procs.append(subprocess.Popen(
                ["./scripts/callrig/d", f"{lane}:{a}", "snip/_reset.mjs"],
                cwd=REPO, text=True, stdin=subprocess.DEVNULL,
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, env=env))
        except OSError:
            pass
    for p in procs:
        try: p.wait(timeout=90)
        except subprocess.TimeoutExpired: p.kill()


def run(cmd, timeout=420, slow=False):
    """slow=True paces the run so a person can watch it. Only the repro snippet
    is watched -- pacing sign-in and window placement just wastes the wait."""
    try:
        env = dict(os.environ, QA_TILE_LEFT=TILE_LEFT)
        if slow: env["QA_SLOW_MS"] = SLOW_MS
        p = subprocess.run(cmd, cwd=REPO, text=True, capture_output=True,
                           timeout=timeout, env=env)
        return p.returncode, (p.stdout or "") + (p.stderr or "")
    except subprocess.TimeoutExpired:
        return 124, f"timed out after {timeout}s"
    except FileNotFoundError as e:
        return 127, str(e)

def reproduce(item):
    """Bring the browsers up, then run the finding's repro snippet if it has one."""
    log, lane = [], item["lane"].lower()
    # The block's data-accounts is authoritative: whoever wrote the snippet named
    # the browsers it drives. item["accounts"] is a guess derived from the
    # finding's prose, and where the two differ the snippet was driven against a
    # browser that had never been brought up.
    rep0 = item.get("repro") or {}
    accts = [a.strip() for a in rep0.get("accounts", "").split(",") if a.strip()] \
            or item["accounts"] or ["alice"]
    PROGRESS[item["id"]] = 0

    log.append(f"$ ./scripts/callrig/ensure.sh {lane} {' '.join(accts)}")
    rc, out = run(["./scripts/callrig/ensure.sh", lane, *accts])
    log.append(out.strip() or "(no output)")
    if rc != 0:
        return {"ok": False, "stage": "browsers", "log": "\n".join(log),
                "left": "The rig did not come up. Fix that, then press Reproduce again."}

    # put the rig window where it is not under the app before anything runs
    driver0 = (item.get("repro") or {}).get("accounts", ",".join(accts)).split(",")[0].strip()
    driver0 = driver0 or accts[0]
    run(["./scripts/callrig/d", f"{lane}:{driver0}", "snip/_tile.mjs"], timeout=60)
    # A locale finding has to leave the app in that locale, so it cannot restore
    # anything itself -- and every other snippet matches English strings. Without
    # this, judging one non-English finding breaks every finding judged after it.
    # Put every browser the finding uses back to neutral: language to English, any
    # meeting still running ended. Not just the driver -- ending a meeting leaves
    # the OTHER windows parked on "Call has ended", and a snippet needing a second
    # participant then cannot get one. Run together, because sequentially this was
    # the dominant cost of a reproduce.
    reset(lane, accts)

    rep = item.get("repro")
    if not rep or not rep.get("snippet"):
        return {"ok": True, "stage": "positioned", "log": "\n".join(log),
                "left": f"No repro snippet recorded for this finding. Browsers are up as "
                        f"{', '.join(accts)} — open {item['surface']} and follow the steps."}

    name = os.path.basename(rep["snippet"])          # no path traversal
    if not re.fullmatch(r'[A-Za-z0-9._-]+\.mjs', name) or not os.path.exists(os.path.join(SNIP, name)):
        return {"ok": False, "stage": "snippet", "log": "\n".join(log),
                "left": f"Repro snippet {html.escape(name)} is named in the report but not in "
                        f"scripts/callrig/snip/. Follow the steps manually."}

    driver = rep.get("accounts", ",".join(accts)).split(",")[0].strip()
    log.append(f"\n$ ./scripts/callrig/d {lane}:{driver} snip/{name}")
    rc, out = run_stream(["./scripts/callrig/d", f"{lane}:{driver}", f"snip/{name}"],
                         item["id"], slow=True)
    log.append(out.strip() or "(no output)")

    res = _snippet_result(out)
    left = res.get("leftToDo") or "Snippet finished. Compare what you see against the claim above."
    # The exit code only says the script ran. A snippet that could not reach the
    # state returns ready:false and says so -- reporting that as a successful
    # setup is how someone ends up judging a screen the finding is not about.
    ready = bool(res.get("ready"))
    return {"ok": rc == 0 and ready,
            "stage": "reproduced" if ready else "failed",
            "log": "\n".join(log), "left": left,
            "stepsDone": int(res.get("stepsDone") or 0),
            "asserted": res.get("asserted") or None}

def _snippet_result(out):
    """The object a repro snippet returned, from drive.mjs's stdout.

    drive.mjs prints the return value as JSON, but rig noise shares the stream.
    Counting braces is wrong -- a brace inside a string breaks it -- so try to
    decode at every "{" and keep the widest object that parses. Widest, not
    last: the nested "asserted" object also parses, and it is not the result.
    Returns {} when nothing parses; the caller falls back.
    """
    dec, best, best_len = json.JSONDecoder(), {}, 0
    i = out.find('{')
    while i != -1:
        try:
            obj, consumed = dec.raw_decode(out[i:])
            if isinstance(obj, dict) and consumed >= best_len:
                best, best_len = obj, consumed
        except ValueError:
            pass
        i = out.find('{', i + 1)
    return best

# Verdicts and should-be rewrites live here, not in the page's localStorage.
# The server takes a free port on every launch, and localStorage is keyed by
# origin -- port included -- so browser-side state was wiped by every restart.
STATE = os.path.join(os.path.expanduser("~"), ".cache", "aloqa-qa",
                     "reproducer-state.json")

def read_state():
    try:
        with open(STATE, encoding="utf-8") as fh: return fh.read()
    except (OSError, ValueError):
        return "{}"

def write_state(body):
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    tmp = STATE + ".tmp"                       # never truncate the record in place
    with open(tmp, "w", encoding="utf-8") as fh: fh.write(body)
    os.replace(tmp, STATE)

UI = os.path.join(REPO, "reports", "tools", "bench-ui.html")

class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _send(self, code, body, ctype="application/json"):
        b = body.encode() if isinstance(body, str) else body
        try:
            self.send_response(code)
            self.send_header("Content-Type", ctype + "; charset=utf-8")
            self.send_header("Content-Length", str(len(b)))
            self.end_headers(); self.wfile.write(b)
        except (BrokenPipeError, ConnectionResetError):
            pass          # the client gave up mid-response; not our problem

    def do_GET(self):
        u = urlparse(self.path)
        if u.path in ("/", "/index.html"):
            return self._send(200, open(UI, encoding="utf-8").read(), "text/html")
        if u.path == "/api/state":
            return self._send(200, read_state())
        if u.path == "/api/progress":
            fid = parse_qs(u.query).get("id", [""])[0]
            return self._send(200, json.dumps({"steps": PROGRESS.get(fid, 0)}))
        if u.path == "/api/ping":
            return self._send(200, json.dumps({"ok": True, "n": len(load())}))
        if u.path == "/api/findings":
            return self._send(200, json.dumps(load(), ensure_ascii=False))
        self._send(404, "{}")

    def do_POST(self):
        u = urlparse(self.path)
        ln = int(self.headers.get("Content-Length", 0))
        payload = json.loads(self.rfile.read(ln) or "{}")
        if u.path == "/api/repro":
            items = {i["id"]: i for i in load()}
            it = items.get(payload.get("id"))
            if not it: return self._send(404, json.dumps({"ok": False, "left": "unknown finding"}))
            return self._send(200, json.dumps(reproduce(it), ensure_ascii=False))
        if u.path == "/api/state":
            write_state(json.dumps(payload, ensure_ascii=False))
            return self._send(200, json.dumps({"ok": True}))
        if u.path == "/api/close":
            lane = str(payload.get("lane", ""))
            if not re.fullmatch(r"[A-Za-z]", lane):        # never shell a free string
                return self._send(400, json.dumps({"ok": False, "log": "bad lane"}))
            rc, out = run(["./scripts/callrig/stop.sh", lane.lower()], timeout=90)
            return self._send(200, json.dumps({"ok": rc == 0, "log": out.strip()},
                                              ensure_ascii=False))
        if u.path == "/api/record":
            date = datetime.date.today().isoformat()
            p = os.path.join(REPO, f"verification-{date}.md")
            with open(p, "w", encoding="utf-8") as fh: fh.write(payload.get("md", ""))
            return self._send(200, json.dumps({"ok": True, "path": os.path.basename(p)}))
        self._send(404, "{}")

if __name__ == "__main__":
    # Bind and start serving straight away, and parse the reports on a
    # background thread. Parsing five reports takes seconds; if we did it first
    # the port would not exist yet and anything waiting on us would conclude we
    # had died. /api/ping blocks until the parse finishes, which is the signal.
    threading.Thread(target=load, daemon=True).start()
    print(f"\n  Reproducer")
    print(f"  http://127.0.0.1:{PORT}\n")
    print("  Reproduce launches real browsers on your machine. Ctrl-C to stop.\n")
    if not os.environ.get("BENCH_NO_BROWSER"):      # the .app hosts its own window
        threading.Timer(0.8, lambda: webbrowser.open(f"http://127.0.0.1:{PORT}")).start()
    try: ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
    except KeyboardInterrupt: print("\n  stopped\n")
