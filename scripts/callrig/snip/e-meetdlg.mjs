export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(500);
  await page.locator('main button:has-text("New meeting")').first().click();
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const dlg = document.querySelector('[role=dialog]')||document.body;
    const ins=[...dlg.querySelectorAll('input,textarea')].filter(vis);
    return {
      txt: dlg.innerText.replace(/\n{2,}/g,' | ').slice(0,900),
      first12: ins.slice(0,12).map((i,n)=>({n,t:i.type,ph:i.placeholder,al:i.getAttribute('aria-label'),name:i.name,v:(i.value||'').slice(0,30),ro:i.readOnly}))
    };
  });
};
