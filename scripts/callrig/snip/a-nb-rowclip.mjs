import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2000); }
  return await page.evaluate(([n,v])=>{ const vis=eval(v);
    const rows=[...document.querySelectorAll('[data-testid="participant-row"]')].filter(vis);
    const r=rows.find(x=>(x.innerText||'').includes(n)); if(!r) return {err:'no row', have:rows.map(x=>(x.innerText||'').trim().slice(0,20))};
    const b=r.getBoundingClientRect();
    const leaves=[...r.querySelectorAll('*')].filter(e=>!e.childElementCount).filter(vis);
    return {txt:(r.innerText||'').replace(/\s+/g,' ').trim(),
      box:`${Math.round(b.width)}x${Math.round(b.height)}`,
      rowOverflow: r.scrollWidth>r.clientWidth+1 ? r.scrollWidth+'>'+r.clientWidth : 'none',
      clippedLeaves: leaves.filter(e=>e.scrollWidth>e.clientWidth+1)
        .map(e=>e.tagName.toLowerCase()+':'+(e.textContent||'').trim().slice(0,14)+' '+e.scrollWidth+'>'+e.clientWidth),
      marks:[...r.querySelectorAll('[aria-label]')].map(x=>x.getAttribute('aria-label')),
      offscreen: leaves.filter(e=>{const q=e.getBoundingClientRect(); return q.left>=innerWidth || q.right<=0;}).length}; }, [who, VIS]);
};
