/* Lane A re-verification kit — shared setup used by the a-*.mjs repro snippets.
 *
 * Not a shared helper in the CLAUDE.md sense: it carries the lane prefix, it is
 * owned by lane A, and nothing outside lane A imports it.
 *
 * The repro snippets run from ONE browser (the bench drives `./d a:<driver>`),
 * so anything a second account has to do is done by attaching to that account's
 * rig browser over CDP from inside the snippet.
 */
import { chromium } from 'playwright';
import { rigPort } from '../rigmap.mjs';
import { DOM, HOOK } from './lib.mjs';

export const WS = 'W4QAF1XTURESO01';
export const HOST = 'https://airion-cargo.store';
export const NAME = { alice: 'QA Alice', bob: 'QA Bob', carol: 'QA Carol',
                      dave: 'QA Dave', owner: 'QA Owner', admin: 'QA Admin',
                      guest: 'QA Guest' };

/** Attach to another lane-A rig browser and return its live airion page. */
export async function attach(account) {
  const port = rigPort('A', account);
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
  const ctx = browser.contexts()[0];
  await ctx.addInitScript(HOOK);
  const all = ctx.pages().filter((p) => !p.url().startsWith('devtools://'));
  const on = all.filter((p) => p.url().includes('airion-cargo.store'));
  const page = on[0] || all[all.length - 1] || (await ctx.newPage());
  return { browser, ctx, page, account };
}

export const install = (page) => page.evaluate(DOM);

/** Whatever the meeting API says right now — ids, per-participant `focus`. */
export const meetings = (page) =>
  page.evaluate(async (ws) => {
    const r = await fetch(`/api/v1/workspace/${ws}/meetings/active`, { credentials: 'include' });
    return r.ok ? (await r.json()).meetings || [] : [];
  }, WS);

export const myPerms = (page, id) =>
  page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}/my-permissions`, { credentials: 'include' });
    return r.ok ? await r.json() : { status: r.status };
  }, id);

/** Meeting id from a /call/<id> URL, or null. */
export const callIdOf = (page) => (page.url().match(/\/call\/([A-Za-z0-9]+)/) || [])[1] || null;

/** The host's live meeting: reuse the one that is already running, else start one. */
export async function ensureCall(page) {
  const here = callIdOf(page);
  if (here) {
    const live = (await meetings(page)).some((m) => m.id === here);
    if (live) return { id: here, reused: 'already in it' };
  }
  await page.goto(`${HOST}/w/${WS}/calls`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const mine = (await meetings(page)).find((m) => m.status === 'active');
  if (mine) {
    await joinCall(page, mine.id);
    if (callIdOf(page)) return { id: mine.id, reused: 'joined the live one' };
  }
  await install(page);
  const s = await page.evaluate(() => window.__qa.clickDeepest(/^Start now$/));
  if (!s.ok) return { id: null, error: 'no Start now on the calls hub' };
  await page.waitForTimeout(2500);
  await install(page);
  await page.evaluate(() => window.__qa.clickDeepest(/^Start call$/));
  for (let i = 0; i < 24 && !callIdOf(page); i++) await page.waitForTimeout(500);
  await page.waitForTimeout(4000);
  return { id: callIdOf(page), reused: null };
}

/** Take a participant from nowhere to inside the call (prejoin + lobby wait). */
export async function joinCall(page, id) {
  if (callIdOf(page) === id && (await inCall(page))) return { already: true };
  await page.goto(`${HOST}/w/${WS}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5500);
  await install(page);
  for (const re of ['^Join now$', '^Join call$', '^Join$', '^Ask to join$']) {
    const r = await page.evaluate((src) => window.__qa.clickDeepest(new RegExp(src)), re);
    if (r.ok) { await page.waitForTimeout(4000); return { clicked: r.name }; }
  }
  return { clicked: null };
}

/** In the call proper — not the prejoin screen, not the lobby. */
export const inCall = async (page) => {
  await install(page);
  return page.evaluate(() =>
    [...document.querySelectorAll('button')].some((b) =>
      /Leave call|Leave room/i.test(window.__qa.nameOf(b))));
};

