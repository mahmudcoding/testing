#!/usr/bin/env python3
"""Negative-control scripts/verify_report.py by mutating source and requiring failure.

    python3 scripts/verify_report_selftest.py

A guard nobody has watched fail is a guard nobody has tested. Every case below
reconstructs a specific way a finding can be wrong and requires a non-zero exit,
so `ALL CHECKS PASS` on a good file means something.

Two things changed with the source format. The old version could only run against
a report with at least twelve findings and a tagged summary table -- so half the
corpus was never negative-controlled at all; this one mutates a single file and
has no such precondition. And four of its cases are gone rather than ported: they
tested that the summary table still agreed with the articles, which is not a thing
that can drift once both are generated from one list.

Nothing here touches a tracked file. reports/ is copied into a temp tree and the
checker is pointed at it with QA_REPO, so a kill mid-mutation loses a copy rather
than a finding. The earlier version mutated the real file and restored it in a
finally, with a sidecar as a crash net -- a net over a hazard that did not need
to exist.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, HERE)
CHECKER = os.path.join(HERE, "verify_report.py")

FAILURES = []
CASES = 0
TMP_REPO = None      # the copied tree every case runs against


def run(path, repo):
    r = subprocess.run([sys.executable, CHECKER, path],
                       capture_output=True, text=True, timeout=60, cwd=REPO,
                       env=dict(os.environ, QA_REPO=repo))
    return r.returncode, r.stdout


def case(label, mutate, src, run_path=None, expect=None):
    """Mutate `src` in the temp tree and require rejection for the right reason.

    `expect` is a substring of the message that should fire. Without it a case
    passes whenever anything at all is rejected, and three of these did exactly
    that on the first run -- a lane-format mutation caught by the snippet check,
    a lane-mismatch mutation caught by the not-on-disk check. A guard that has
    never fired is not tested just because the file next to it was rejected.
    """
    global CASES
    CASES += 1
    keep = open(src, encoding="utf-8").read()
    text = mutate(keep)
    if text is None:
        print("  skip %s" % label)
        return
    if text == keep:
        print("  FAIL %s — the mutation changed nothing" % label)
        FAILURES.append(label)
        return
    try:
        open(src, "w", encoding="utf-8").write(text)
        rc, out = run(run_path or src, TMP_REPO)
        why = [l.strip()[6:] for l in out.splitlines() if l.strip().startswith("FAIL")]
        if rc == 0:
            print("  FAIL %s — checker accepted it" % label)
            FAILURES.append(label)
        elif expect and not any(expect in w for w in why):
            print("  FAIL %s — rejected, but by the wrong check" % label)
            print("         wanted: %s" % expect)
            for w in why[:3]:
                print("         got:    %s" % w[:92])
            FAILURES.append(label)
        else:
            print("  ok   %s\n         → %s" % (label, (why[0] if why else "")[:92]))
    finally:
        open(src, "w", encoding="utf-8").write(keep)


def main():
    tmp = tempfile.mkdtemp(prefix="verify-report-selftest-")
    shutil.copytree(os.path.join(REPO, "reports"), os.path.join(tmp, "reports"))
    # The snippet-on-disk check resolves against QA_REPO too, so the temp tree
    # needs the snippets a finding names -- otherwise every case would be
    # rejected for "snippet is not on disk" rather than the mutation under test,
    # which is exactly the wrong-reason failure the expect= assertions catch.
    # copytree preserves mode, so a read-only source would make the copy
    # read-only and every case would die on a PermissionError instead of
    # reporting a verdict.
    for d, _, fs in os.walk(os.path.join(tmp, "reports")):
        for f in fs:
            os.chmod(os.path.join(d, f), 0o644)
    os.makedirs(os.path.join(tmp, "scripts", "callrig"), exist_ok=True)
    os.symlink(os.path.join(REPO, "scripts", "callrig", "snip"),
               os.path.join(tmp, "scripts", "callrig", "snip"))
    try:
        return _run_cases(tmp)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def _run_cases(tmp):
    global TMP_REPO
    TMP_REPO = tmp
    fdir = os.path.join(tmp, "reports", "findings")
    srcs = sorted(f for f in os.listdir(fdir) if f.endswith(".md")) if os.path.isdir(fdir) else []
    if not srcs:
        print("no findings to mutate — write one first")
        return 2
    src = os.path.join(fdir, srcs[0])

    # Positive control. Every case below is worthless if the clean file does not pass.
    rc, out = run(src, tmp)
    print("\n  positive control — the unmutated file passes: %s" % ("yes" if rc == 0 else "NO"))
    if rc != 0:
        print(out)
        return 1

    print("\nFrontmatter")
    case("unknown severity", lambda s: s.replace("severity: High", "severity: Trivial"), src,
         expect="is not one of Critical")
    case("unknown side", lambda s: s.replace("side: frontend", "side: fullstack"), src,
         expect="side 'fullstack'")
    case("unknown surface", lambda s: s.replace("surface: Chat", "surface: Everywhere"), src,
         expect="surface 'Everywhere'")
    case("unknown status", lambda s: s.replace("status: published", "status: maybe"), src,
         expect="status 'maybe'")
    case("id disagrees with the filename",
         lambda s: re.sub(r"^id: .*$", "id: something-else", s, count=1, flags=re.M), src,
         expect="does not match the filename")
    case("unknown frontmatter field",
         lambda s: s.replace("status: published", "status: published\nseverety: High"), src,
         expect="unknown frontmatter field")
    case("missing a required field",
         lambda s: re.sub(r"^severity: .*\n", "", s, count=1, flags=re.M), src,
         expect="missing required field")
    case("indented frontmatter (the flat-schema guard)",
         lambda s: s.replace("accounts: alice, bob", "repro:\n  accounts: alice, bob"), src,
         expect="indented frontmatter")
    case("lane that is not a letter", lambda s: s.replace("lane: D", "lane: DD"), src,
         expect="is not a single letter")

    print("\nRepro")
    case("snippet not on disk",
         lambda s: s.replace("snippet: d-fail-delete.mjs", "snippet: d-not-a-file.mjs"), src,
         expect="is not on disk")
    case("snippet does not match the lane",
         lambda s: s.replace("lane: D", "lane: E"), src,
         expect="does not start with the finding's lane")
    case("snippet but no accounts",
         lambda s: re.sub(r"^accounts: .*\n", "", s, count=1, flags=re.M), src,
         expect="no accounts")

    print("\nBody")
    case("required section missing",
         lambda s: s.replace("## Ожидаемый результат", "## Что должно быть"), src,
         expect="unknown section heading")
    case("section is thin",
         lambda s: re.sub(r"## Ожидаемый результат\n\n.*?\n\n## Проверка",
                          "## Ожидаемый результат\n\nНадо починить.\n\n## Проверка",
                          s, count=1, flags=re.S), src,
         expect="is thin")
    case("measurement block removed",
         lambda s: re.sub(r"```\n.*?```\n", "", s, count=1, flags=re.S), src,
         expect="no measurement")
    case("no numbered steps",
         lambda s: re.sub(r"(## Как воспроизвести\n\n)(?:\d+\..*\n(?:   .*\n)?)+",
                          r"\1Открыть канал и посмотреть на сообщение внимательно ещё раз.\n", s, count=1), src,
         expect="no numbered steps")
    case("prose over the word budget",
         lambda s: s.replace("## Проблема\n", "## Проблема\n\n" + "слово " * 200 + "\n", 1), src,
         expect="over budget")
    case("prose before the first heading",
         lambda s: s.replace("---\n\n## Проблема", "---\n\nВводный абзац.\n\n## Проблема", 1), src,
         expect="prose before the first")

    print("\nContent that must not be published")
    case("leaked fixture email",
         lambda s: s.replace("другим аккаунтом", "аккаунтом qa.bob@aloqa.test"), src,
         expect="leaked test-setup name")
    case("leaked fixture channel",
         lambda s: s.replace("В своём канале", "В канале qa-general"), src,
         expect="leaked test-setup name")
    case("leaked workspace id",
         lambda s: s.replace("<ch>", "C4QAGENERAL0001"), src,
         expect="leaked test-setup name")
    case("citation a reader cannot open",
         lambda s: s.replace("## Подтверждённая причина\n",
                             "## Подтверждённая причина\n\nСм. `messages.ts:42`.\n", 1), src,
         expect="is not a full path")

    print("\nRuns")
    rdir = os.path.join(tmp, "reports", "runs")
    runs = sorted(f for f in os.listdir(rdir) if f.endswith(".md")) if os.path.isdir(rdir) else []
    if runs:
        rsrc = os.path.join(rdir, runs[0])
        case("run names a finding that does not exist",
             lambda s: re.sub(r"^findings: .*$", "findings: no-such-finding", s,
                              count=1, flags=re.M), rsrc, run_path=rsrc,
             expect="findings not found")
        case("run missing its build stamp",
             lambda s: re.sub(r"^build: .*\n", "", s, count=1, flags=re.M), rsrc, run_path=rsrc,
             expect="missing build")
        case("run with no heading",
             lambda s: re.sub(r"^# .*\n", "", s, count=1, flags=re.M), rsrc, run_path=rsrc,
             expect="no '# ' heading")

    print("\n  %d cases, %d failed" % (CASES, len(FAILURES)))
    if FAILURES:
        for f in FAILURES:
            print("   - %s" % f)
        return 1
    print("  ALL CASES CAUGHT")
    return 0


if __name__ == "__main__":
    sys.exit(main())
