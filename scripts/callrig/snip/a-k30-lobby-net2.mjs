import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const ws = 'W4QAF1XTURESO01';
  const out = {};
  const seen = [];
  page.on('response', async (r) => {
    const u = r.url();
    if (!/\/api\/v1\/.*meeting/i.test(u)) return;
    let b = null; try { b = await r.text(); } catch {}
    seen.push({ m: r.request().method(), u: u.replace(/^https?:\/\/[^/]+/, ''), s: r.status(), body: b });
  });
  await page.goto(`https://airion-cargo.store/w/${ws}/call/${id}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(10000);
  out.meetingReqs = seen;
  // ask the same endpoint directly from the page, as the same account
  out.direct = await page.evaluate(async (cid) => {
    const paths = [`/api/v1/meeting/${cid}/settings`, `/api/v1/meeting/${cid}/room-settings`,
                   `/api/v1/meeting/${cid}/room_settings`];
    const res = {};
    for (const p of paths) {
      try { const r = await fetch(p, { credentials: 'include' }); res[p] = { s: r.status, b: (await r.text()).slice(0, 600) }; }
      catch (e) { res[p] = { err: String(e) }; }
    }
    return res;
  }, id);
  return out;
};
