// List the tabs in a rig browser, and optionally close the orphaned ones.
//
// launch.sh opens exactly one tab. Extra tabs appear during the session: ~15
// snippets in here call ctx.newPage() (guest windows, second participants) and
// the app opens its own via window.open(url, '_blank'). Nothing closes them.
// Worse, ctx.pages() is not guaranteed to stay in creation order, so drive.mjs's
// pages[0] can move to a newly opened tab and strand the original — which is how
// a window ends up with a tab nobody has touched since launch, sitting on the
// workspace default home (apps/web/src/lib/routes.ts: DEFAULT_HOME_SECTION).
//
// A tab counts as an orphan only when its entire navigation history is one
// entry and it is still on an entry route: proof nothing has driven it since it
// opened. A tab a snippet opened and used carries about:blank plus its own
// entries, so guest and second-participant windows are never touched.
//
//   node drive.mjs b:alice snip/tabs.mjs                    # report only
//   QA_CLOSE_TABS=1 node drive.mjs b:alice snip/tabs.mjs    # orphans only — safe mid-session
//   QA_CLOSE_TABS=all node drive.mjs b:alice snip/tabs.mjs  # one tab per window — between sessions
//
// `all` keeps the tab carrying the most navigation history (the one actually
// worked in; a tie goes to the driven tab) and closes every other, including
// guest windows and about:blank leftovers. Only run it when the lane is idle —
// mid-session it will close a second participant out of a live call.
export default async ({ page, ctx }) => {
  // An entry route, or a blank tab nothing ever navigated: both mean "opened and
  // abandoned" when the tab's whole history is a single entry.
  const ENTRY = /^(?:about:blank$|https:\/\/[^/]+\/(?:$|login|w\/[^/]+\/directories\/?$))/;
  const mode = process.env.QA_CLOSE_TABS;               // '1' = orphans, 'all' = one tab
  const closing = mode === '1' || mode === 'all';
  const seen = [];

  for (const p of ctx.pages()) {
    if (p.url().startsWith('devtools://')) continue;
    const cdp = await ctx.newCDPSession(p);
    const { entries } = await cdp.send('Page.getNavigationHistory');
    await cdp.detach();
    const driven = p === page;
    seen.push({
      p,
      url: p.url().replace('https://airion-cargo.store', '').slice(0, 70),
      entries: entries.length,
      driven,
      orphan: !driven && entries.length === 1 && ENTRY.test(p.url()),
    });
  }

  // pick what survives: in 'all' mode the richest history wins, driven breaks a
  // tie; otherwise every non-orphan stays.
  let doomed = seen.filter((r) => r.orphan);
  if (mode === 'all' && seen.length > 1) {
    const best = seen.reduce((a, b) =>
      b.entries > a.entries || (b.entries === a.entries && b.driven) ? b : a);
    doomed = seen.filter((r) => r !== best);
  }

  let closed = 0;
  if (closing && doomed.length < seen.length) {        // never close the last tab
    for (const r of doomed) { await r.p.close(); closed++; }
  }
  return {
    tabs: seen.map(({ p, ...r }) => r),
    kept: seen.filter((r) => !doomed.includes(r)).map((r) => r.url),
    closed,
  };
};
