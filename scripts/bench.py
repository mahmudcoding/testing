#!/usr/bin/env python3
"""Review — read a finding, press Reproduce, judge what you see.

    python3 scripts/bench.py            # then open http://127.0.0.1:8777

Runs on your machine so it can actually drive the rig. Reproduce launches the
browsers a finding needs, signs them in, runs the finding's repro snippet, and
stops with the defect on screen. You judge. Verdicts are written to
verifications/verification-<date>.md.

A finding is reproducible when its source names a snippet:

    reports/findings/<id>.md
      lane: E
      accounts: alice, bob
      snippet: e-calendar-stale.mjs

Findings without one still open positioned; the bench says what is left to do.

Nothing here parses HTML. findings.py is the one parser, and a finding's id comes
from its file rather than from a hash of its title -- so fixing a typo in a title
no longer orphans the verdict somebody recorded against it.
"""
import os, sys, re, json, html, hashlib, shutil, subprocess, datetime, threading, time, webbrowser
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from findings import (REPO as SRC_REPO, SNIP_DIR, SOURCE_DIRS, SourceError, bench_items,
                      lane_name, load_runs, publish_blockers)

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
_CACHE = {"items": None, "stamp": None, "meta": None}
_LOAD_LOCK = threading.RLock()



def _stamp():
    """Every source file and its mtime, so an edit reloads without a restart."""
    out = []
    for d in SOURCE_DIRS:
        if not os.path.isdir(d):
            continue
        for n in sorted(os.listdir(d)):
            if n.endswith(".md"):
                out.append((n, os.path.getmtime(os.path.join(d, n))))
    return tuple(out)


def load():
    """Findings, cached until a source file changes.

    The lock matters: the app's first ping and the boot thread used to parse the
    same reports concurrently.
    """
    with _LOAD_LOCK:
        st = _stamp()
        if _CACHE["items"] is not None and _CACHE["stamp"] == st:
            return _CACHE["items"]
        meta = {"warnings": [], "reports": [], "tileLeft": int(TILE_LEFT)}
        try:
            runs = load_runs()
        except SourceError as e:
            meta["warnings"].append(str(e))
            runs = []
        items = bench_items(runs) if runs else []
        for r in runs:
            meta["reports"].append({
                "lane": r["lane"], "laneName": lane_name(r),
                "file": os.path.basename(r["path"]), "count": len(r["items"]),
                "sha1": hashlib.sha1(open(os.path.join(REPO, r["path"]), "rb")
                                     .read()).hexdigest()[:10],
                "mtime": datetime.datetime.fromtimestamp(
                    os.path.getmtime(os.path.join(REPO, r["path"]))
                ).isoformat(timespec="seconds"),
            })
        for r in runs:
            # Through the shared helper, not off r["dropped"] directly: three
            # consumers wording the same condition differently is what the helper
            # was introduced to stop.
            for why in publish_blockers(r):
                meta["warnings"].append("%s: %s" % (os.path.basename(r["path"]), why))
        if runs and not items and not any(publish_blockers(r) for r in runs):
            # Only when publish_blockers has not already said why. It reports
            # both "lists X, which is not published" and "has no findings to
            # publish", so an all-withdrawn run was producing three warnings for
            # one condition.
            meta["warnings"].append("runs found but no findings resolved — check "
                                    "each run's `findings:` list")
        # A verdict recorded against an id that no longer exists is invisible
        # otherwise: it stays in the state file, gets written back on every save,
        # and the person who recorded it just sees it gone.
        orphans = _orphan_state({i["id"] for i in items})
        if orphans:
            meta["warnings"].append(
                "%d recorded verdict(s)/priority(ies) match no finding on disk: %s"
                % (len(orphans), ", ".join(sorted(orphans)[:6])))
        items = _runnable_only(items, meta)
        _CACHE.update(items=items, stamp=st, meta=meta)
        return items


def _orphan_state(live_ids):
    """State keys that no longer name a finding."""
    try:
        st = json.loads(read_state() or "{}")
    except ValueError:
        return set()
    # Valid JSON that is not an object -- [] or null or 3 -- reaches here because
    # POST /api/state persists whatever it is handed. Reading .get() off it raised
    # AttributeError, which killed the process before the port bound and left
    # deleting the verdict file as the only way back in.
    if not isinstance(st, dict):
        return set()
    keys = set()
    for section in ("verdicts", "expected", "priority"):
        m = st.get(section)
        if isinstance(m, dict):
            keys |= set(m)
    return keys - set(live_ids)


def load_meta():
    load()
    return _CACHE["meta"] or {}


def _runnable_only(items, meta=None):
    """Only findings whose repro script is actually on disk.

    A finding with no script is one the reader has to set up by hand, which is
    the work the bench exists to remove. BENCH_ALL=1 shows everything.
    """
    if os.environ.get("BENCH_ALL"):
        return items
    keep, dropped = [], []
    for it in items:
        rep = it.get("repro") or {}
        snip = rep.get("snippet")
        if snip and os.path.exists(os.path.join(SNIP_DIR, snip)):
            keep.append(it)
        else:
            dropped.append("%s (%s)" % (it["id"], snip or "no snippet"))
    # Silently dropping a finding whose snippet name has a typo is indistinguish-
    # able, from inside the app, from the finding not existing. Say which went.
    if dropped and meta is not None:
        meta["warnings"].append(
            "%d finding(s) hidden — no runnable snippet on disk: %s (BENCH_ALL=1 shows them)"
            % (len(dropped), ", ".join(dropped[:6])))
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
    if os.environ.get("QA_REPO"):
        # An inherited QA_REPO redirects the whole module at import time. Left in
        # a shell by a selftest run it points Review at another tree, where the
        # only symptom is an empty queue -- which reads as "nothing to judge".
        print("  NOTE: QA_REPO is set, reading %s" % SRC_REPO)

    def _boot():
        load()
        m = _CACHE["meta"] or {}
        # Per-lane counts, because a truncated report parses to zero findings
        # and the lane silently vanishes from the queue otherwise.
        for r in m.get("reports", []):
            print("  %-34s %s, %d finding(s)" % (r["file"], r["laneName"], r["count"]))
        if not m.get("reports"):
            print("  no runs in reports/runs/ — nothing to judge")
        for w in m.get("warnings", []):
            print(f"  WARNING: {w}")
    threading.Thread(target=_boot, daemon=True).start()
    print(f"\n  Review")
    print(f"  http://127.0.0.1:{PORT}\n")
    # The readout stays on the _boot thread. Doing it here blocked the bind on a
    # full parse, which the comment above exists to prevent, and printed every
    # warning a second time.
    print("  Reproduce launches real browsers on your machine. Ctrl-C to stop.\n")
    if not os.environ.get("BENCH_NO_BROWSER"):      # the .app hosts its own window
        threading.Timer(0.8, lambda: webbrowser.open(f"http://127.0.0.1:{PORT}")).start()
    try: ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
    except KeyboardInterrupt: print("\n  stopped\n")
