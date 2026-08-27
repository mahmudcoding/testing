import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const out = {};
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(600);
  await page.evaluate(DOM);
  await page.locator('button[aria-label="Add to call"]').first().click({timeout:15000}).catch(e=>out.err=String(e).slice(0,120));
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  out.rows = await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null;
    const cbs=[...d.querySelectorAll('input[type=checkbox]')];
    return cbs.map(cb => {
      let row=cb, txt='';
      for (let i=0;i<6&&row;i++,row=row.parentElement){ const t=(row.innerText||'').trim(); if(/Q[A-Z]\s+QA /.test(t)){ txt=t.replace(/\s+/g,' ').slice(0,44); break; } }
      return { row: txt, disabled: cb.disabled, checked: cb.checked };
    });
  });
  const want = process.env.QA_PICK;
  if (want) {
    const hit = await page.evaluate((w) => {
      const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
      const cbs=[...d.querySelectorAll('input[type=checkbox]')];
      for (const cb of cbs) { let row=cb;
        for (let i=0;i<6&&row;i++,row=row.parentElement){ if((row.innerText||'').includes(w)) {
          const target = cb.getBoundingClientRect().width>1 ? cb : row;
          target.scrollIntoView({block:'center'}); const r=target.getBoundingClientRect();
          return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2), disabled: cb.disabled, w:Math.round(r.width)}; } } }
      return null;
    }, want);
    out.pick = hit;
    if (hit) { await page.mouse.click(hit.x,hit.y); await page.waitForTimeout(1500); }
    await page.evaluate(DOM);
    out.after = await page.evaluate(() => {
      const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
      return { invite: [...d.querySelectorAll('button')].filter(window.__qa.vis).map(b=>({n:(b.innerText||'').trim().slice(0,20),dis:b.disabled})).filter(b=>/^Invite/.test(b.n)),
               checked: [...d.querySelectorAll('input[type=checkbox]')].filter(c=>c.checked).length };
    });
  }
  return out;
};
