/* Who does the host see in the call, on the wire and on screen?
   Probes both projections of the participants route. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const out = {};
  await page.evaluate(DOM);
  out.api = await page.evaluate(async (cid) => {
    const urls = [
      `/api/v1/meeting/${cid}/participants`,
      `/api/v1/meeting/${cid}/participants?projection=actor`,
      `/api/v1/meeting/${cid}/participants?type=actor`,
      `/api/v1/meeting/${cid}/participants?include=guests`,
      `/api/v1/meeting/${cid}/participants/actors`,
    ];
    const r = {};
    for (const u of urls) {
      try { const res = await fetch(u, {credentials:'include'}); r[u.replace(`/api/v1/meeting/${cid}`,'')] = { s: res.status, b: (await res.text()).slice(0,700) }; }
      catch(e){ r[u] = { err:String(e) }; }
    }
    return r;
  }, id);
  out.screen = await page.evaluate(() => {
    const q = window.__qa;
    return { tiles: [...document.querySelectorAll('[data-testid="participant-name"]')].filter(e=>q.vis(e)).map(e=>e.textContent.trim()),
             guestBadges: document.querySelectorAll('[data-testid="participant-tile-guest-badge"]').length,
             url: location.pathname };
  });
  return out;
};
