// Waits QA_HOLD seconds, then stops the recording, pinning the call clock either side.
export default async ({page}) => {
  const HOLD=Number(process.env.QA_HOLD||100);
  const V=`el => { let n=el, op=1; while(n && n!==document.documentElement){ const c=getComputedStyle(n); if(c.display==='none'||c.visibility==='hidden') return false; op*=parseFloat(c.opacity||'1'); n=n.parentElement; } const r=el.getBoundingClientRect(); return op>0.05 && r.width>0 && r.height>0; }`;
  const clock = () => page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[data-testid="call-duration"]')].filter(vis).pop();
    const b=[...document.querySelectorAll('[data-testid="call-recording-badge"]')].filter(vis).pop();
    return {clock:d?(d.innerText||'').trim():null, badge:b?(b.innerText||'').replace(/\s+/g,' ').trim():null, wall:new Date().toISOString()}; }, V);
  const t0=Date.now();
  while((Date.now()-t0)/1000 < HOLD) await page.waitForTimeout(1000);
  const before = await clock();
  const stopped = await page.evaluate((v)=>{ const vis=eval(v);
    const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^stop recording$/i.test((x.innerText||'').trim())
      || (x.getAttribute('aria-label')||'')==='Stop recording');
    if(b){ b.click(); return true; } return false; }, V);
  await page.waitForTimeout(6000);
  const after = await clock();
  return {before, stopped, after};
};
