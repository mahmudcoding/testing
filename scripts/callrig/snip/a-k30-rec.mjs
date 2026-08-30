/* Alice: start recording. Enumerate controls first, then drive the record path. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = { api: [] };
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\//.test(u) || r.request().method() === 'GET') return;
    let b = null; try { b = (await r.text()).slice(0, 300); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(), res: b });
  });
  await page.evaluate(DOM);
  const enumerate = () => page.evaluate(() => {
    const q = window.__qa;
    return [...document.querySelectorAll('button,[role=button],[role=menuitem]')]
      .filter(e => q.vis(e))
      .map(e => ({ tid: e.getAttribute('data-testid') || null,
                   l: (e.getAttribute('aria-label') || e.textContent || '').trim().slice(0, 45),
                   dis: e.disabled === true || e.getAttribute('aria-disabled') === 'true' }))
      .filter(x => x.l || x.tid);
  });
  out.controlsBefore = await enumerate();
  out.recCandidates = out.controlsBefore.filter(c => /record/i.test(c.l) || /record/i.test(c.tid || ''));
  return out;
};
