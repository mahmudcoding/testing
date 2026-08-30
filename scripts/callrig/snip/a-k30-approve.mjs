/* Count DISTINCT notices (text + rounded rect, per CLAUDE.md) then open the
   waiting-room approval surface via Review and describe it fully. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  out.notices = await page.evaluate(() => {
    const q = window.__qa;
    const nodes = [...document.querySelectorAll('[data-sonner-toast],[role=alert],[role=status]')];
    return nodes.map(e => {
      const r = e.getBoundingClientRect();
      return { sel: e.getAttribute('data-sonner-toast') !== null ? 'sonner' : e.getAttribute('role'),
               vis: q.boxVis(e), w: Math.round(r.width), h: Math.round(r.height),
               x: Math.round(r.x), y: Math.round(r.y), t: e.innerText.trim().slice(0, 60) };
    }).filter(n => n.t);
  });
  out.distinctNotices = [...new Set(out.notices.filter(n=>n.vis && n.w>1 && n.h>1)
    .map(n => `${n.t}|${n.w}x${n.h}@${n.x},${n.y}`))];

  // press Review
  const r = await page.evaluate(() => window.__qa.clickDeepest(/^Review$/));
  out.reviewClick = r.ok ? r.name : r.why;
  await page.waitForTimeout(2500);
  out.panel = await page.evaluate(() => {
    const q = window.__qa;
    const vis = [...document.querySelectorAll('*')].filter(e => q.vis(e));
    const dlg = [...document.querySelectorAll('[role=dialog]')].filter(e=>q.boxVis(e))
      .filter(e => e.querySelectorAll('button').length <= 14);
    return {
      dialogs: dlg.map(d => ({ text: d.innerText.replace(/\n{2,}/g,'\n').slice(0,400),
        buttons: [...d.querySelectorAll('button')].filter(e=>q.vis(e))
          .map(e=>({tid:e.getAttribute('data-testid'), l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,35)})) })),
      waitingTestids: [...new Set(vis.map(e=>e.getAttribute('data-testid')).filter(Boolean))]
        .filter(t=>/wait|approv|admit/i.test(t)),
      // the panel may be a side panel, not a dialog: find the smallest visible element
      // holding both the waiting person's name and an Admit/Approve control
      rows: (() => {
        const cands = vis.filter(e => /QA Bob/.test(e.textContent||'') &&
          [...e.querySelectorAll('button')].some(b => /admit|approve|accept|deny|reject|decline/i.test(b.textContent||b.getAttribute('aria-label')||'')));
        cands.sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length);
        return cands.slice(0,2).map(e => ({ tag:e.tagName, tid:e.getAttribute('data-testid'),
          t: e.innerText.replace(/\n{2,}/g,'\n').slice(0,200),
          buttons: [...e.querySelectorAll('button')].filter(x=>q.vis(x))
            .map(x=>({tid:x.getAttribute('data-testid'), l:(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,30)})) }));
      })(),
    };
  });
  return out;
};
