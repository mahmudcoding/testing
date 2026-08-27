import { waitForChange } from './watch.mjs';
export default async ({page}) => {
  // Re-open the invite dialog so the row is on screen, then watch it.
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  await page.evaluate((v)=>{ const vis=eval(v);
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis).pop();
    if(dlg && /Invite to this call/.test(dlg.innerText||'')) return;
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('aria-label')||'')==='Add to call');
    if(b) b.click(); }, V);
  await page.waitForTimeout(3000);

  const who = process.env.QA_WHO || 'QA Dave';
  const r = await waitForChange(page, {
    predicate: (w) => {
      const cbs=[...document.querySelectorAll('input[type=checkbox]')];
      const t=cbs.find(c=>(c.getAttribute('aria-label')||'')===w);
      if(!t) return 'ROW-NOT-FOUND';
      let row=t; for(let k=0;k<5&&row.parentElement;k++){ row=row.parentElement; const s=(row.innerText||'').trim(); if(s.length>2) break; }
      return `${(row.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)} | disabled=${t.disabled}`;
    },
    timeoutMs: Number(process.env.QA_WATCH_MS || 300000),
    everyMs: 1000,
  });
  return r;
};
