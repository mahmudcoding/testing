import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Carol';
  return await page.evaluate(([n,v])=>{ const vis=eval(v);
    const rows=[...document.querySelectorAll('[data-testid="participant-row"]')].filter(vis);
    const row=rows.find(r=>(r.innerText||'').includes(n));
    if(!row) return {err:'no row'};
    const rr=row.getBoundingClientRect();
    const clipped=[];
    for (const e of row.querySelectorAll('*')) {
      if (e.childElementCount) continue;
      const t=(e.textContent||'').trim(); if(!t) continue;
      if(!vis(e)) continue;
      const r=e.getBoundingClientRect();
      if (r.width <= 24) continue;                          // corrected rule: skip sr-only / 1px
      const cs=getComputedStyle(e);
      if (String(e.className||'').includes('sr-only')) continue;
      const dx=e.scrollWidth-e.clientWidth;
      if (dx > 1) clipped.push({txt:t.slice(0,30), w:Math.round(r.width), dx, ellipsis:cs.textOverflow==='ellipsis'});
    }
    return {rowW:Math.round(rr.width), rowH:Math.round(rr.height),
      overflowX: row.scrollWidth - row.clientWidth,
      clipped}; }, [who, VIS]);
}
