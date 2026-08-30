#!/usr/bin/env python3
"""Review — read a finding, press Reproduce, judge what you see.

    python3 scripts/bench.py            # then open http://127.0.0.1:8777

Runs on your machine so it can actually drive the rig. Reproduce launches the
browsers a finding needs, signs them in, runs the finding's repro snippet, and
stops with the defect on screen. You judge. Verdicts are written to
verifications/verification-<date>.md.

A finding is reproducible when its report carries a repro block:

    <div class="block repro" data-lane="E" data-accounts="alice,bob"
         data-snippet="e-calendar-stale.mjs">
      <h3>Воспроизведение</h3>
      <p><code>./d e:alice snip/e-calendar-stale.mjs</code></p>
    </div>

Findings without one still open positioned; the bench says what is left to do.
"""
import os, sys, re, json, glob, html, hashlib, shutil, subprocess, datetime, threading, time, webbrowser
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from verify_queue import parse, roles_needed, surface, preflight, ACCOUNT

def _repair_path():
    """Put node back on PATH.

    A GUI app launched from Finder, the Dock or `open` inherits launchd's PATH
    — /usr/bin:/bin:/usr/sbin:/sbin — which has no homebrew in it. ensure.sh
    then dies on "node: command not found" and the app reports "The rig did not
    come up", which describes a browser problem that does not exist. It only
    ever worked when the binary was started from a terminal, so the bug is
    invisible to anyone testing it that way.
    """
    if shutil.which("node"):
        return
    path = os.environ.get("PATH", "")
    parts = path.split(os.pathsep)
    for d in ("/opt/homebrew/bin", "/usr/local/bin", os.path.expanduser("~/.local/bin")):
        if d not in parts and os.path.exists(os.path.join(d, "node")):
            path = d + os.pathsep + path
    os.environ["PATH"] = path
    if shutil.which("node"):
        return
    # nvm, asdf and friends put it somewhere only the login shell knows
    try:
        found = subprocess.run([os.environ.get("SHELL", "/bin/zsh"), "-lc", "command -v node"],
                               text=True, capture_output=True, timeout=20).stdout.strip()
        if found:
            os.environ["PATH"] = os.path.dirname(found) + os.pathsep + os.environ["PATH"]
    except Exception:
        pass

_repair_path()

PORT = int(os.environ.get("BENCH_PORT", "8777"))
SNIP = os.path.join(REPO, "scripts", "callrig", "snip")
# One report per lane. PINNED is the set someone chose; discovery only overrides
# a pin when it finds something STRICTLY newer, so a new report is picked up
# without a code change and today's set can never be silently swapped for a
# different one. That distinction is load-bearing: lane A once had two reports of
# the same date with no revision suffix — nine findings and one — separated only
# by mtime, which a git checkout rewrites. Ranking alone would coin-flip between
# them, and a wrong auto-pick looks exactly like a right one from inside the app.
#
# EMPTY ON PURPOSE since 2026-08-30. The sector letters were re-dealt for the
# nine-sector map, so every report on disk sits under a lane letter that now names
# a different sector: pinning lane C to a chat report would put chat findings in
# front of someone judging Calls · studio, labelled as theirs. An empty pin means
# discovery-by-newest, which is correct until the first nine-sector reports land —
# at which point pin them here again, one line per lane, and the coin-flip
# protection comes back with them.
PINNED = {}
LANE_NAMES = {"A": "Calls · lifecycle", "B": "Calls · room", "C": "Calls · studio",
              "D": "Chat · messages", "E": "Chat · spaces", "F": "Admin & org",
              "G": "Identity & access", "H": "Shell & discovery",
              "I": "Calendar & files"}
# aloqa-<area>-qa-<YYYY-MM-DD>-<LANE>[-<rev>].html
REPORT_RE = re.compile(
    r"aloqa-(?P<area>.+)-qa-(?P<date>\d{4}-\d{2}-\d{2})-(?P<lane>[A-Z])(?:-(?P<rev>\d+))?\.html$")


def _rank(path):
    m = REPORT_RE.search(os.path.basename(path))
    return (m["date"], int(m["rev"] or 0)) if m else None


