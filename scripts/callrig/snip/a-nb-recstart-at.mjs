import { VIS } from './a-nb-lib.mjs';
// Open Record dialog, click Start recording, stamp the moment of the submit click.
export default async ({page}) => {
  const out = {};
  await page.evaluate((v)=>{ const vis=eval(v);
    [...document.querySelectorAll('button')].filter(vis)
      .find(b=>/^Record$/i.test((b.getAttribute('aria-label')||b.innerText||'').trim())).click(); }, VIS);
  await page.waitForTimeout(3000);
  out.click = await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(x=>/Recording access/.test(x.innerText||'')).pop();
    if(!d) return {err:'no recording dialog'};
    const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Start recording$/i.test((x.innerText||'').trim()));
    if(!b) return {err:'no submit'};
    const at=Date.now(); b.click(); return {ok:true, at}; }, VIS);
  await page.waitForTimeout(1000);
  out.hostHeader = await page.evaluate(async (v)=>{ const vis=eval(v); const o=[]; const t0=Date.now(); let last=null;
    while(Date.now()-t0<30000){
      const ov=document.querySelector('[data-testid="call-overlay-expanded"]');
      const on = ov ? /(^|\s)Recording(\s|$)/.test((ov.innerText||'').split('\n').slice(0,4).join(' ')) : null;
      if(on!==last){ o.push({at:Date.now(), recording:on}); last=on; }
      await new Promise(r=>setTimeout(r,300)); }
    return o; }, VIS);
  return out;
}
