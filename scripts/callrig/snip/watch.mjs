// Wait for a state to change — and treat "it never did" as a result, not an error.
//
// Three of one sector's six findings were "this state never resolves": a row stuck
// on `Ringing…`, a password gate that never clears, a waiting-room entrant nobody
// can admit. Each had to be established by hand at 2 minutes, then 5, then again on
// a fresh page instance, because a timeout thrown from a helper reads like a broken
// snippet rather than like the finding it is.
//
//   import { waitForChange } from './watch.mjs';
//   const r = await waitForChange(page, { selector: '[data-testid="participant-row"]',
//                                         timeoutMs: 300000 });
//   const r = await waitForChange(page, { arg: 'QA Bob', timeoutMs: 300000,
//     predicate: (name) => [...document.querySelectorAll('[data-testid=\"participant-row\"]')]
//       .find(n => n.innerText.includes(name))?.innerText ?? null });
//   // r.changed === false  ->  THAT IS THE FINDING. r.stableForMs says how long.
//
// Two things learned the hard way, both baked in:
//   - It samples the WHOLE document. A row can live in a portalled dialog outside
//     `main`, and a scoped poller reports "nothing happened" for something that did.
//   - A negative needs a proven starting state. Assert it with `requireInitial`, or say
//     `startsEmpty: true` when you are waiting for something to appear. Without either,
//     an empty or not-found baseline comes back flagged `suspectBaseline` — because
//     `changed:false` about a thing that was never there reads exactly like
//     `changed:false` about a state that never resolves.
//   - It normalises volatile text before comparing. This is not about noise. A call
//     surface ticks a duration badge every second, so a raw diff returns
//     changed:true at the FIRST tick — you would write "the row cleared after
//     257ms" about a row that never cleared at all. The unnormalised version does
//     not bury the answer, it inverts it.

const VOLATILE = [
  /\b\d{1,2}:\d{2}(:\d{2})?\b/g,        // 04:17, 1:02:33 — duration and clock badges
  /\b\d+\s?ms\b/gi,
  /\brunning\s+\d+\s*(min|minutes|sec|seconds)\b/gi,
  /\b\d+\s*(sec|seconds|min|minutes|hours?)\s+ago\b/gi,
  /\b\d{4}-\d{2}-\d{2}T[\d:.]+Z?\b/g,
];

const strip = (t) => VOLATILE.reduce((s, re) => s.replace(re, '⟨t⟩'), t || '')
  .replace(/\s+/g, ' ').trim();

// Anything whose normalised baseline looks like "there was nothing there".
const EMPTY_BASELINE = /^(|null|undefined|\[\]|\{\}|.*not.?found.*)$/i;

export async function waitForChange(page, {
  selector,
  predicate,                 // alternative to selector: a page function returning anything serialisable
  arg,                       // forwarded to the predicate, so "watch THIS row" needs no closure
  requireInitial,            // string | RegExp | fn — assert the starting state before watching
  startsEmpty = false,       // "I know it starts empty; I am watching for it to appear"
  timeoutMs = 300000,        // these are "never resolves" tests — default long on purpose
  everyMs = 500,
  normalise = true,
  maxTimeline = 40,
} = {}) {
  if (!selector && !predicate) return { error: 'pass a selector or a predicate' };

  const read = async () => {
    if (predicate) return arg === undefined ? page.evaluate(predicate) : page.evaluate(predicate, arg);
    // Whole document, every match, joined — not a scoped root.
    return page.evaluate((sel) => {
      const ns = [...document.querySelectorAll(sel)];
      return ns.map((n) => (n.innerText || n.textContent || '').replace(/\s+/g, ' ').trim()).join(' ⋮ ');
    }, selector);
  };

  const norm = (v) => {
    const t = typeof v === 'string' ? v : JSON.stringify(v);
    return normalise ? strip(t) : (t || '').replace(/\s+/g, ' ').trim();
  };

  const t0 = Date.now();
  let first;
  try { first = await read(); } catch (e) { return { error: 'first read failed: ' + e.message }; }
  const baseline = norm(first);

  // A negative result needs a proven starting state. `changed:false` about an element
  // that was never on screen reads identically to `changed:false` about a state that
  // never resolves — and the asymmetry is what makes it dangerous: a false
  // changed:true is loud (the timeline is visibly nonsense), a false changed:false is
  // silent and looks exactly like the finding you went looking for.
  if (requireInitial !== undefined) {
    const ok = typeof requireInitial === 'function' ? !!requireInitial(first)
      : requireInitial instanceof RegExp ? requireInitial.test(String(first))
      : String(first).includes(String(requireInitial));
    if (!ok) {
      return {
        error: 'baseline did not match requireInitial — not watching',
        expected: String(requireInitial), got: String(first).slice(0, 200),
        hint: 'the thing you meant to watch was probably never on screen; open it first',
      };
    }
  }
  const timeline = [{ atMs: 0, value: String(first).slice(0, 200) }];
  let samples = 1;

  for (;;) {
    const waited = Date.now() - t0;
    if (waited >= timeoutMs) {
      // The negative is a first-class return value. This is what a "never resolves"
      // finding is made of, and it must not look like a broken snippet.
      // A guard people route around is worse than none. Watching for something to
      // APPEAR — a calendar chip before its meeting exists, a control before a role is
      // granted — legitimately starts from nothing, and forcing those callers to
      // construct a requireInitial matcher for a state they know is empty is exactly
      // how a guard gets skipped. `startsEmpty: true` declares it in one word, and
      // keeps the flag meaningful for the case it was built for.
      const suspect = !startsEmpty && !requireInitial && EMPTY_BASELINE.test(baseline);
      return {
        changed: false,
        stableForMs: waited,
        samples,
        value: String(first).slice(0, 200),
        normalisedAs: baseline.slice(0, 200),
        timeline,
        // The baseline goes in the note, not just in a field: the note is what gets
        // read first, and a stable nothing is what this needs to catch.
        note: `unchanged across ${samples} samples over ${Math.round(waited / 1000)}s `
            + `(value: ${JSON.stringify(String(first).slice(0, 80))})`
            + (suspect ? ' — SUSPECT BASELINE: this looks like nothing was there to watch' : ''),
        ...(suspect ? { suspectBaseline: true } : {}),
      };
    }
    await page.waitForTimeout(everyMs);
    let now;
    try { now = await read(); } catch { continue; }   // a navigation mid-poll is not a result
    samples++;
    const cur = norm(now);
    if (cur !== baseline) {
      return {
        changed: true,
        atMs: Date.now() - t0,
        samples,
        from: String(first).slice(0, 200),
        to: String(now).slice(0, 200),
        timeline: [...timeline, { atMs: Date.now() - t0, value: String(now).slice(0, 200) }],
      };
    }
    if (timeline.length < maxTimeline && timeline[timeline.length - 1].value !== String(now).slice(0, 200)) {
      timeline.push({ atMs: Date.now() - t0, value: String(now).slice(0, 200) });
    }
  }
}
