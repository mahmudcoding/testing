import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2000); }
  return await page.evaluate(([name,v])=>{ const vis=eval(v);
    const cls = e => String(e.className && e.className.baseVal!==undefined ? e.className.baseVal : (e.className||''));
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const tile=[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis)
      .find(x=>(x.innerText||'').includes(name));
    const row=[...document.querySelectorAll('[data-testid="participant-row"]')].filter(vis)
      .find(x=>(x.innerText||'').includes(name));
    const dump = e => e ? {
      text:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,80),
      rootCls: cls(e).slice(0,120),
      kids:[...e.querySelectorAll('*')].filter(vis).map(y=>({
        tag:y.tagName.toLowerCase(), tid:y.getAttribute('data-testid'), al:y.getAttribute('aria-label'),
        title:y.getAttribute('title'), cls:cls(y).slice(0,50),
        txt:(y.childElementCount===0?(y.textContent||'').trim().slice(0,28):'')
      })).filter(y=>y.tid||y.al||y.title||y.txt||y.tag==='svg')
    } : null;
    return {tile: dump(tile), row: dump(row)}; }, [who, VIS]);
}