# Area tokens written under the two retired sector maps. A lane letter no longer
# names the sector it named when these were published, so labelling one of them with
# the lane's current sector name puts, say, chat findings in front of someone judging
# Calls and tells them they are theirs. Name it by what it actually is instead.
RETIRED_AREAS = {
    "calls-inside": "Calls · inside", "calls-around": "Calls · around",
    "chat": "Chat", "org": "Org · identity", "workspace": "Workspace · calendar",
    "calls-entry": "Calls · getting in", "calls-media": "Calls · media",
    "calls-floor": "Calls · floor", "calls-collab": "Calls · collab",
    "calls-record": "Calls · record",
}


def _lane_name(lane, rel):
    """What to call this lane in the app, given the report actually chosen for it."""
    m = REPORT_RE.search(os.path.basename(rel))
    area = m["area"] if m else None
    if area in RETIRED_AREAS:
        return "%s (retired map)" % RETIRED_AREAS[area]
    return LANE_NAMES.get(lane, lane)


def _pick_reports(log=print):
    """The newest report per lane, unless the pin is already at least that new."""
    found = {}
    for path in sorted(glob.glob(os.path.join(REPO, "reports", "aloqa-*.html"))):
        rel = os.path.relpath(path, REPO)
        m = REPORT_RE.search(os.path.basename(rel))
        if m:
            found.setdefault(m["lane"], []).append(rel)

    out = []
    for lane in sorted(set(PINNED) | set(found)):
        cands = found.get(lane, [])
        pin = PINNED.get(lane)
        pin_ok = pin and os.path.exists(os.path.join(REPO, pin))
        newest = max(cands, key=_rank, default=None)
        if pin_ok and (not newest or _rank(newest) <= _rank(pin)):
            chosen, why = pin, ""
        elif newest:
            chosen = newest
            if pin_ok:
                why = "  <- newer than the pinned %s" % os.path.basename(pin)
            elif pin:
                why = "  <- pinned report is missing"
            else:
                # No pin at all is the current state and it is deliberate, so say
                # that rather than "missing", which reads as something broken.
                why = "  <- no pin, newest wins"
        else:
            log(f"  lane {lane}: no report found, skipping")
            continue
        out.append((lane, _lane_name(lane, chosen), chosen))
        log(f"  lane {lane}: {os.path.basename(chosen)}{why}")
    return out


REPORTS = _pick_reports(log=lambda *_: None)

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

_CACHE = {"items": None, "stamp": None, "meta": None}
_LOAD_LOCK = threading.RLock()

def _stamp(reports):
    out = []
    for _, _, rel in reports:
        p = os.path.join(REPO, rel)
        out.append((rel, os.path.getmtime(p) if os.path.exists(p) else 0))
    return tuple(out)

def load():
    """Parsed findings, cached until the report set or a report file changes.

    Re-picks the reports on every call — a glob over reports/, cheap — so a
    report published while the server runs is discovered without a restart.
    The lock matters: the app's first ping and the boot thread used to parse
    the same five reports concurrently, each with its own repo-wide grep."""
    global REPORTS
    with _LOAD_LOCK:
        reports = _pick_reports(log=lambda *_: None)
        st = _stamp(reports)
        if _CACHE["items"] is not None and _CACHE["stamp"] == st:
            return _CACHE["items"]
        REPORTS = reports
        items, meta, legacy = _load_uncached(reports)
        _CACHE.update(items=items, stamp=st, meta=meta)
        _migrate_state(legacy)
        return items

def load_meta():
    load()
    return _CACHE["meta"] or {}

def _fid(lane, title):
    """Content id, stable across republishes while the title is stable.

    The old positional id ("D:9") meant a republished report re-attached every
    recorded verdict, priority and rewrite to whatever finding sat at that
    index in the new file — silently, and the newest report is auto-picked."""
    h = hashlib.sha1(re.sub(r"\s+", " ", title).strip().encode()).hexdigest()[:10]
    return f"{lane}:{h}"