/** Admit everyone waiting. Returns the names it let in. */
export async function admitAll(page, tries = 6) {
  await openPeople(page);
  const let_in = [];
  for (let i = 0; i < tries; i++) {
    await install(page);
    const r = await page.evaluate(() => window.__qa.clickDeepest(/^Admit/));
    if (!r.ok) break;
    let_in.push(r.name);
    await page.waitForTimeout(3500);
  }
  if (let_in.length) await page.waitForTimeout(2500);
  return let_in;
}

/** Open the Participants panel if it is not already open. */
export async function openPeople(page) {
  await install(page);
  const open = await page.evaluate(() => {
    const l = document.querySelector('[data-testid="participants-list"]');
    return !!l && window.__qa.boxVis(l);
  });
  if (!open) {
    await page.locator('button[aria-label="Participants"]').first().click().catch(() => {});
    await page.waitForTimeout(2500);
    await install(page);
  }
  return page.evaluate(() => {
    const l = document.querySelector('[data-testid="participants-list"]');
    return !!l && window.__qa.boxVis(l);
  });
}

/** Whole Participants panel, as the person sees it. */
export async function panel(page) {
  await install(page);
  return page.evaluate(() => {
    const l = document.querySelector('[data-testid="participants-list"]');
    const host = l ? (l.closest('aside') || l.parentElement) : null;
    return {
      rows: l ? [...l.querySelectorAll('[data-testid="participant-row"]')]
        .map((r) => r.innerText.replace(/\s+/g, ' ').trim().slice(0, 44)) : null,
      text: host ? host.innerText.replace(/\s+/g, ' ').slice(0, 400) : null,
      blocked: host ? (host.innerText.match(/BLOCKED \(\d+\)/) || [null])[0] : null,
      visibility: document.visibilityState,
    };
  });
}

/** Open Participant actions on someone else's row. Returns the menu items. */
export async function openRowMenu(page, who) {
  await openPeople(page);
  await install(page);
  const pos = await page.evaluate((w) => {
    const rows = [...document.querySelectorAll('[data-testid="participant-row"]')];
    const row = rows.find((r) => r.innerText.includes(w) && !/\(you\)/.test(r.innerText));
    if (!row) return null;
    const b = [...row.querySelectorAll('button')]
      .find((x) => /Participant actions/i.test(x.getAttribute('aria-label') || ''));
    if (!b) return null;
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  }, who);
  if (!pos) return { opened: false, items: [] };
  await page.mouse.click(pos.x, pos.y);
  await page.waitForTimeout(1800);
  await install(page);
  const items = await page.evaluate(() => [...new Set(
    [...document.querySelectorAll('[data-radix-popper-content-wrapper] *,[role=menuitem]')]
      .filter((n) => !n.children.length).filter(window.__qa.vis)
      .map((n) => (n.textContent || '').trim().replace(/\s+/g, ' ')).filter(Boolean))]);
  return { opened: true, items, pos };
}

/** Click an item in the open row menu, then its confirmation if one is named. */
export async function rowAction(page, who, item, confirmTid) {
  const m = await openRowMenu(page, who);
  if (!m.opened) return { ...m, picked: null };
  const picked = await page.evaluate((src) => window.__qa.popperPick(new RegExp(src)), item);
  await page.waitForTimeout(2000);
  if (confirmTid) {
    const c = page.locator(`[data-testid="${confirmTid}"]`).first();
    if (await c.count()) { await c.click(); await page.waitForTimeout(3500); }
    else return { ...m, picked, confirmed: false };
    return { ...m, picked, confirmed: true };
  }
  return { ...m, picked };
}

/** Close the Participants panel. A narrow window with it open covers the call
 *  toolbar, and the toolbar buttons then fail to click with "intercepts pointer
 *  events" — which looks exactly like a dead control. */
export async function closePeople(page) {
  const p = page.locator('button[aria-label="Participants"]').first();
  if ((await p.count()) && (await p.getAttribute('aria-pressed')) === 'true') {
    await p.click().catch(() => {});
    await page.waitForTimeout(1200);
  }
}

/** Set one device permission for a participant from the host's
 *  "Device permissions…" dialog. which: Microphone | Camera | Screen sharing,
 *  to: Inherit | Allow | Block. */
