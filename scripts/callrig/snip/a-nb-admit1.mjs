import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Bob';
  const r = await page.evaluate(([name,v])=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('aria-label')||'')==='Admit '+name);
    if(!b) return {err:'no admit btn', have:[...document.querySelectorAll('button')].filter(vis).map(x=>x.getAttribute('aria-label')).filter(l=>l&&/admit/i.test(l))};
    b.click(); return {ok:true}; }, [who, VIS]);
  await page.waitForTimeout(5000);
  const panel = await page.evaluate((v)=>{ const p=document.querySelector('[data-testid="call-side-panel-slot"]'); return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,260):null; }, VIS);
  return {r, panel};
}