def _load_uncached(reports):
    items, n = [], 0
    meta = {"tileLeft": int(TILE_LEFT), "reports": [], "warnings": []}
    legacy = {}                     # old positional id -> content id
    for lane, name, rel in reports:
        path = os.path.join(REPO, rel)
        if not os.path.exists(path): continue
        try:
            src = open(path, encoding="utf-8").read()
            fs = parse(path); notes = preflight(fs, REPO); rb = repro_blocks(path)
        except Exception as e:
            # one unreadable report must not take the whole app down with a
            # misleading "is bench.py running?" — skip the lane and say so
            meta["warnings"].append(f"lane {lane}: {os.path.basename(rel)} could not be parsed "
                                    f"({e.__class__.__name__}: {e}) — lane skipped")
            continue
        if not fs:
            # a truncated or emptied file parses to zero findings and the lane
            # would otherwise just vanish from the queue with no trace
            meta["warnings"].append(f"lane {lane}: {os.path.basename(rel)} parsed to zero findings "
                                    "— truncated or emptied file?")
        unmatched = sum(1 for f in fs if f["severity"] == "?")
        if unmatched:
            meta["warnings"].append(f"lane {lane}: {unmatched} finding(s) have no matching summary-table "
                                    "row — severity shows as ? in the app; fix the report's row wording")
        meta["reports"].append({
            "lane": lane, "laneName": name, "file": os.path.basename(rel),
            "count": len(fs),
            "sha1": hashlib.sha1(src.encode()).hexdigest()[:10],
            "mtime": datetime.datetime.fromtimestamp(os.path.getmtime(path)).isoformat(timespec="seconds"),
        })
        for i, f in enumerate(fs):
            fid = _fid(lane, f["title"])
            legacy[f"{lane}:{i}"] = fid
            roles = roles_needed(f); guessed = []
            for r in roles:
                a = ACCOUNT.get(r, 'alice')
                if a not in guessed: guessed.append(a)
            rep = rb[i] if i < len(rb) else None
            # the block's data-accounts is authoritative — whoever wrote the
            # snippet named the browsers it drives; the roles-derived guess is
            # the fallback for findings with no block
            block_accts = [a.strip() for a in (rep or {}).get("accounts", "").split(",") if a.strip()]
            items.append({
                "id": fid, "n": n, "lane": lane, "laneName": name,
                "title": f["title"], "sev": f["severity"], "area": f["area"],
                # reports tag the title [BE] or [FE-WEB]; that is where the
                # finding says which side it lives on
                "side": "backend" if "[BE]" in f["title"].split("]")[0] + "]"
                        else "frontend",
                "surface": surface(f), "roles": roles,
                "accounts": block_accts or guessed,
                "steps": f["steps"], "actual": f.get("Фактический результат",""),
                "measure": f.get("Фактический результат_measure",""),
                "expected": f.get("Ожидаемый результат",""),
                "problem": f.get("Проблема",""), "drift": f.get("table_drift"),
                "notes": notes.get(f["title"], []),
                "repro": rep,
            }); n += 1
    return _runnable_only(items), meta, legacy

def _migrate_state(legacy):
    """Rewrite positional state keys ("D:9") to content ids, once, in place.

    Runs under the load lock. Without this, verdicts recorded before the id
    change would dangle while the same findings sat unjudged under new ids."""
    if not legacy:
        return
    try:
        st = json.loads(read_state() or "{}")
    except ValueError:
        return
    changed = 0
    for section in ("verdicts", "expected", "priority", "notes"):
        m = st.get(section)
        if not isinstance(m, dict):
            continue
        for old in list(m):
            new = legacy.get(old)
            if new and new != old and new not in m:
                m[new] = m.pop(old)
                changed += 1
    if changed:
        write_state(json.dumps(st, ensure_ascii=False))
        print(f"  migrated {changed} state entries to content ids")

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
TILE_LEFT = os.environ.get("BENCH_TILE_LEFT", "480")

PROGRESS = {}          # finding id -> steps the running snippet has reported

def _browsers_needed():
    """Distinct (lane, account) pairs the runnable findings' blocks name."""
    pairs = set()
    for it in (_CACHE["items"] or []):
        for a in it.get("accounts") or []:
            pairs.add((it["lane"], a))
    return len(pairs)

def _rig_env(slow=False):
    env = dict(os.environ, QA_TILE_LEFT=TILE_LEFT)
    # The bench is deliberately cross-lane. A QA_LANE inherited from the shell
    # it was started in — every QA session exports one — makes rigmap refuse
    # four of five lanes, and that surfaces as "The rig did not come up".
    env.pop("QA_LANE", None)
    # A full judging pass accumulates browsers across lanes (the bench never
    # closes a lane's browsers when the queue moves on), and the blocks can
    # name more distinct accounts than launch.sh's global default cap — the
    # last browser is then refused mid-Reproduce. Raise the cap to what the
    # queue actually needs; an explicit QA_MAX_BROWSERS still wins.
    if "QA_MAX_BROWSERS" not in os.environ:
        env["QA_MAX_BROWSERS"] = str(max(16, _browsers_needed()))
    if slow:
        env["QA_SLOW_MS"] = SLOW_MS
    return env

