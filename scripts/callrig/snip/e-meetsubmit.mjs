export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const net=[];
  page.on('response', async r => { if (/\/calendar\/meetings|\/meeting/.test(r.url())) net.push({m:r.request().method(), u:r.url().slice(-70), s:r.status(), b:(await r.text().catch(()=>'')).slice(0,250)}); });
  await page.goto(`https://airion-cargo.store/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.locator('main button:has-text("New meeting")').first().click();
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => {
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const dlg=document.querySelector('[role=dialog]');
    const ins=[...dlg.querySelectorAll('input,textarea')].filter(vis);
    const sub=[...dlg.querySelectorAll('button')].filter(vis).filter(b=>/schedule meeting/i.test(b.innerText));
    return {
      inputs0to3: ins.slice(0,4).map((i,n)=>({n,t:i.type,ph:i.placeholder,al:i.getAttribute('aria-label'),v:i.value})),
      submits: sub.map(b=>({txt:b.innerText.trim(),disabled:b.disabled,type:b.type,rect:b.getBoundingClientRect().top}))
    };
  });
  return {info, net};
};
