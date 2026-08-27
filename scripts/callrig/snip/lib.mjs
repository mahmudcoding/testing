export const HOOK = `(() => {
  if (window.__pcs) return;
  window.__pcs = [];
  const O = window.RTCPeerConnection;
  window.RTCPeerConnection = function(...a){ const pc = new O(...a); window.__pcs.push(pc); return pc; };
  window.RTCPeerConnection.prototype = O.prototype;
  Object.assign(window.RTCPeerConnection, O);
  const gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  window.__gumCalls = [];
  navigator.mediaDevices.getUserMedia = async (c) => { window.__gumCalls.push({c: JSON.stringify(c), t: Date.now()}); return gum(c); };
  const gdm = navigator.mediaDevices.getDisplayMedia && navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);
  window.__gdmCalls = [];
  if (gdm) navigator.mediaDevices.getDisplayMedia = async (c) => { window.__gdmCalls.push({c: JSON.stringify(c||{}), t: Date.now()}); return gdm(c); };
})()`;

export const RTC_STATS = `async () => {
  const pcs = window.__pcs || [];
  const res = [];
  for (const pc of pcs) {
    if (pc.connectionState === 'closed') continue;
    const s = await pc.getStats();
    const o = {conn: pc.connectionState, ice: pc.iceConnectionState, out: [], in: []};
    s.forEach(r => {
      if (r.type === 'outbound-rtp') o.out.push({kind:r.kind, bytes:r.bytesSent, packets:r.packetsSent, fps:r.framesPerSecond, w:r.frameWidth, h:r.frameHeight, framesEnc:r.framesEncoded});
      if (r.type === 'inbound-rtp') o.in.push({kind:r.kind, bytes:r.bytesReceived, packets:r.packetsReceived, fps:r.framesPerSecond, w:r.frameWidth, h:r.frameHeight, framesDec:r.framesDecoded, audioLevel:r.audioLevel, totalAudioEnergy:r.totalAudioEnergy});
    });
    if (o.out.length || o.in.length) res.push(o);
  }
  return {pcs: pcs.length, gum: (window.__gumCalls||[]).length, gdm: (window.__gdmCalls||[]).length, stats: res};
}`;

export const UI_STATE = `() => {
  const dlg = [...document.querySelectorAll('[role="dialog"]')].pop();
  const q = () => [...(dlg||document.querySelector('main')||document).querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40), p:b.getAttribute('aria-pressed'), d:b.disabled})).filter(x=>x.l);
  return {
    url: location.href,
    dialogTitle: dlg ? (dlg.querySelector('h2')?.textContent||'').trim() : null,
    text: dlg ? dlg.innerText.replace(/\\n+/g,' | ').slice(0,900) : (document.querySelector('main')?.innerText||'').replace(/\\n+/g,' | ').slice(0,600),
    buttons: q(),
    videos: [...document.querySelectorAll('video')].map(v=>({w:v.videoWidth,h:v.videoHeight,paused:v.paused,muted:v.muted,hasSrc:!!v.srcObject,tracks: v.srcObject? v.srcObject.getTracks().map(t=>t.kind+':'+(t.enabled?'on':'off')+':'+t.readyState):[]})),
    audios: [...document.querySelectorAll('audio')].map(a=>({paused:a.paused,muted:a.muted,hasSrc:!!a.srcObject}))
  };
}`;

