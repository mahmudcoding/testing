export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const chip = page.locator('button[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Sync 2'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(600);
  await chip.click(); await page.waitForTimeout(3500);
  const pos = await page.evaluate(()=>{
    const d=document.querySelector('[role=dialog]');
    const b=[...d.querySelectorAll('button')].find(x=>/^Edit$/.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
    const r=b.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2};
  });
  await page.mouse.click(pos.x,pos.y);
  await page.waitForTimeout(4000);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const ed=ds.find(d=>/Edit meeting/.test(d.innerText));
    if(!ed) return {noform:true};
    return {head:ed.innerText.split('\n').filter(Boolean).slice(0,2).join(' | '),
      fields:[...ed.querySelectorAll('input,textarea')].filter(vis).slice(0,8)
        .map(i=>({al:i.getAttribute('aria-label'), ph:i.placeholder, t:i.type, v:(i.value||'').slice(0,30), checked:i.checked})),
      tail:ed.innerText.replace(/\n{2,}/g,' | ').slice(-220)};
  });
};
