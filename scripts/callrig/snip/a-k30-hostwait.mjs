/* Host side of an approval-gated call: what surfaces the waiting person, and where. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const id = process.env.K30_CALL;
  const out = {};
  await page.evaluate(DOM);
  out.api = await page.evaluate(async (cid) => {
    const paths = [`/api/v1/meeting/${cid}/waiting-participants`, `/api/v1/meeting/${cid}/waiting`,
                   `/api/v1/meeting/${cid}/participants`];
    const r = {};
    for (const p of paths) {
      try { const res = await fetch(p, { credentials: 'include' }); r[p] = { s: res.status, b: (await res.text()).slice(0,500) }; }
      catch (e) { r[p] = { err: String(e) }; }
    }
    return r;
  }, id);
  out.screen = await page.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e => q.vis(e));
    return {
      url: location.pathname,
      // whole-document text, searched not printed
      docLen: document.body.innerText.length,
      hasWaiting: /waiting|admit|approve|wants to join|knock/i.test(document.body.innerText),
      waitingMatches: [...new Set(vis.filter(e => /waiting|admit|approve|wants to join/i.test(e.textContent||''))
        .map(e => ({ tag:e.tagName, tid:e.getAttribute('data-testid'), len:(e.textContent||'').length, t:(e.textContent||'').trim().slice(0,70) }))
        .sort((a,b)=>a.len-b.len).slice(0,6).map(o=>JSON.stringify(o)))].map(s=>JSON.parse(s)),
      testids: [...new Set(vis.map(e=>e.getAttribute('data-testid')).filter(Boolean))]
        .filter(t=>/wait|approv|admit|people|participant/i.test(t)),
      // notices anywhere
      notices: [...document.querySelectorAll('[data-sonner-toast],[role=alert],[role=status]')]
        .filter(e=>q.boxVis(e)).map(e=>e.innerText.trim().slice(0,80)),
    };
  });
  return out;
};