def run_stream(cmd, key, timeout=420, slow=False):
    """Like run(), but reads stdout as it arrives so @@STEP markers land in
    PROGRESS while the snippet is still going. Without this the app can only
    tick the steps off once the whole run has finished, which is the moment
    they stop being useful.

    slow pacing adds QA_SLOW_MS to every Playwright operation, which can more
    than double a long snippet's wall clock — the timeout scales with it, so a
    snippet that passes verify_snippets.py unpaced does not die only in the
    app. A timeout kill leaves a marker in the log instead of a bare rc."""
    if slow:
        timeout = max(timeout, 840)
    try:
        p = subprocess.Popen(cmd, cwd=REPO, text=True, bufsize=1,
                             stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                             env=_rig_env(slow))
    except FileNotFoundError as e:
        return 127, str(e)
    timed = {"out": False}
    def _kill():
        timed["out"] = True
        p.kill()
    killer = threading.Timer(timeout, _kill); killer.start()
    out = []
    try:
        for line in p.stdout:
            out.append(line)
            m = re.match(r"@@STEP (\d+)", line.strip())
            if m: PROGRESS[key] = int(m.group(1))
        p.wait()
    finally:
        killer.cancel()
    if timed["out"]:
        out.append(f"\n[bench] snippet timed out after {timeout}s and was killed\n")
    return p.returncode, "".join(out)

def reset(lane, accts, log=None):
    """Reset each browser to neutral, all at once. Sequentially this cost about a
    minute per finding on a four-account lane and dominated the wait.

    Each reset's last output line goes into the repro log: a reset that fails
    silently (language dialog changed shape, meeting-end refused) leaves state
    the next snippet inherits, and that reads as a broken snippet."""
    procs, env = [], _rig_env()
    for a in accts:
        try:
            procs.append((a, subprocess.Popen(
                ["./scripts/callrig/d", f"{lane}:{a}", "snip/_reset.mjs"],
                cwd=REPO, text=True, stdin=subprocess.DEVNULL,
                stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env)))
        except OSError as e:
            if log is not None: log.append(f"reset {a}: {e}")
    for a, p in procs:
        try:
            out, _ = p.communicate(timeout=90)
        except subprocess.TimeoutExpired:
            p.kill(); out = "(timed out after 90s)"
        if log is not None:
            tail = (out or "").strip().splitlines()
            log.append(f"reset {a}: {tail[-1] if tail else '(no output)'}")


def run(cmd, timeout=420, slow=False):
    """slow=True paces the run so a person can watch it. Only the repro snippet
    is watched -- pacing sign-in and window placement just wastes the wait."""
    try:
        p = subprocess.run(cmd, cwd=REPO, text=True, capture_output=True,
                           timeout=timeout, env=_rig_env(slow))
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

    # Bringing a browser up fails transiently — a fresh Chrome that has not shown
    # a CDP page target yet, or a port a dying one still holds — and ensure.sh is
    # written to repair only what is missing, so a second go is cheap and usually
    # works. One retry, because the person pressing this wants a browser, not a
    # diagnosis; if it fails twice the fault is real and the log carries both.
    for attempt in (1, 2):
        log.append(f"$ ./scripts/callrig/ensure.sh {lane} {' '.join(accts)}"
                   + (f"   (retry {attempt - 1})" if attempt > 1 else ""))
        rc, out = run(["./scripts/callrig/ensure.sh", lane, *accts])
        log.append(out.strip() or "(no output)")
        if rc == 0:
            break
    if rc != 0:
        why = ("node is not installed, or not where this app can see it — the rig "
               "is driven by node and nothing can run without it."
               if not shutil.which("node")
               else "The rig did not come up, twice. Fix that, then press Reproduce again.")
        return {"ok": False, "stage": "browsers", "log": "\n".join(log), "left": why}

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
    reset(lane, accts, log)

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

    driver = rep.get("accounts", ",".join(accts)).split(",")[0].strip() or accts[0]
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

