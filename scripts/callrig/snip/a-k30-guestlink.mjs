/* Find and read the guest link as host. Enumerate the in-call controls, open the
   people/add-to-call surface, and capture the guest URL. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  out.toolbar = await page.evaluate(() => {
    const q = window.__qa;
    return [...document.querySelectorAll('button,[role=button]')].filter(e=>q.vis(e))
      .map(e=>({ tid:e.getAttribute('data-testid'), l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40) }))
      .filter(x=>x.l||x.tid);
  });
  // the API the guest link lives behind
  const id = (page.url().match(/\/call\/([^/?#]+)/)||[])[1];
  out.callId = id;
  out.api = await page.evaluate(async (cid) => {
    const paths = [`/api/v1/meeting/${cid}/guest-link`, `/api/v1/meeting/${cid}/guest_link`,
                   `/api/v1/meeting/${cid}/invite-link`, `/api/v1/meeting/${cid}/settings`];
    const r = {};
    for (const p of paths) {
      try { const res = await fetch(p, { credentials:'include' }); r[p] = { s: res.status, b: (await res.text()).slice(0,400) }; }
      catch(e) { r[p] = { err:String(e) }; }
    }
    return r;
  }, id);
  return out;
};
