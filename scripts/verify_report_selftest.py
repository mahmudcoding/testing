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

No case here touches a tracked file. reports/ is copied into a temp tree and the
checker is pointed at it with QA_REPO, so a kill mid-mutation loses a copy rather
than a finding. The earlier version mutated the real file and restored it in a
finally, with a sidecar as a crash net -- a net over a hazard that did not need
to exist.

The one thing the tree does NOT copy is scripts/callrig/snip/, which is symlinked
so the snippet-on-disk check resolves the same way it does for real. rmtree is
symlink-safe, so the real snippets are not at risk from cleanup -- but a case that
mutated a snippet would write through the link into tracked files. Copy the
directory before adding one.
"""
import os
import re
import contextlib
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, HERE)
CHECKER = os.path.join(HERE, "verify_report.py")

# --------------------------------------------------------------------------
# The fixture. Every string a case mutates lives here, so a case and the text it
# depends on are readable side by side -- when they lived in reports/ a corpus
# edit could silently make a mutation a no-op.

FIXTURE_ID = "selftest-fixture-finding"
FIXTURE_RUN = "2026-01-01-D-selftest.md"

FINDING = """---
id: selftest-fixture-finding
title: Неудавшееся действие показано пользователю как успешно выполненное
tags: FE-WEB, CHAT
severity: High
side: frontend
surface: Chat
status: published
lane: D
accounts: alice, bob
snippet: d-selftest.mjs
build: v0.0.0-selftest
sha: 0000000000ff
---

## Проблема

Если запрос не проходит, автор всё равно видит подтверждение выполненного
действия, а другие участники видят прежнее состояние. Ни ошибки, ни повторной
попытки при этом нет.

## Как воспроизвести

1. В своём канале выполнить действие над собственным сообщением.
2. Сделать так, чтобы запрос к серверу завершился ошибкой.
3. Посмотреть на результат, затем открыть тот же канал под другим аккаунтом.

## Фактический результат

Автор видит успех, остальные — прежнее состояние сообщения.

```
у автора: подтверждение показано, текст исчез
сервер:   GET /api/v1/messaging/channels/<ch>/messages -> тело на месте
```

## Подтверждённая причина

Узкая граница: запрос ушёл один раз и был оборван, а сервер всё это время
отдаёт прежнее тело — значит на сервере не происходит ничего.

## Ожидаемый результат

Пока сервер не подтвердил действие, результат не показывается выполненным, и
неудача объясняется пользователю так же, как у соседних операций.

## Проверка

- При упавшем запросе автор видит объяснение, состояние не меняется.
- Успешное действие по-прежнему отражается сразу у всех участников.
- Отложенное действие не уходит на сервер молча при следующей загрузке.
"""

RUN = """---
date: 2026-01-01
lane: D
sector: D
area: chat-messages
build: v0.0.0-selftest
sha: 0000000000ff
findings: selftest-fixture-finding
---

# Чат: проверка самого проверяющего

Единственный прогон, существующий только внутри временного дерева селфтеста.

## Проверено и работает

