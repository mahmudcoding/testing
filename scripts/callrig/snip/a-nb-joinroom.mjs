import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const room = process.env.QA_ROOM || 'Room B';
  const out = {};
  const t = page.locator('[data-testid="call-controls-breakout-rooms"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2200); }
  out.panel = await page.evaluate(()=>{ const p=document.querySelector('[data-testid="call-side-panel-slot"]'); return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,300):null; });
  out.click = await page.evaluate(([r,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {err:'no panel'};
    const cards=[...p.querySelectorAll('li,div')].filter(vis).filter(e=>(e.innerText||'').includes(r))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    for (const c of cards) {
      const b=[...c.querySelectorAll('button')].filter(vis).find(x=>/^(Join|Enter|Return)$/i.test((x.innerText||'').trim()));
      if (b) { b.click(); return {ok:true, label:(b.innerText||'').trim(), card:(c.innerText||'').replace(/\s+/g,' ').slice(0,60)}; }
    }
    return {err:'no join button', cards: cards.slice(0,3).map(c=>(c.innerText||'').replace(/\s+/g,' ').slice(0,80))};
  }, [room, VIS]);
  await page.waitForTimeout(7000);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]');
    return {txt:(ov?ov.innerText:'').replace(/\s+/g,' ').slice(0,220),
      tabs:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||'').trim()).filter(l=>/Main call|Side Room/.test(l))}; }, VIS);
  return out;
}
