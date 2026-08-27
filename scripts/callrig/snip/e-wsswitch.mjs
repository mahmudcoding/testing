export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/directories`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2200);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog],[role=menu]')||document.body;
    return {txt:d.innerText.replace(/\n{2,}/g,' | ').slice(0,450),
      items:[...d.querySelectorAll('button,a,[role=menuitem]')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||b.innerText).replace(/\n/g,' ').trim()).filter(Boolean).slice(0,16)};
  });
};
