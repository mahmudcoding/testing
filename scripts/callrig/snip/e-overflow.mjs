export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('main button').filter({hasText:/^Month$/}).first().click();
  await page.waitForTimeout(3500);
  const btn = page.locator('main button', {hasText:'+1 more'}).first();
  await btn.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await btn.click();
  await page.waitForTimeout(2500);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const pop=document.querySelector('[role=dialog],[role=tooltip],[data-radix-popper-content-wrapper]');
    return {opened:!!pop,
      txt: pop? pop.innerText.replace(/\n+/g,' | ').slice(0,300):null,
      allSyncsVisible:[...document.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0&&/QA-E Sync/.test(e.textContent))
        .map(e=>e.textContent.trim()).filter((v,i,a)=>a.indexOf(v)===i)};
  });
};