- Ничего: этот прогон синтетический и не описывает реальную сборку.
"""

SNIPPET = """// Fixture snippet. Exists so the fixture's `snippet:` resolves; never run.
export default async ({ page, progress }) => {
  const asserted = true;
  progress(1);
  return { ready: true, asserted, stepsDone: 1, leftToDo: "nothing" };
};
"""


FAILURES = []
CASES = 0
TMP_REPO = None      # the copied tree every case runs against


def run(path, repo):
    r = subprocess.run([sys.executable, CHECKER, path],
                       capture_output=True, text=True, timeout=60, cwd=REPO,
                       env=dict(os.environ, QA_REPO=repo))
    return r.returncode, r.stdout


def case(label, mutate, src, run_path=None, expect=None, also=None, rc_want=1):
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
    # A case must change something, whether that is `src` or the wider tree. The
    # exemption used to be "unless also= is given", which let an also= case whose
    # setup silently stopped working keep passing with nothing changed anywhere.
    with (also() if also else _nothing()) as changed_elsewhere:
        if text == keep and not changed_elsewhere:
            print("  FAIL %s — the mutation changed nothing" % label)
            FAILURES.append(label)
            return
        _run_case(label, keep, text, src, run_path, expect, rc_want)


@contextlib.contextmanager
def _nothing():
    yield False


def _run_case(label, keep, text, src, run_path, expect, rc_want=1):
    try:
        open(src, "w", encoding="utf-8").write(text)
        rc, out = run(run_path or src, TMP_REPO)
        # Strip the temp-tree prefix before printing. It is ~126 characters, so
        # at [:92] every diagnostic truncated to the directory name -- which
        # blinds exactly the output that catches a case rejected by the wrong
        # check, the thing the expect= assertions exist for.
        # Both prefixes: the checker says FAIL for "read it, found it wrong" and
        # UNREADABLE for "could not read it". Reading only FAIL made every
        # expect= assertion on an unreadable case impossible to satisfy.
        why = [l.strip().split(None, 1)[1].replace(TMP_REPO + os.sep, "")
               for l in out.splitlines()
               if l.strip().startswith(("FAIL", "UNREADABLE"))]
        if rc == 0:
            print("  FAIL %s — checker accepted it" % label)
            FAILURES.append(label)
        elif rc != rc_want:
            # 1 means "read it, found it wrong"; 2 means "could not read it".
            # A caller that acts on the difference gets a wrong answer if these
            # drift, and nothing else asserts them.
            print("  FAIL %s — rejected with exit %d, expected %d" % (label, rc, rc_want))
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
    _build_tree(tmp)
    try:
        return _run_cases(tmp)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def _build_tree(tmp):
    """A complete, self-contained tree: the fixture is written, not borrowed.

    It used to copy reports/ and mutate whichever finding sorted first, so what
    the negative controls actually tested depended on the corpus -- and emptying
    reports/ silenced all of them with one line of output nobody would read as a
    loss of coverage. Everything the cases need is synthesised here.

    snip/ is copied rather than symlinked: the link meant a case that mutated a
    snippet would write through it into tracked files, which the docstring's
    "no case here touches a tracked file" would not lead anyone to expect.
    """
    for d in ("reports/findings", "reports/runs", "reports/tools", "scripts/callrig"):
        os.makedirs(os.path.join(tmp, d), exist_ok=True)
    shutil.copytree(os.path.join(REPO, "scripts", "callrig", "snip"),
                    os.path.join(tmp, "scripts", "callrig", "snip"))
    shutil.copy(os.path.join(REPO, "reports", "tools", "report.css"),
                os.path.join(tmp, "reports", "tools", "report.css"))
    # The snippet the fixture names. Written here so the fixture depends on
    # nothing in scripts/callrig/snip/ that a later cleanup might remove.
    open(os.path.join(tmp, "scripts", "callrig", "snip", "d-selftest.mjs"),
         "w", encoding="utf-8").write(SNIPPET)
    open(os.path.join(tmp, "reports", "findings", FIXTURE_ID + ".md"),
         "w", encoding="utf-8").write(FINDING)
    open(os.path.join(tmp, "reports", "runs", FIXTURE_RUN),
         "w", encoding="utf-8").write(RUN)


@contextlib.contextmanager
def _withdraw(fdir):
    """Every finding in the temp tree withdrawn for the duration.

    A context manager rather than a returned undo: the restore is then structural
    rather than an ordering the caller has to get right in a finally alongside
    its own. Yields whether it actually changed anything, so a case relying on it
    is still held to the must-change rule.
    """
    saved = {}
    for name in sorted(os.listdir(fdir)):
        if not name.endswith(".md"):
            continue
        path = os.path.join(fdir, name)
        saved[path] = open(path, encoding="utf-8").read()
        open(path, "w", encoding="utf-8").write(
            saved[path].replace("status: published", "status: withdrawn"))
    changed = any(open(p, encoding="utf-8").read() != t for p, t in saved.items())
    try:
        yield changed
    finally:
        for path, text in saved.items():
            open(path, "w", encoding="utf-8").write(text)


def _run_cases(tmp):
    global TMP_REPO
    TMP_REPO = tmp
    fdir = os.path.join(tmp, "reports", "findings")
    src = os.path.join(fdir, FIXTURE_ID + ".md")

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
         lambda s: s.replace("snippet: d-selftest.mjs", "snippet: d-not-a-file.mjs"), src,
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
    if True:
        rsrc = os.path.join(rdir, FIXTURE_RUN)
        case("run names a finding that does not exist",
             lambda s: re.sub(r"^findings: .*$", "findings: no-such-finding", s,
                              count=1, flags=re.M), rsrc, run_path=rsrc,
             expect="findings not found")
        case("run missing its build stamp",
             lambda s: re.sub(r"^build: .*\n", "", s, count=1, flags=re.M), rsrc, run_path=rsrc,
             expect="missing build")
        case("unparseable run is exit 2, not exit 1",
             lambda s: "junk, not frontmatter\n", rsrc, run_path=rsrc,
             expect="no frontmatter", rc_want=2)
        case("run with no heading",
             lambda s: re.sub(r"^# .*\n", "", s, count=1, flags=re.M), rsrc, run_path=rsrc,
             expect="no '# ' heading")
        # check_run's publishability path was rewired three times across this fix
        # series and never negative-controlled. A run listing an id that exists
        # but is not published must be an error, not a quiet short publish.
        case("run lists a finding that is not published",
             lambda s: s, rsrc, run_path=rsrc, expect="which is not published",
             also=lambda: _withdraw(fdir))
        # And the leak scan reaches run prose, which it did not until recently.
        case("leaked fixture name in the run's lede",
             lambda s: s.replace("# Чат", "# Чат qa.bob@aloqa.test"), rsrc,
             run_path=rsrc, expect="leaked test-setup name")

    print("\n  %d cases, %d failed" % (CASES, len(FAILURES)))
    if FAILURES:
        for f in FAILURES:
            print("   - %s" % f)
        return 1
    print("  ALL CASES CAUGHT")
    return 0


if __name__ == "__main__":
    sys.exit(main())
