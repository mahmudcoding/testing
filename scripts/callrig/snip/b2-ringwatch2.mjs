import { waitForChange } from './watch.mjs';
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Dave';
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  // Open the invite dialog by the path that is known to work, then PROVE the row is there.
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>(x.getAttribute('aria-label')||'')==='Add to call');
    if(b) b.click(); }, V);
  await page.waitForTimeout(3500);
  const rowNow = await page.evaluate((w)=>{
    const t=[...document.querySelectorAll('input[type=checkbox]')].find(c=>(c.getAttribute('aria-label')||'')===w);
    if(!t) return null;
    let row=t; for(let k=0;k<5&&row.parentElement;k++){ row=row.parentElement; if((row.innerText||'').trim().length>2) break; }
    return `${(row.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)} | disabled=${t.disabled}`;
  }, who);
  if(!rowNow) return {aborted:'row not on screen — dialog did not open', rowNow};

  const r = await waitForChange(page, {
    arg: who,
    predicate: (w) => {
      const t=[...document.querySelectorAll('input[type=checkbox]')].find(c=>(c.getAttribute('aria-label')||'')===w);
      if(!t) return 'ROW-NOT-FOUND';
      let row=t; for(let k=0;k<5&&row.parentElement;k++){ row=row.parentElement; if((row.innerText||'').trim().length>2) break; }
      return `${(row.innerText||'').replace(/\s+/g,' ').trim().slice(0,40)} | disabled=${t.disabled}`;
    },
    timeoutMs: Number(process.env.QA_WATCH_MS || 300000),
    everyMs: 1000,
  });
  return {startedFrom: rowNow, ...r};
};
