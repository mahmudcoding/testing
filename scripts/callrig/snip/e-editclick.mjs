export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const probe = async () => {
    await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Sync 2'}).first();
    await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
    await chip.click(); await page.waitForTimeout(3500);
    // click Edit by coordinates from a fresh measurement
    const pos = await page.evaluate(()=>{
      const d=document.querySelector('[role=dialog]'); if(!d) return null;
      const b=[...d.querySelectorAll('button')].find(x=>/^Edit$/.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
      if(!b) return null; const r=b.getBoundingClientRect();
      return {x:r.left+r.width/2, y:r.top+r.height/2, w:Math.round(r.width)};
    });
    if(!pos) return {noEdit:true};
    await page.mouse.click(pos.x, pos.y);
    const trace=[];
    for(let i=0;i<12;i++){ await page.waitForTimeout(500);
      trace.push(await page.evaluate(()=>{
        const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
        const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
        const ins=ds.reduce((a,d)=>a+[...d.querySelectorAll('input,textarea')].filter(vis).length,0);
        return ins;
      }));
    }
    const final = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
      return {dialogs:ds.length, heads:ds.map(d=>d.innerText.split('\n').filter(Boolean)[0]||''),
        inputs:ds.flatMap(d=>[...d.querySelectorAll('input')].filter(vis).map(i=>i.getAttribute('aria-label')||i.type)).slice(0,6)};
    });
    return {pos:{w:pos.w}, inputsTrace:trace.join(','), final};
  };
  return {run1: await probe(), run2: await probe()};
};
