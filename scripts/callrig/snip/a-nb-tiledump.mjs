import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Carol';
  await page.mouse.move(700,400); await page.waitForTimeout(400);
  return await page.evaluate(([name,v])=>{ const vis=eval(v);
    const cls = e => String(e.className && e.className.baseVal!==undefined ? e.className.baseVal : (e.className||''));
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const tiles=[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis);
    const t=tiles.find(x=>(x.innerText||'').includes(name));
    if(!t) return {err:'no tile', have:tiles.map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(0,30))};
    const r=t.getBoundingClientRect();
    return {box:`${Math.round(r.width)}x${Math.round(r.height)}`,
      text:(t.innerText||'').replace(/\s+/g,' ').slice(0,120),
      nodes:[...t.querySelectorAll('*')].filter(vis).map(y=>({
        tag:y.tagName.toLowerCase(), tid:y.getAttribute('data-testid'), al:y.getAttribute('aria-label'),
        title:y.getAttribute('title'), cls:cls(y).slice(0,60),
        txt:(y.childElementCount===0?(y.textContent||'').trim().slice(0,30):'')
      })).filter(y=>y.tid||y.al||y.title||y.txt||y.tag==='svg').slice(0,40)};
  }, [who, VIS]);
};