// ---------------------------------------------------------------------------
// Shared DOM helpers. Install once per page, then call through `window.__qa`:
//
//   import { DOM } from './lib.mjs';
//   await page.evaluate(DOM);                                  // idempotent
//   const hit = await page.evaluate(() => window.__qa.clickDeepest('Unpin'));
//
// Installed by evaluate rather than by the HOOK init script on purpose: an
// init script only reaches documents created after it is registered, and most
// snippets run against a page that has been sitting there for minutes.
export const DOM = `(() => {
  const vpW = () => window.innerWidth, vpH = () => window.innerHeight;

  // Effective opacity: a parent at opacity 0 hides a child that reports its own
  // opacity as 1, and neither display nor the rect shows it.
  const opacity = (el) => {
    let o = 1;
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.display === 'none' || s.visibility === 'hidden') return 0;
      o *= parseFloat(s.opacity || '1');
    }
    return o;
  };

  const rect = (el) => el.getBoundingClientRect();

  // boxVis: for CONTAINERS. Everything except the hit test.
  // A [role=dialog] fails a hit test at its own centre because its backdrop sits
  // on top, so hit-testing a container reports open modals as absent.
  const boxVis = (el) => {
    if (!el || !el.isConnected) return false;
    const r = rect(el);
    return r.width > 0 && r.height > 0 && opacity(el) > 0.01;
  };

  // vis: for LEAF CONTROLS. boxVis plus "is it actually the thing at its centre".
  // Note it does NOT filter by size: a 1px sr-only label has a non-zero rect and can win
  // its own hit test, so it passes. Where size is the discriminator — telling a real
  // notice from an sr-only twin, or a clipped control from a screen-reader label — filter
  // on it explicitly, as notices() does.
  const vis = (el) => {
    if (!boxVis(el)) return false;
    const r = rect(el);
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (cx < 0 || cy < 0 || cx > vpW() || cy > vpH()) return false;  // off-viewport
    const top = document.elementFromPoint(cx, cy);
    return !!top && (top === el || el.contains(top) || top.contains(el));
  };

  // Name of a control: icon-only buttons carry aria-label and empty textContent,
  // so matching textContent alone reports a plainly-present control as missing.
  // A control's visible name can live in four places, and a helper that reads only
  // one reports a present control as missing. Icon buttons carry aria-label with
  // empty textContent; a switch or checkbox is often named by a sibling
  // label[for=id] in a different subtree, which is neither its text nor its
  // ancestor; aria-labelledby points anywhere in the document.
  const labelFor = (n) => {
    try {
      if (!n.id) return '';
      const l = (n.getRootNode() || document).querySelector('label[for="' + CSS.escape(n.id) + '"]');
      return l ? l.textContent || '' : '';
    } catch { return ''; }
  };
  const labelledBy = (n) => {
    try {
      const ids = (n.getAttribute && n.getAttribute('aria-labelledby')) || '';
      return ids.split(/\\s+/).filter(Boolean)
        .map((id) => { const e = document.getElementById(id); return e ? e.textContent || '' : ''; })
        .join(' ');
    } catch { return ''; }
  };
  const nameOf = (n) => [
    (n.getAttribute && n.getAttribute('aria-label')) || '',
    n.textContent || '',
    labelFor(n),
    labelledBy(n),
  ].join(' ').replace(/\\s+/g, ' ').trim();

  const toRe = (m) => (m instanceof RegExp ? m : new RegExp(String(m).replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'), 'i'));

  const CLICKABLE = 'button,a,[role=option],[role=menuitem],[role=button],[role=tab],[role=switch],[role=checkbox],[role=radio],li,input,label';

  // clickDeepest: rows are <LI><BUTTON>…</BUTTON></LI> and querySelectorAll
  // returns document order, so a naive first-match clicks the LI, the handler
  // never fires, and nothing errors — a silent wrong measurement. Pick the
  // candidate that contains no other candidate.
  const candidates = (match, root) => {
    const re = toRe(match);
    const scope = root || document;
    const all = [...scope.querySelectorAll(CLICKABLE)].filter((n) => vis(n) && re.test(nameOf(n)));
    return all.filter((c) => !all.some((o) => o !== c && c.contains(o)));
  };

  const clickDeepest = (match, root) => {
    const inner = candidates(match, root);
    const all = [...(root || document).querySelectorAll(CLICKABLE)].filter((n) => toRe(match).test(nameOf(n)));
    const el = inner[0] || null;
    if (!el) return { ok: false, why: all.length ? 'matched but not visible' : 'no match', seen: all.length };
    el.click();
    // Full name, never truncated: slicing this to 28 chars once cut " PM" off a
    // timestamp and nearly produced a 12-hour-clock finding.
    return { ok: true, name: nameOf(el), tag: el.tagName, testid: el.getAttribute('data-testid') || null };
  };

  // Radix poppers are not [role=option]/[role=menuitem]; items are plain nodes
  // under [data-radix-popper-content-wrapper], so an option-based locator reads
  // the menu as empty.
  const popperPick = (text) => {
    const re = toRe(text);
    const wraps = [...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(boxVis);
    for (const w of wraps.reverse()) {
      const hit = [...w.querySelectorAll('*')].filter((n) => !n.children.length && re.test((n.textContent || '').trim()));
      for (const h of hit) {
        let n = h;
        for (let i = 0; i < 4 && n; i++, n = n.parentElement) {
          if (n.getAttribute('role') || ['BUTTON', 'LI', 'A'].includes(n.tagName)) { n.click(); return { ok: true, via: n.tagName, text: (h.textContent || '').trim() }; }
        }
        h.click();
        return { ok: true, via: 'leaf', text: (h.textContent || '').trim() };
      }
    }
    return { ok: false, wrappers: wraps.length };
  };

  // Every user-visible message, not just the ones with a role.
  // BLIND SPOT: this is selector-scoped. It reads full subtree text, so it sees a notice
  // assembled from nested elements — but a prompt drawn on the call stage carrying none of
  // these selectors is invisible to it. For those, watch a panel's whole innerText instead.
  // Whichever you use, take the positive control with the SAME instrument: a control read
  // by a different selector does not license an absence found by this one. Enumerating only
  // role=status/alert/sonner misses plain inline error text and turns a rejected
  // input into a "silent failure" finding. Size is what separates a real notice
  // from an sr-only companion — a 1x1 sr-only span still passes a hit test at
  // its own centre, so never use the hit test for that.
  const NOTICE_SEL = [
    '[role=status]', '[role=alert]', '[data-sonner-toast]', '[aria-live]',
    '[aria-invalid="true"]', '[class*="error" i]', '[class*="invalid" i]', '[class*="destructive" i]',
  ].join(',');

  const notices = () =>
    [...document.querySelectorAll(NOTICE_SEL)]
      .filter((n) => boxVis(n))
      .map((n) => {
        const r = rect(n);
        return {
          text: (n.innerText || n.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 200),
          w: Math.round(r.width), h: Math.round(r.height),
          opacity: Math.round(opacity(n) * 100) / 100,
          role: n.getAttribute('role') || null,
        };
      })
      .filter((x) => x.text && x.w > 2 && x.h > 2);   // drop 1x1 sr-only companions

  window.__qa = { vis, boxVis, opacity, nameOf, candidates, clickDeepest, popperPick, notices };
  return true;
})()`;

