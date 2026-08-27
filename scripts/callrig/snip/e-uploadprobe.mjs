export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const before = await page.evaluate(()=>document.querySelectorAll('input[type=file]').length);
  await page.locator('main button:has-text("Upload")').first().click();
  await page.waitForTimeout(2000);
  return await page.evaluate((before)=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=document.querySelector('[role=dialog],[role=menu]');
    return {fileInputsBefore:before, fileInputsAfter:document.querySelectorAll('input[type=file]').length,
      dialog: d? d.innerText.replace(/\n{2,}/g,' | ').slice(0,400):null,
      menuBtns: d? [...d.querySelectorAll('button,[role=menuitem],a')].filter(vis).map(b=>b.innerText.trim()).filter(Boolean).slice(0,12):[],
      mainTail:(document.querySelector('main').innerText||'').replace(/\n{2,}/g,' | ').slice(0,250)};
  }, before);
};