export async function setDevicePermission(page, who, which, to) {
  const m = await openRowMenu(page, who);
  if (!m.opened) return { ok: false, why: 'no row menu' };
  await page.evaluate(() => window.__qa.popperPick(/Device permissions/));
  await page.waitForTimeout(2500);
  await install(page);
  const read = () => page.evaluate((w) => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter((x) => x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    if (!d) return null;
    const t = d.innerText.replace(/\s+/g, ' ');
    const hit = t.match(new RegExp(w + ' Currently (\\w+)'));
    return { current: hit ? hit[1] : null };
  }, which);
  const before = await read();
  if (!before) return { ok: false, why: 'dialog did not open' };
  // the block is the smallest element holding the label and its own three buttons
  const hit = await page.evaluate(([w, to]) => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter((x) => x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    const cands = [...d.querySelectorAll('*')].filter(window.__qa.boxVis)
      .filter((n) => new RegExp(w).test(n.innerText || '')
        && [...n.querySelectorAll('button')]
          .filter((b) => /^(Inherit|Allow|Block)$/.test((b.innerText || '').trim())).length === 3);
    cands.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length);
    const blk = cands[0];
    if (!blk) return null;
    const b = [...blk.querySelectorAll('button')].find((x) => (x.innerText || '').trim() === to);
    if (!b) return null;
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  }, [which, to]);
  if (hit) { await page.mouse.click(hit.x, hit.y); await page.waitForTimeout(1500); }
  // Press Save by exact text. clickDeepest(/^(Save|Cancel)$/) takes the first
  // match in document order and the footer reads "Cancel Save", so the
  // alternation silently pressed Cancel and the change was never applied —
  // while "Currently Blocked" still read correctly, so nothing looked wrong.
  await install(page);
  const saved = await page.evaluate(() => {
    const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
      .filter((x) => x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
    if (!d) return false;
    const b = [...d.querySelectorAll('button')].filter(window.__qa.vis)
      .find((x) => (x.innerText || '').trim() === 'Save');
    if (!b) return false;
    b.click();
    return true;
  });
  await page.waitForTimeout(3500);
  // re-open to read the applied value, then leave the dialog closed
  const m2 = await openRowMenu(page, who);
  let after = null;
  if (m2.opened) {
    await page.evaluate(() => window.__qa.popperPick(/Device permissions/));
    await page.waitForTimeout(2500);
    await install(page);
    after = await read();
    await page.evaluate(() => {
      const d = [...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
        .filter((x) => x.getAttribute('data-testid') !== 'call-overlay-expanded').pop();
      const b = d && [...d.querySelectorAll('button')].filter(window.__qa.vis)
        .find((x) => (x.innerText || '').trim() === 'Cancel');
      if (b) b.click();
    });
    await page.waitForTimeout(1200);
  }
  return { ok: saved, before: before.current, after: after && after.current };
}

/** Close the Side Rooms panel. Like Participants it overlays the call toolbar in
 *  a narrow window, and the toolbar buttons then fail their own hit test. */
export async function closeSideRooms(page) {
  await install(page);
  const b = page.locator('button[aria-label="Close Side Rooms panel"]').first();
  if (await b.count()) { await b.click({ timeout: 10000 }).catch(() => {}); await page.waitForTimeout(1200); }
}

/** Lift every ban left behind by an earlier run, so the setup is repeatable. */
export async function unbanAll(page, tries = 6) {
  await openPeople(page);
  const lifted = [];
  for (let i = 0; i < tries; i++) {
    await install(page);
    const r = await page.evaluate(() => window.__qa.clickDeepest(/^Unban/));
    if (!r.ok) break;
    lifted.push(r.name);
    await page.waitForTimeout(2500);
  }
  return lifted;
}

/** Close whatever popper/menu is open, so the hand-over screen is not cluttered. */
export async function closeMenus(page) {
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(500);
}

/** Park a window in the strip beside whatever is driving it, reserving
 *  QA_TILE_LEFT points on the left for the Reproducer window.
 *
 *  Every rig window gets the SAME rectangle, so the screen holds two things: the
 *  app and the browser in front. The `i`/`n` arguments are kept so callers do not
 *  have to change, but the screen is no longer split between them — two 960px
 *  strips on a 1920 screen left no room for the app and put each browser exactly
 *  on the width where the call header starts disappearing.
 *
 *  The cost is real and worth knowing: a rig window behind another reports
 *  visibilityState "hidden", and the app suppresses some live UI while it is —
 *  so on a cross-window finding, bring the window you are watching to the front
 *  before judging whether an update arrived. */
export async function tile({ page, ctx, browser }, i, n) {
  try {
    const s = await page.evaluate(() => ({
      w: screen.availWidth, h: screen.availHeight,
      left: screen.availLeft || 0, top: screen.availTop || 0,
    }));
    const reserve = Number(process.env.QA_TILE_LEFT || 520);
    const width = Math.max(960, s.w - reserve);
    const ps = await ctx.newCDPSession(page);
    const { targetInfo } = await ps.send('Target.getTargetInfo');
    const bs = await browser.newBrowserCDPSession();
    const { windowId } = await bs.send('Browser.getWindowForTarget', { targetId: targetInfo.targetId });
    await bs.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'normal' } });
    await bs.send('Browser.setWindowBounds',
      { windowId, bounds: { left: s.left + (s.w - width), top: s.top, width, height: s.h } });
    await page.bringToFront();
    return true;
  } catch { return false; }
}

