/* Reload the lobby and record the complete bounded set of API requests it makes,
   with the room-settings body in full. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const out = { id, reqs: [] };
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\//.test(u)) return;
    let b = null; try { b = await r.text(); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(),
                len: b == null ? null : b.length, body: b });
  });
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  await page.evaluate(DOM);

  out.reqs = seen.map(r => ({ m: r.m, u: r.u, s: r.s, len: r.len }));
  // the room-settings body IN FULL, plus every key
  const rs = seen.find(r => /room[-_]?settings|settings/i.test(r.u));
  out.roomSettings = rs ? { u: rs.u, s: rs.s, bodyFull: rs.body } : null;
  const mt = seen.find(r => new RegExp(`/meeting/${id}$`).test(r.u.split('?')[0]));
  out.meeting = mt ? { u: mt.u, s: mt.s, bodyFull: mt.body } : null;

  out.lobbyConsent = await page.evaluate(() => {
    const q = window.__qa;
    const scope = document.querySelector('[data-testid="lobby-page"]') || document.body;
    return {
      lobbyPresent: !!document.querySelector('[data-testid="lobby-page"]'),
      checkboxes: [...document.querySelectorAll('input[type=checkbox],[role=checkbox]')].map(e => ({
        vis: q.vis(e), l: (e.getAttribute('aria-label')||e.closest('label')?.textContent||'').trim().slice(0,60) })),
      recordingLeaves: [...scope.querySelectorAll('*')].filter(e=>e.children.length===0 && q.vis(e))
        .map(e=>e.textContent.trim()).filter(t=>/record|consent|acknowledg/i.test(t)),
      allLeaves: [...new Set([...scope.querySelectorAll('*')].filter(e=>e.children.length===0 && q.vis(e))
        .map(e=>e.textContent.trim()).filter(Boolean))],
    };
  });
  return out;
};
