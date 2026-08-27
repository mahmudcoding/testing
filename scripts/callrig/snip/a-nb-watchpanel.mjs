import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const MS = Number(process.env.QA_MS || 30000);
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2000); }
  return await page.evaluate(async ([v, ms])=>{ const vis=eval(v); const out=[]; const t0=Date.now(); let last='';
    while(Date.now()-t0<ms){
      const p=document.querySelector('[data-testid="call-side-panel-slot"]');
      const txt=p?(p.innerText||'').replace(/\s+/g,' ').slice(0,300):null;
      if(txt!==last){ out.push({ms:Date.now()-t0, txt}); last=txt; }
      await new Promise(r=>setTimeout(r,500)); }
    return out; }, [VIS, MS]);
}
