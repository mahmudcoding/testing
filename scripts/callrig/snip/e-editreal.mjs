export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Sync 2'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  await chip.click(); await page.waitForTimeout(3200);
  const snap=()=>page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden';};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    return {n:ds.length, inputs:ds.reduce((a,d)=>a+[...d.querySelectorAll('input,textarea')].filter(vis).length,0),
      submits:ds.reduce((a,d)=>a+[...d.querySelectorAll('button[type=submit]')].filter(vis).length,0),
      heads:ds.map(d=>d.innerText.split('\n').filter(Boolean)[0]||'').slice(0,3),
      toasts:[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')].filter(vis).map(t=>t.innerText.replace(/\n/g,' ').slice(0,60)).filter(Boolean)};
  });
  const before = await snap();
  const btn = page.locator('[role=dialog] button').filter({hasText:/^Edit$/}).first();
  const cnt = await btn.count();
  const info = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const b=[...document.querySelectorAll('[role=dialog] button')].filter(vis).find(x=>/^Edit$/.test(x.innerText.trim()));
    if(!b) return null; const r=b.getBoundingClientRect();
    return {disabled:b.disabled, ariaDisabled:b.getAttribute('aria-disabled'), pe:getComputedStyle(b).pointerEvents,
      rect:{w:Math.round(r.width),h:Math.round(r.height),top:Math.round(r.top),left:Math.round(r.left)},
      atCentre:(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)||{}).tagName,
      atCentreTxt:((document.elementFromPoint(r.left+r.width/2,r.top+r.height/2)||{}).innerText||'').slice(0,20)};
  });
  const samples=[];
  await btn.click({timeout:15000}).catch(e=>samples.push('CLICKERR:'+String(e).slice(0,60)));
  for(let i=0;i<14;i++){ await page.waitForTimeout(500); samples.push(await snap()); }
  return {clickTargetCount:cnt, btnInfo:info, before, after:samples[samples.length-1],
    inputsTrace:samples.filter(s=>typeof s==='object').map(s=>s.inputs).join(','),
    dialogTrace:samples.filter(s=>typeof s==='object').map(s=>s.n).join(''),
    errs:samples.filter(s=>typeof s==='string')};
};