/** Put a window back to the full working area beside the app. Snippets tile, and
 *  a window left narrow by
 *  the previous run makes the NEXT run's setup misread: the call header and
 *  toolbar are gone at a third of the screen, so "is he in a side room" and "is
 *  the reaction button there" both answer no for a window that simply got small.
 *  Widen everything before measuring anything. */
export const full = (bundle) => tile(bundle, 0, 1);

/** Every side room the meeting has, with its status and headcount.
 *  Use THIS to ask where someone is, not `top_participants[].focus` from the
 *  active-meetings endpoint — that field reported "main" for a participant who
 *  was demonstrably inside a room. */
export const rooms = (page, id) =>
  page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}/breakout-rooms`, { credentials: 'include' });
    if (!r.ok) return [];
    const b = await r.json();
    const list = b.rooms || b.breakout_rooms || b || [];
    // closed rooms stay in the response but are gone from the panel; keeping them
    // makes "does a room called X exist" answer yes for a room nobody can see
    return (Array.isArray(list) ? list : [])
      .filter((x) => x.status !== 'closed')
      .map((x) => ({ id: x.id, name: x.name, status: x.status, count: x.participant_count }));
  }, id);

/** Is this window inside a side room right now?
 *  Reads the call header, which a narrow window drops entirely — at ~640px the
 *  toolbar and header are gone and this returns false for someone who is
 *  demonstrably inside a room. Measure BEFORE tiling, or tile no more than two
 *  windows across a 1920px screen. Returns the room name when it can see it. */
export async function inSideRoom(page) {
  await install(page);
  return page.evaluate(() => [...document.querySelectorAll('button')].filter(window.__qa.vis)
    .some((b) => {
      const n = window.__qa.nameOf(b).trim();
      return /^Leave Side Room$/i.test(n) || /^Side Room .+/.test(n);
    }));
}

/** Open the Side Rooms panel (an <aside>, not a dialog).
 *  Do not trust aria-pressed on the toggle: the side panel is shared with
 *  Participants, and the Side Rooms button has been found reading pressed while
 *  the Participants list was the thing on screen. Then "New Side Room" is not
 *  visible, room creation silently does nothing, and the setup fails in a way
 *  that looks like the product refusing to make a room. Check the aside itself. */
export async function openSideRooms(page) {
  const showing = () => page.evaluate(() => [...document.querySelectorAll('aside')]
    .some((a) => window.__qa.boxVis(a) && /Side Rooms/.test(a.innerText || '')));
  const b = page.locator('button[aria-label="Side Rooms"]').first();
  if (!(await b.count())) return false;
  for (let i = 0; i < 2; i++) {
    await install(page);
    if (await showing()) return true;
    await b.click({ timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(2500);
  }
  await install(page);
  return showing();
}

/** Create a side room. The creator lands inside it. */
export async function createRoom(page, name) {
  await openSideRooms(page);
  await install(page);
  const n = await page.evaluate(() => window.__qa.clickDeepest(/^New Side Room$/));
  if (!n.ok) return { created: false, why: 'no New Side Room control' };
  await page.waitForTimeout(2200);
  const inp = page.locator('[data-testid="side-room-create-name"]').first();
  if (await inp.count()) { await inp.fill(name); await page.waitForTimeout(500); }
  const sub = page.locator('[data-testid="side-room-create-submit"]').first();
  if (!(await sub.count())) return { created: false, why: 'no Create room button' };
  await sub.click();
  await page.waitForTimeout(5500);
  return { created: true, name };
}

/** Join (or switch into) a room from its card in the Side Rooms panel.
 *  Join/Switch on the card is pointer-driven — element.click() does nothing.
 *
 *  Pick the card FIRST, by the room name alone, and only then look for its
 *  button. Requiring the container to hold both the name and a Join/Switch
 *  button selects a container spanning several cards as soon as this room's own
 *  button reads "Joined" — and the click then lands on the NEXT room's Join.
 *  That happened: it moved the participant into the wrong room silently. */
export async function joinRoom(page, name) {
  await openSideRooms(page);
  await install(page);
  const pos = await page.evaluate((w) => {
    const a = [...document.querySelectorAll('aside')]
      .filter(window.__qa.boxVis).find((x) => /Side Rooms/.test(x.innerText || ''));
    if (!a) return null;
    const cards = [...a.querySelectorAll('*')].filter(window.__qa.boxVis)
      .filter((n) => (n.innerText || '').includes(w)
        && [...n.querySelectorAll('button')].some((b) =>
          /^(Join|Switch|Joined)$/.test(window.__qa.nameOf(b).trim())));
    cards.sort((x, y) => (x.innerText || '').length - (y.innerText || '').length);
    const card = cards[0];
    if (!card) return null;
    const btns = [...card.querySelectorAll('button')]
      .map((b) => ({ b, n: window.__qa.nameOf(b).trim() }))
      .filter((x) => /^(Join|Switch|Joined)$/.test(x.n));
    // one card, one such button — more than one means the container spans cards
    if (btns.length !== 1) return { ambiguous: btns.map((x) => x.n) };
    if (btns[0].n === 'Joined') return { already: true };
    btns[0].b.scrollIntoView({ block: 'center' });
    const r = btns[0].b.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2), label: btns[0].n };
  }, name);
  if (pos && pos.already) return { joined: true, already: true };
  if (pos && pos.ambiguous) return { joined: false, why: 'card match spans several rooms', ...pos };
  if (!pos) return { joined: false, why: 'no Join/Switch on that room card' };
  await page.mouse.click(pos.x, pos.y);
  await page.waitForTimeout(2200);
  const c = page.locator('[data-testid="side-room-confirm-submit"]').first();
  if (await c.count()) {
    const p = await c.evaluate((el) => { el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; });
    await page.mouse.click(p.x, p.y);
  }
  await page.waitForTimeout(6000);
  return { joined: await inSideRoom(page), via: pos.label };
}

/** Leave the side room back to the main call. Two steps, and both are
 *  pointer-driven — a programmatic click leaves the state untouched. */
export async function leaveRoom(page) {
  await install(page);
  const pos = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].filter(window.__qa.vis)
      .find((x) => /^Leave Side Room$/i.test(window.__qa.nameOf(x).trim()));
    if (!b) return null;
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) };
  });
  if (!pos) return { left: !(await inSideRoom(page)), why: 'no Leave Side Room control' };
  await page.mouse.click(pos.x, pos.y);
  await page.waitForTimeout(2200);
  const c = page.locator('[data-testid="side-room-confirm-submit"]').first();
  if (await c.count()) {
    const p = await c.evaluate((el) => { el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }; });
    await page.mouse.click(p.x, p.y);
  }
  await page.waitForTimeout(5500);
  return { left: !(await inSideRoom(page)) };
}