# One reproduce at a time, server-side. The page has its own gate, but the
# keyboard and a navigated-away toolbar both used to reach here concurrently,
# and two interleaved ensure/reset/snippet runs wreck each other's state.
REPRO_LOCK = threading.Lock()

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

    def _local(self):
        """Refuse requests whose Host is not this machine. A DNS-rebinding
        page could otherwise read findings or, worse, POST at the state."""
        host = (self.headers.get("Host") or "").rsplit(":", 1)[0]
        if host in ("127.0.0.1", "localhost", "[::1]"):
            return True
        self._send(403, json.dumps({"ok": False, "error": "bad host"}))
        return False

    def do_GET(self):
        if not self._local(): return
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
        if u.path == "/api/meta":
            return self._send(200, json.dumps(load_meta(), ensure_ascii=False))
        if u.path == "/api/findings":
            return self._send(200, json.dumps(load(), ensure_ascii=False))
        self._send(404, "{}")

    def do_POST(self):
        if not self._local(): return
        # Any web page can fire a cross-origin text/plain POST at localhost
        # without a preflight — and these endpoints overwrite the verdict
        # state, the day's record, and launch browsers. Requiring the JSON
        # content type (which forces a preflight nothing answers) closes that;
        # the page already sends it.
        if not (self.headers.get("Content-Type") or "").startswith("application/json"):
            return self._send(415, json.dumps({"ok": False, "error": "application/json only"}))
        u = urlparse(self.path)
        ln = int(self.headers.get("Content-Length", 0))
        try:
            payload = json.loads(self.rfile.read(ln) or "{}")
        except ValueError:
            return self._send(400, json.dumps({"ok": False, "error": "bad json"}))
        if u.path == "/api/repro":
            items = {i["id"]: i for i in load()}
            it = items.get(payload.get("id"))
            if not it: return self._send(404, json.dumps({"ok": False, "left": "unknown finding"}))
            if not REPRO_LOCK.acquire(blocking=False):
                return self._send(409, json.dumps({
                    "ok": False, "stage": "busy",
                    "left": "A reproduce is already running. Let it finish first."}))
            try:
                return self._send(200, json.dumps(reproduce(it), ensure_ascii=False))
            finally:
                REPRO_LOCK.release()
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
            d = os.path.join(REPO, "verifications")
            os.makedirs(d, exist_ok=True)
            p = os.path.join(d, f"verification-{date}.md")
            with open(p, "w", encoding="utf-8") as fh: fh.write(payload.get("md", ""))
            return self._send(200, json.dumps(
                {"ok": True, "path": os.path.relpath(p, REPO)}))
        self._send(404, "{}")

def _exit_with_parent():
    """Stop when whatever started us stops.

    The app terminates this server in applicationWillTerminate, but a hard kill
    never runs that, and the server is then reparented to launchd and lives on
    holding a port. Fourteen of them accumulated in one afternoon of rebuilds,
    all parsing reports and competing for the machine, until the next launch
    took so long the app showed "Taking longer than usual".
    """
    first = os.getppid()
    if first <= 1:
        return                                  # already orphaned, nothing to watch
    def watch():
        while True:
            time.sleep(3)
            if os.getppid() != first:           # reparented: our parent is gone
                os._exit(0)
    threading.Thread(target=watch, daemon=True).start()


if __name__ == "__main__":
    _exit_with_parent()
    # Bind and start serving straight away, and parse the reports on a
    # background thread. Parsing five reports takes seconds; if we did it first
    # the port would not exist yet and anything waiting on us would conclude we
    # had died. /api/ping blocks until the parse finishes, which is the signal.
    def _boot():
        load()
        m = _CACHE["meta"] or {}
        # Per-lane counts, because a truncated report parses to zero findings
        # and the lane silently vanishes from the queue otherwise.
        for r in m.get("reports", []):
            print(f"  lane {r['lane']}: {r['count']} findings parsed")
        for w in m.get("warnings", []):
            print(f"  WARNING: {w}")
    threading.Thread(target=_boot, daemon=True).start()
    print(f"\n  Review")
    print(f"  http://127.0.0.1:{PORT}\n")
    # Say which five it chose. An auto-pick that goes unannounced is
    # indistinguishable from the right one until someone judges the wrong report.
    _pick_reports()
    print()
    print("  Reproduce launches real browsers on your machine. Ctrl-C to stop.\n")
    if not os.environ.get("BENCH_NO_BROWSER"):      # the .app hosts its own window
        threading.Timer(0.8, lambda: webbrowser.open(f"http://127.0.0.1:{PORT}")).start()
    try: ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
    except KeyboardInterrupt: print("\n  stopped\n")
