import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const which = process.env.QA_EMOJI || '👏';
  const n = Number(process.env.QA_TIMES || 1);
  const out={sent:[]};
  for (let i=0;i<n;i++){
    await page.mouse.move(700,500); await page.waitForTimeout(300);
    await page.keyboard.press('Escape').catch(()=>{});
    const b = page.locator('button[aria-label="Send reaction"]').first();
    if (!(await b.count())) return {err:'no reaction button'};
    await b.click(); await page.waitForTimeout(1200);
    const r = await page.evaluate(([em,v])=>{ const vis=eval(v);
      const ms=[...document.querySelectorAll('[role="menu"],[role="dialog"],[data-radix-popper-content-wrapper]')].filter(vis)
        .filter(m=>m.getAttribute('data-testid')!=='call-overlay-expanded');
      const m=ms[ms.length-1]; if(!m) return {err:'no popover'};
      const i=[...m.querySelectorAll('button')].filter(vis).find(x=>(x.textContent||'').trim()===em);
      if(!i) return {err:'no '+em}; i.click(); return {ok:true, at:Date.now()}; }, [which, VIS]);
    out.sent.push(r);
    await page.waitForTimeout(1500);
  }
  return out;
};
