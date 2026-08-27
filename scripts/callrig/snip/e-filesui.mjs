export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const listing = () => page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    const t=m.innerText;
    const tail=t.split('Size')[1]||t.slice(-300);
    return tail.replace(/\n{2,}/g,' | ').slice(0,300);
  });
  const out={};
  out.default = await listing();
  for (const b of ['Images','Documents','Videos','Shared with me']) {
    await page.locator(`main button:has-text("${b}")`).first().click().catch(()=>{});
    await page.waitForTimeout(2200);
    out[b] = await listing();
  }
  // back to my files, test sort
  await page.locator('main button:has-text("My files")').first().click().catch(()=>{});
  await page.waitForTimeout(1500);
  await page.locator('main button:has-text("All files")').first().click().catch(()=>{});
  await page.waitForTimeout(1800);
  for (const s of ['Name','Size','Date']) {
    await page.locator(`main button:has-text("${s}")`).first().click().catch(()=>{});
    await page.waitForTimeout(1800);
    out['sort:'+s] = await listing();
  }
  return out;
};