const installDom = async (page) => { await page.evaluate(DOM); };

// safeClick: scroll it into view, RE-READ the box, prove the element is the thing
// at its own centre, then click.
//
// Re-reading is the point: the pre-scroll box is stale, and clicking stale
// coordinates puts the click nowhere while every state check still says the
// control is fine. It reports two failures separately on purpose:
//   'off-viewport' — elementFromPoint returned null, the point is outside the
//                    viewport, the scroll did not take. A RIG problem.
//   'covered'      — a different element is on top. Possibly a REAL finding.
// Collapsing those into "click failed" is what gets the wrong bug filed.
export async function safeClick(page, selector, { timeout = 5000, index = 0 } = {}) {
  const loc = page.locator(selector).nth(index);
  if (!(await loc.count())) return { ok: false, reason: 'no-match', selector };
  try { await loc.scrollIntoViewIfNeeded({ timeout }); } catch { /* fixed/overlay elements cannot scroll; carry on */ }
  await installDom(page);
  const probe = await loc.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const inView = cx >= 0 && cy >= 0 && cx <= innerWidth && cy <= innerHeight;
    const top = inView ? document.elementFromPoint(cx, cy) : null;
    const desc = (n) => n ? (n.tagName + (n.getAttribute('data-testid') ? '[' + n.getAttribute('data-testid') + ']' : '') + (n.className && typeof n.className === 'string' ? '.' + n.className.split(/\s+/)[0] : '')) : null;
    return {
      box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
      viewport: { w: innerWidth, h: innerHeight },
      inView,
      self: top === el || el.contains(top) || (top && top.contains(el)),
      top: desc(top),
      name: window.__qa.nameOf(el),
    };
  });
  if (!probe.inView || probe.top === null) return { ok: false, reason: 'off-viewport', ...probe };
  if (!probe.self) return { ok: false, reason: 'covered', ...probe };
  await loc.click();
  return { ok: true, ...probe };
}

// waitClick: poll until a control is genuinely visible, then safeClick it.
// Returns the elapsed time at which it appeared — frequently the measurement
// itself ("the admit button appeared at 9.3s"), not just plumbing.
export async function waitClick(page, selector, { timeout = 30000, everyMs = 200, index = 0 } = {}) {
  const t0 = Date.now();
  for (;;) {
    const r = await safeClick(page, selector, { index });
    if (r.ok) return { ...r, appearedMs: Date.now() - t0 };
    if (Date.now() - t0 > timeout) return { ...r, timedOut: true, waitedMs: Date.now() - t0 };
    await page.waitForTimeout(everyMs);
  }
}

// watchNotices: the toast recipe, as code.
// Poll from BEFORE the trigger, key each notice on text plus rounded size (one
// toast matches both [data-sonner-toast] and [role=alert] and would otherwise be
// counted twice), and keep the MAXIMUM opacity over its lifetime. A single
// sample after the action misses a toast that has already gone; recording only
// the first sighting catches it mid-fade-in at opacity 0. Both directions have
// produced false findings.
export async function watchNotices(page, { ms = 8000, everyMs = 150, trigger } = {}) {
  await installDom(page);
  const seen = new Map();
  const t0 = Date.now();
  const sample = async () => {
    let list = [];
    try { list = await page.evaluate(() => window.__qa.notices()); }
    catch { await installDom(page).catch(() => {}); return; }
    for (const n of list) {
      const key = `${n.text}|${n.w}x${n.h}`;
      const prev = seen.get(key);
      if (!prev) seen.set(key, { ...n, maxOpacity: n.opacity, firstMs: Date.now() - t0 });
      else prev.maxOpacity = Math.max(prev.maxOpacity, n.opacity);
    }
  };
  await sample();                        // baseline, before the trigger
  const fired = trigger ? trigger() : null;
  while (Date.now() - t0 < ms) { await sample(); await page.waitForTimeout(everyMs); }
  if (fired && typeof fired.then === 'function') await fired.catch(() => {});
  return [...seen.values()].map(({ opacity, ...n }) => n).sort((a, b) => a.firstMs - b.firstMs);
}
