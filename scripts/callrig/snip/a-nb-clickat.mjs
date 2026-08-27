import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const lbl = process.env.QA_CLICK;
  const r = await page.evaluate(([l,v])=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis)
      .find(x=>new RegExp('^'+l+'$','i').test((x.getAttribute('aria-label')||x.innerText||'').trim()));
    if(!b) return {err:'not found'};
    const at=Date.now(); b.click(); return {ok:true, at, label:(b.getAttribute('aria-label')||b.innerText||'').trim()};
  }, [lbl, VIS]);
  await page.waitForTimeout(1200);
  // when does the host's own header lose "Recording"?
  const host = await page.evaluate(async (v)=>{ const vis=eval(v); const out=[]; const t0=Date.now(); let last=null;
    while(Date.now()-t0<30000){
      const ov=document.querySelector('[data-testid="call-overlay-expanded"]');
      const on = ov ? /(^|\s)Recording(\s|$)/.test((ov.innerText||'').split('\n').slice(0,4).join(' ')) : null;
      if(on!==last){ out.push({at:Date.now(), recording:on}); last=on; }
      await new Promise(r=>setTimeout(r,300)); }
    return out; }, VIS);
  return {click:r, hostHeader:host};
}
