export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const out={};
  await page.locator('button[aria-label^="Search QA"]').first().click();
  await page.waitForTimeout(2200);
  out.emptyState = await page.evaluate(()=>{
    const d=document.querySelector('[role=dialog]');
    return d? d.innerText.replace(/\n{2,}/g,' | ').slice(0,450):null;
  });
  // run a search, close, reopen — do recents appear?
  const inp = page.locator('[role=dialog] input').first();
  await inp.fill('probe'); await page.waitForTimeout(2600);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  await page.locator('button[aria-label^="Search QA"]').first().click();
  await page.waitForTimeout(2200);
  out.afterSearch = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog]');
    if(!d) return null;
    return {txt:d.innerText.replace(/\n{2,}/g,' | ').slice(0,450),
      btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText).replace(/\n/g,' ').trim()).filter(Boolean).slice(0,16)};
  });
  return out;
};
