import { DOM } from './lib.mjs';
const ROWS = `(() => {
  const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
    .filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
  if(!d) return null;
  return [...d.querySelectorAll('input[type=checkbox]')].map((cb,i) => {
    let row=cb, txt='';
    for (let k=0;k<6&&row;k++,row=row.parentElement){ const t=(row.innerText||'').trim();
      if(/^Q[A-Z]\\s+QA /.test(t) && t.length < 60){ txt=t.replace(/\\s+/g,' '); break; } }
    return { i, row: txt, disabled: cb.disabled, checked: cb.checked };
  });
})()`;
export default async ({ page }) => {
  const out = {};
  await page.evaluate(DOM);
  out.before = await page.evaluate(ROWS);
  const want = process.env.QA_PICK;
  if (want) {
    const hit = await page.evaluate((w) => {
      const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
        .filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
      const cbs=[...d.querySelectorAll('input[type=checkbox]')];
      for (const cb of cbs) {
        let row=cb, txt='';
        for (let k=0;k<6&&row;k++,row=row.parentElement){ const t=(row.innerText||'').trim();
          if(/^Q[A-Z]\s+QA /.test(t) && t.length < 60){ txt=t.replace(/\s+/g,' '); break; } }
        if (!txt.includes(w)) continue;
        const target = cb.getBoundingClientRect().width>1 ? cb : row;
        target.scrollIntoView({block:'center'}); const r=target.getBoundingClientRect();
        return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2), row:txt, disabled:cb.disabled};
      }
      return null;
    }, want);
    out.pick = hit;
    if (hit) { await page.mouse.click(hit.x,hit.y); await page.waitForTimeout(1500); }
    await page.evaluate(DOM);
    out.after = await page.evaluate(ROWS);
    out.inviteBtn = await page.evaluate(() => {
      const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis)
        .filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
      return [...d.querySelectorAll('button')].filter(window.__qa.vis).map(b=>({n:(b.innerText||'').trim().slice(0,20),dis:b.disabled})).filter(b=>/^Invite/.test(b.n));
    });
  }
  return out;
};
