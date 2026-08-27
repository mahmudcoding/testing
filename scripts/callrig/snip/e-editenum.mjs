export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const probe = async () => {
    await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Sync 2'}).first();
    await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
    await chip.click(); await page.waitForTimeout(3500);
    const pos = await page.evaluate(()=>{
      const d=document.querySelector('[role=dialog]');
      const b=[...d.querySelectorAll('button')].find(x=>/^Edit$/.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
      if(!b) return null; const r=b.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2};
    });
    if(!pos) return {noEditBtn:true};
    await page.mouse.click(pos.x,pos.y);
    await page.waitForTimeout(4500);
    return await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden';};
      const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
      const ed=ds.find(d=>/Edit meeting/.test(d.innerText));
      if(!ed) return {noform:true};
      return {
        buttons: [...ed.querySelectorAll('button,[role=button],[role=combobox]')].filter(vis)
          .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\n/g,'⏎').trim().slice(0,34)).filter(Boolean),
        inputs: [...ed.querySelectorAll('input,textarea,select')].filter(vis)
          .map(i=>`${i.type}${i.getAttribute('aria-label')?'['+i.getAttribute('aria-label')+']':''}${i.placeholder?'("'+i.placeholder+'")':''}`),
        timeDateCount: ed.querySelectorAll('input[type=time],input[type=date],input[type=datetime-local]').length,
        hasWhenWord: /\bWhen\b|Starts|Ends|Duration/.test(ed.innerText),
        firstLines: ed.innerText.split('\n').filter(Boolean).slice(0,14).join(' | ')
      };
    });
  };
  return {run1: await probe(), run2: await probe()};
};
