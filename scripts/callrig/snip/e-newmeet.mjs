export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.click('button[aria-label="New meeting"]').catch(()=>page.click('text=New meeting'));
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const dlg = document.querySelector('[role=dialog]')||document.body;
    return {
      txt: dlg.innerText.replace(/\n{2,}/g,' | ').slice(0,1200),
      inputs: [...dlg.querySelectorAll('input,textarea,select')].filter(vis).map(i=>({t:i.type,ph:i.placeholder,al:i.getAttribute('aria-label'),name:i.name,v:(i.value||'').slice(0,30)})),
      btns: [...dlg.querySelectorAll('button,[role=switch],[role=tab]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(Boolean).slice(0,40)
    };
  });
};
