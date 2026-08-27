import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  const pressed = await t.getAttribute('aria-pressed');
  if (pressed !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  return await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {err:'no panel'};
    const kids=[...p.querySelectorAll('*')].filter(vis)
      .filter(e=>/QA (Alice|Bob|Carol|Dave)/.test(e.innerText||''))
      .filter(e=>(e.innerText||'').length<60)
      .map(e=>({tag:e.tagName.toLowerCase(), tid:e.getAttribute('data-testid'), cls:String(e.className||'').slice(0,40), txt:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,50)}));
    return {pressed:'opened', txt:(p.innerText||'').replace(/\s+/g,' ').slice(0,300), kids:kids.slice(0,14)}; }, VIS);
}
