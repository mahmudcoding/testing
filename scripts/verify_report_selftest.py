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
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
CHECKER = os.path.join(HERE, "verify_report.py")

FAILURES = []
CASES = 0


def run(path):
    r = subprocess.run([sys.executable, CHECKER, path],
                       capture_output=True, text=True, timeout=60, cwd=REPO)
    return r.returncode, r.stdout


def case(label, mutate, src, run_path=None, expect=None):
    """Apply `mutate` to `src` and require the checker to reject it *for the right reason*.

    `expect` is a substring of the message that should fire. Without it a case
    passes whenever anything at all is rejected, and three of these did exactly
    that on the first run -- a lane-format mutation caught by the snippet check,
    a lane-mismatch mutation caught by the not-on-disk check. A guard that has
    never fired is not tested just because the file next to it was rejected.
    """
    global CASES
    CASES += 1
    d = tempfile.mkdtemp(prefix="vrs-")
    try:
        # Mutating in place inside reports/findings so relative-path checks and
        # the run's `findings:` resolution behave exactly as they do for real.
        keep = open(src, encoding="utf-8").read()
        text = mutate(keep)
        if text is None:
            print("  skip %s" % label)
            return
        open(src, "w", encoding="utf-8").write(text)
        rc, out = run(run_path or src)
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
        shutil.rmtree(d, ignore_errors=True)


def main():
    fdir = os.path.join(REPO, "reports", "findings")
    srcs = sorted(f for f in os.listdir(fdir) if f.endswith(".md")) if os.path.isdir(fdir) else []
    if not srcs:
        print("no findings to mutate — write one first")
        return 2
    src = os.path.join(fdir, srcs[0])

    # Positive control. Every case below is worthless if the clean file does not pass.
    rc, out = run(src)
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
    rdir = os.path.join(REPO, "reports", "runs")
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
