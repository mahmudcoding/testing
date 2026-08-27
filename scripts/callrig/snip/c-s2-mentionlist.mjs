export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
  await comp.click(); await comp.type('@',{delay:60}); await page.waitForTimeout(2500);
  const out=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const opts=[...document.querySelectorAll('[role="option"],[role="listbox"] li,[data-radix-popper-content-wrapper] li')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,42));
    const anyList=[...document.querySelectorAll('[role="listbox"],[role="menu"],[data-radix-popper-content-wrapper]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,150));
    return {options:opts.slice(0,12), rawPanels:anyList.slice(0,2)};});
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  return out;
};
